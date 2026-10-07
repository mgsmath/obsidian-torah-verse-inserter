// Modal de búsqueda e inserción de pesukim y textos de estudio.
import { App, Editor, Modal, Notice } from "obsidian";
import { BookInfo } from "./books";
import { formatBookReferenceInHebrew, formatRefLabel, parseRef } from "./refparse";
import { getVerses } from "./corpus";
import { searchText, SearchHit } from "./search";
import { formatHebrew, formatHebrewDafShort, formatHebrewLocation } from "./hebrew";
import {
	composeInsert,
	flowIntoSingleLine,
	footnoteDefinitionAppendix,
	nextFootnoteId,
} from "./compose";
import { currentLang, t } from "./i18n";
import {
	DEFAULT_SOURCES_FOLDER,
	GemaraSource,
	RambamSource,
	ensureSourceNotes,
	perekForDaf,
	sourceLink,
} from "./mekorot";
import type { PreparedSource, Source } from "./mekorot";
import { vaultWriter } from "./mekorot-vault";
import {
	lookupStudyHebrew,
	GEMARA_TRACTATES,
	gemaraTractateNames,
	matchStudyPrefix,
	RAMBAM_BOOKS,
} from "./study";
import type { RambamBook, StudyMode, StudyTopic } from "./study";
import type PasukPlugin from "./main";

interface ResultItem {
	label: string; // ej. "Génesis 1:1"
	book: BookInfo;
	chapter: number;
	verseStart: number;
	verseEnd: number;
	verses: string[]; // texto original
	preview: string;
	wholeChapter?: boolean;
}

interface StudyPassage {
	ref: string;
	label: string;
	segments: string[];
	/** Same passage before the nikud/te'amim settings were applied. */
	raw: string[];
	/** The source note this passage comes from. */
	source: Source;
}

/**
 * The source notes keep the text exactly as the corpus has it, whatever the
 * user chose to insert into the note: the library is the canonical copy.
 */
const FULL_TEXT = { nikud: true, teamim: true, fontCompat: true };

// Letras con tooltip (nombre + sonido). El maqaf al final.
const ALEF_BET: Array<[string, string]> = [
	["א", "alef (')"],
	["ב", "bet (b/v)"],
	["ג", "guimel (g)"],
	["ד", "dalet (d)"],
	["ה", "he (h)"],
	["ו", "vav (v/o/u)"],
	["ז", "zayin (z)"],
	["ח", "jet (j)"],
	["ט", "tet (t)"],
	["י", "yod (y/i)"],
	["כ", "kaf (k/j)"],
	["ך", "kaf sofit"],
	["ל", "lamed (l)"],
	["מ", "mem (m)"],
	["ם", "mem sofit"],
	["נ", "nun (n)"],
	["ן", "nun sofit"],
	["ס", "samej (s)"],
	["ע", "ayin (')"],
	["פ", "pe (p/f)"],
	["ף", "pe sofit"],
	["צ", "tsadi (ts)"],
	["ץ", "tsadi sofit"],
	["ק", "kuf (k)"],
	["ר", "resh (r)"],
	["ש", "shin (sh/s)"],
	["ת", "tav (t)"],
	["־", "maqaf"],
];

function normalizeOptionWord(value: string): string {
	return value
		.toLocaleLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\u0590-\u05ff]/g, "");
}

/** Return the remainder when `input` starts with all words in `name`. */
function consumeLeadingName(input: string, name: string): string | null {
	const inputWords = input.trim().split(/\s+/).filter(Boolean);
	const nameWords = name.trim().split(/\s+/).filter(Boolean);
	if (inputWords.length < nameWords.length) return null;
	for (let i = 0; i < nameWords.length; i++) {
		if (normalizeOptionWord(inputWords[i]) !== normalizeOptionWord(nameWords[i])) return null;
	}
	return inputWords.slice(nameWords.length).join(" ").trim();
}

/**
 * Elements that handle Enter on their own (typing, form submit, button activation).
 * Enter must not be intercepted while one of them has focus.
 */
function handlesEnterItself(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON";
}

function parseDaf(value: string): string | null {
	const match = value.trim().match(/^(\d{1,3}[ab])(?:\s|$)/i);
	return match ? match[1].toLowerCase() : null;
}

function parseLocation(value: string): string | null {
	const match = value.trim().match(/^(\d{1,3}:\d{1,3})(?:\s|$)/);
	return match ? match[1] : null;
}

function parseGemaraRemainder(
	remainder: string,
	tractateAliases: string
): { tractate: string; daf: string } {
	for (const tractate of GEMARA_TRACTATES) {
		for (const candidate of gemaraTractateNames(tractate, tractateAliases)) {
			const rest = consumeLeadingName(remainder, candidate);
			if (rest !== null) return { tractate: tractate.name, daf: parseDaf(rest) ?? "" };
		}
	}
	return { tractate: "", daf: "" };
}

function parseRambamRemainder(remainder: string): {
	book: RambamBook | null;
	topic: StudyTopic | null;
	location: string;
} {
	for (const book of RAMBAM_BOOKS) {
		const bookCandidates = [book.name, book.shortName, book.heName, book.shortHeName];
		let afterBook: string | null = null;
		for (const candidate of bookCandidates) {
			afterBook = consumeLeadingName(remainder, candidate);
			if (afterBook !== null) break;
		}
		if (afterBook === null) continue;
		for (const topic of book.topics) {
			for (const candidate of [topic.name, topic.heName]) {
				const afterTopic = consumeLeadingName(afterBook, candidate);
				if (afterTopic !== null) {
					return { book, topic, location: parseLocation(afterTopic) ?? "" };
				}
			}
		}
		return { book, topic: null, location: "" };
	}

	// A section name on its own is unique in the Mishneh Torah list, so allow
	// `rm Sabbath 2:4` as a shortcut without requiring the Sefer name first.
	const matches: Array<{ book: RambamBook; topic: StudyTopic; location: string }> = [];
	for (const book of RAMBAM_BOOKS) {
		for (const topic of book.topics) {
			for (const candidate of [topic.name, topic.heName]) {
				const afterTopic = consumeLeadingName(remainder, candidate);
				if (afterTopic !== null) {
					matches.push({ book, topic, location: parseLocation(afterTopic) ?? "" });
					break;
				}
			}
		}
	}
	return matches.length === 1 ? matches[0] : { book: null, topic: null, location: "" };
}

export class PasukModal extends Modal {
	private plugin: PasukPlugin;
	private editor: Editor;
	private inputEl: HTMLInputElement;
	private resultsEl: HTMLElement;
	private hintEl: HTMLElement;
	private alefBetEl: HTMLElement;
	private items: ResultItem[] = [];
	private selected = 0;
	private debounce: number | null = null;
	private searchSeq = 0;
	private studyRequestSeq = 0;
	private activeStudyMode: StudyMode | null = null;
	private studyRemainder = "";
	private submitStudySearch: (() => void) | null = null;
	private studyPassage: StudyPassage | null = null;
	private studyPreviewEl: HTMLElement | null = null;
	private selectedStudyText = "";
	private studySelectionStatusEl: HTMLElement | null = null;
	private studyInsertSelectionButton: HTMLButtonElement | null = null;
	private selectionChangeHandler: (() => void) | null = null;
	private globalKeydownHandler: ((evt: KeyboardEvent) => void) | null = null;

	constructor(app: App, editor: Editor, plugin: PasukPlugin) {
		super(app);
		this.editor = editor;
		this.plugin = plugin;
	}

	private get settings() {
		return this.plugin.settings;
	}

	onOpen() {
		this.modalEl.addClass("pasuk-modal-container");
		const { contentEl } = this;
		contentEl.addClass("pasuk-modal");
		this.titleEl.setText(t("modalTitle"));

		// Listen on the document, in the capture phase: after highlighting text in the
		// preview the focus leaves the search field (it lands on <body> or on the modal
		// container), so a keydown listener bound to the modal element never sees Enter.
		this.globalKeydownHandler = (evt) => this.handleGlobalKeydown(evt);
		activeDocument.addEventListener("keydown", this.globalKeydownHandler, true);

		this.inputEl = contentEl.createEl("input", {
			type: "text",
			placeholder: t("searchPlaceholder"),
			cls: "pasuk-input",
		});

		const toolbar = contentEl.createDiv({ cls: "pasuk-toolbar" });

		const kbToggle = toolbar.createEl("button", {
			text: "א",
			cls: "pasuk-kb-toggle",
			attr: { "aria-label": t("toggleKeyboard") },
		});

		// Teclado alef-bet (plegable, estado persistido)
		this.alefBetEl = contentEl.createDiv({ cls: "pasuk-alefbet" });
		for (const [letter, tip] of ALEF_BET) {
			const btn = this.alefBetEl.createEl("button", {
				text: letter,
				cls: "pasuk-alefbet-key",
				attr: { "aria-label": tip },
			});
			btn.addEventListener("click", () => this.typeLetter(letter));
		}
		this.alefBetEl.toggleClass("is-hidden", !this.settings.alefBetOpen);
		kbToggle.addEventListener("click", () => {
			this.settings.alefBetOpen = !this.settings.alefBetOpen;
			this.alefBetEl.toggleClass("is-hidden", !this.settings.alefBetOpen);
			void this.plugin.saveSettings();
			this.inputEl.focus();
		});

		this.hintEl = contentEl.createDiv({ cls: "pasuk-hint", text: this.searchHint() });
		this.resultsEl = contentEl.createDiv({ cls: "pasuk-results" });

		this.inputEl.addEventListener("input", () => {
			if (this.debounce) window.clearTimeout(this.debounce);
			this.debounce = window.setTimeout(() => void this.runSearch(), 250);
		});
		this.inputEl.addEventListener("keydown", (evt) => {
			if (evt.key === "ArrowDown") {
				evt.preventDefault();
				this.select(this.selected + 1);
			} else if (evt.key === "ArrowUp") {
				evt.preventDefault();
				this.select(this.selected - 1);
			} else if (evt.key === "Enter") {
				evt.preventDefault();
				evt.stopPropagation();
				if (this.activeStudyMode) {
					if (this.studyPassage) {
						this.insertStudySelectionOrFull();
					} else {
						this.submitStudySearch?.();
					}
				} else {
					void this.insertSelected();
				}
			} else if (evt.key === "Escape") {
				this.close();
			}
		});

		this.selectionChangeHandler = () => this.trackStudySelection();
		activeDocument.addEventListener("selectionchange", this.selectionChangeHandler);
		this.inputEl.focus();
	}

	onClose() {
		if (this.debounce) window.clearTimeout(this.debounce);
		this.searchSeq++;
		this.studyRequestSeq++;
		if (this.selectionChangeHandler) {
			activeDocument.removeEventListener("selectionchange", this.selectionChangeHandler);
		}
		this.selectionChangeHandler = null;
		if (this.globalKeydownHandler) {
			activeDocument.removeEventListener("keydown", this.globalKeydownHandler, true);
		}
		this.globalKeydownHandler = null;
		this.contentEl.empty();
	}

	/**
	 * Enter inserts the highlighted selection (or the whole passage when nothing is
	 * selected) without having to click back into the search field first.
	 */
	private handleGlobalKeydown(evt: KeyboardEvent) {
		if (evt.key !== "Enter" || evt.defaultPrevented || evt.isComposing) return;
		if (!this.studyPassage) return;
		if (handlesEnterItself(evt.target)) return;

		const target = evt.target instanceof Node ? evt.target : null;
		const insideModal = target ? this.containerEl.contains(target) : false;
		// Focus sits on <body> after a mouse selection in the preview; anything else
		// (another modal, another pane) must keep its own Enter behavior.
		if (!insideModal && target !== activeDocument.body) return;

		evt.preventDefault();
		evt.stopPropagation();
		this.insertStudySelectionOrFull();
	}

	private insertStudySelectionOrFull() {
		const passage = this.studyPassage;
		if (!passage) return;
		void this.insertStudyPassage(passage, this.selectedStudyText.trim() ? this.selectedStudyText : null);
	}

	/** Inserta una letra del teclado en la posición del cursor del input. */
	private typeLetter(letter: string) {
		const el = this.inputEl;
		const start = el.selectionStart ?? el.value.length;
		const end = el.selectionEnd ?? start;
		el.value = el.value.slice(0, start) + letter + el.value.slice(end);
		const pos = start + letter.length;
		el.setSelectionRange(pos, pos);
		el.focus();
		el.dispatchEvent(new Event("input"));
	}

	private searchHint(): string {
		return t("hint", {
			rambamTerms: this.settings.rambamSearchTerms || "—",
			gemaraTerms: this.settings.gemaraSearchTerms || "—",
		});
	}

	private async runSearch() {
		const q = this.inputEl.value.trim().replace(/(\d)\s+(?=\d)/g, "$1:");
		const seq = ++this.searchSeq;
		this.items = [];
		this.selected = 0;

		const prefix = matchStudyPrefix(q, this.settings.rambamSearchTerms, this.settings.gemaraSearchTerms);
		if (prefix) {
			this.activeStudyMode = prefix.mode;
			this.studyRemainder = prefix.remainder;
			this.studyRequestSeq++;
			this.hintEl.setText(t(prefix.mode === "gemara" ? "gemaraHint" : "rambamHint"));
			this.renderStudyForm(prefix.mode, prefix.remainder);
			return;
		}

		this.activeStudyMode = null;
		this.studyRemainder = "";
		this.submitStudySearch = null;
		this.studyPassage = null;
		this.studyPreviewEl = null;
		this.selectedStudyText = "";
		this.studySelectionStatusEl = null;
		this.studyInsertSelectionButton = null;
		this.studyRequestSeq++;
		this.hintEl.setText(this.searchHint());

		if (!q) {
			this.render();
			return;
		}

		const ref = parseRef(q);
		if (ref) {
			const verses = await getVerses(ref.book.key, ref.chapter, ref.verseStart, ref.verseEnd);
			if (seq !== this.searchSeq) return;
			if (verses) {
				this.items = [
					{
						label: formatRefLabel(ref, currentLang()),
						book: ref.book,
						chapter: ref.chapter,
						verseStart: ref.verseStart,
						verseEnd: Math.min(ref.verseEnd, ref.verseStart + verses.length - 1),
						verses,
						preview: verses[0],
					wholeChapter: ref.wholeChapter,
					},
				];
			}
			this.render();
			return;
		}

		this.resultsEl.setText(t("searching"));
		const hits = await searchText(q, this.settings.maxResults);
		if (seq !== this.searchSeq) return;
		const lang = currentLang();
		this.items = hits.map((h: SearchHit) => ({
			label:
				lang === "he"
					? formatBookReferenceInHebrew(h.book, h.chapter, h.verse, h.verse)
					: `${lang === "es" ? h.book.es : h.book.en} ${h.chapter}:${h.verse}`,
			book: h.book,
			chapter: h.chapter,
			verseStart: h.verse,
			verseEnd: h.verse,
			verses: [h.text],
			preview: h.text,
			wholeChapter: false,
		}));
		this.render();
	}

	private renderStudyForm(mode: StudyMode, remainder: string) {
		this.studyPassage = null;
		this.studyPreviewEl = null;
		this.selectedStudyText = "";
		this.studySelectionStatusEl = null;
		this.studyInsertSelectionButton = null;
		this.submitStudySearch = null;
		this.resultsEl.empty();
		this.resultsEl.addClass("pasuk-study-results");

		if (mode === "gemara") this.renderGemaraForm(remainder);
		else this.renderRambamForm(remainder);
	}

	private renderGemaraForm(remainder: string) {
		const form = this.resultsEl.createEl("form", { cls: "pasuk-study-form" });
		const prefill = parseGemaraRemainder(remainder, this.settings.gemaraTractateAliases);
		const selectField = form.createDiv({ cls: "pasuk-study-field" });
		const selectId = "pasuk-gemara-tractate";
		selectField.createEl("label", { text: t("tractateLabel"), attr: { for: selectId } });
		const tractateSelect = selectField.createEl("select", {
			cls: "pasuk-study-select",
			attr: { id: selectId, required: "true" },
		});
		tractateSelect.createEl("option", { text: t("chooseTractate"), value: "" });
		for (const tractate of GEMARA_TRACTATES) {
			tractateSelect.createEl("option", { text: tractate.heName, value: tractate.name });
		}
		const defaultTractate = GEMARA_TRACTATES.find(
			(tractate) => tractate.name === this.settings.defaultGemaraTractate
		);
		const selectedTractate = prefill.tractate || defaultTractate?.name;
		if (selectedTractate) tractateSelect.value = selectedTractate;

		const dafField = form.createDiv({ cls: "pasuk-study-field" });
		const dafId = "pasuk-gemara-daf";
		dafField.createEl("label", { text: t("dafLabel"), attr: { for: dafId } });
		const dafInput = dafField.createEl("input", {
			type: "text",
			cls: "pasuk-study-input",
			placeholder: t("dafPlaceholder"),
			attr: { id: dafId, autocomplete: "off", autocapitalize: "off" },
		});
		dafInput.value = prefill.daf || parseDaf(remainder) || "";

		const errorEl = form.createDiv({ cls: "pasuk-study-error" });
		const actions = form.createDiv({ cls: "pasuk-study-actions" });
		const button = actions.createEl("button", {
			text: t("fetchText"),
			cls: "mod-cta pasuk-study-button",
			attr: { type: "submit" },
		});

		const submit = () => {
			if (!form.reportValidity()) return;
			const daf = dafInput.value.trim().toLowerCase();
			if (!/^\d{1,3}[ab]$/.test(daf)) {
				errorEl.setText(t("invalidDaf"));
				dafInput.focus();
				return;
			}
			errorEl.empty();
			const tractate = tractateSelect.value;
			const tractateInfo = GEMARA_TRACTATES.find((candidate) => candidate.name === tractate);
			this.studyRemainder = `${tractate} ${daf}`;
			const ref = `${tractate}.${daf}`;
			let label = "";
			const heDaf = formatHebrewDafShort(daf);
			if (this.settings.defaultGemaraTractate && tractate === this.settings.defaultGemaraTractate) {
				label = heDaf;
			} else {
				label = `${tractateInfo?.heName ?? tractate} ${heDaf}`;
			}
			const dafNumber = Number(daf.slice(0, -1));
			const amud = daf.endsWith("b") ? "b" : "a";
			const source: GemaraSource = {
				kind: "gemara",
				tractateName: tractate,
				tractateHe: tractateInfo?.heName ?? tractate,
				perek: perekForDaf(tractate, dafNumber, amud),
				daf: dafNumber,
				amud,
			};
			void this.fetchStudyPassage(ref, label, "gemara", source);
		};
		this.submitStudySearch = submit;
		form.addEventListener("submit", (evt) => {
			evt.preventDefault();
			submit();
		});
		button.addEventListener("keydown", (evt) => {
			if (evt.key === "Escape") this.close();
		});
	}

	private renderRambamForm(remainder: string) {
		const form = this.resultsEl.createEl("form", { cls: "pasuk-study-form" });
		const prefill = parseRambamRemainder(remainder);

		const bookField = form.createDiv({ cls: "pasuk-study-field" });
		const bookId = "pasuk-rambam-book";
		bookField.createEl("label", { text: t("seferLabel"), attr: { for: bookId } });
		const bookSelect = bookField.createEl("select", {
			cls: "pasuk-study-select",
			attr: { id: bookId, required: "true" },
		});
		bookSelect.createEl("option", { text: t("chooseSefer"), value: "" });
		for (const book of RAMBAM_BOOKS) {
			bookSelect.createEl("option", { text: book.heName, value: book.name });
		}

		const sectionField = form.createDiv({ cls: "pasuk-study-field" });
		const sectionId = "pasuk-rambam-section";
		sectionField.createEl("label", { text: t("sectionLabel"), attr: { for: sectionId } });
		const sectionSelect = sectionField.createEl("select", {
			cls: "pasuk-study-select",
			attr: { id: sectionId, required: "true" },
		});

		const populateSections = (book: RambamBook | undefined) => {
			sectionSelect.empty();
			sectionSelect.createEl("option", { text: t("chooseSection"), value: "" });
			for (const topic of book?.topics ?? []) {
				sectionSelect.createEl("option", { text: topic.heName, value: topic.name });
			}
			sectionSelect.disabled = !book;
		};
		populateSections(undefined);
		bookSelect.addEventListener("change", () => {
			populateSections(RAMBAM_BOOKS.find((book) => book.name === bookSelect.value));
		});
		const defaultBook = RAMBAM_BOOKS.find((book) => book.name === this.settings.defaultRambamBook);
		const selectedBook = prefill.book ?? defaultBook;
		const selectedTopic =
			prefill.topic ??
			(selectedBook && selectedBook.name === defaultBook?.name
				? selectedBook.topics.find((topic) => topic.name === this.settings.defaultRambamSection)
				: undefined);
		if (selectedBook) {
			bookSelect.value = selectedBook.name;
			populateSections(selectedBook);
			if (selectedTopic) sectionSelect.value = selectedTopic.name;
		}

		const locationField = form.createDiv({ cls: "pasuk-study-field" });
		const locationId = "pasuk-rambam-location";
		locationField.createEl("label", { text: t("locationLabel"), attr: { for: locationId } });
		const locationInput = locationField.createEl("input", {
			type: "text",
			cls: "pasuk-study-input",
			placeholder: t("locationPlaceholder"),
			attr: { id: locationId, autocomplete: "off", autocapitalize: "off" },
		});
		locationInput.value = prefill.location || parseLocation(remainder) || "";

		const errorEl = form.createDiv({ cls: "pasuk-study-error" });
		const actions = form.createDiv({ cls: "pasuk-study-actions" });
		const button = actions.createEl("button", {
			text: t("fetchText"),
			cls: "mod-cta pasuk-study-button",
			attr: { type: "submit" },
		});

		const submit = () => {
			if (!form.reportValidity()) return;
			const location = locationInput.value.trim().replace(/(\d)\s+(?=\d)/g, "$1:");
			if (!/^\d{1,3}:\d{1,3}$/.test(location)) {
				errorEl.setText(t("invalidLocation"));
				locationInput.focus();
				return;
			}
			errorEl.empty();
			const book = RAMBAM_BOOKS.find((candidate) => candidate.name === bookSelect.value);
			const topic = book?.topics.find((candidate) => candidate.name === sectionSelect.value);
			if (!book || !topic) return;
			const [chapter, halacha] = location.split(":");
			this.studyRemainder = `${book.name} ${topic.name} ${location}`;
			const ref = `Mishneh Torah, ${topic.name}.${chapter}.${halacha}`;
			// Citation format: רמב״ם:<section> <chapter>:<halacha>. Section titles are
			// unique across the Mishneh Torah, and the `רמב״ם:` prefix tells them apart
			// from same-named Gemara tractates (e.g. ברכות).
			const heLocation = formatHebrewLocation(Number(chapter), Number(halacha));
			const label = `רמב״ם:${topic.heName} ${heLocation}`;
			const source: RambamSource = {
				kind: "rambam",
				topicName: topic.name,
				topicHe: topic.heName,
				bookHe: book.heName,
				chapter: Number(chapter),
				halacha: Number(halacha),
			};
			void this.fetchStudyPassage(ref, label, "rambam", source);
		};
		this.submitStudySearch = submit;
		form.addEventListener("submit", (evt) => {
			evt.preventDefault();
			submit();
		});
		button.addEventListener("keydown", (evt) => {
			if (evt.key === "Escape") this.close();
		});
	}

	private async fetchStudyPassage(ref: string, label: string, mode: StudyMode, source: Source) {
		const requestSeq = ++this.studyRequestSeq;
		const queryAtStart = this.inputEl.value;
		this.submitStudySearch = null;
		this.studyPassage = null;
		this.studyPreviewEl = null;
		this.selectedStudyText = "";
		this.resultsEl.empty();
		this.resultsEl.createDiv({ cls: "pasuk-empty", text: t("loadingText") });

		try {
			const rawSegments = await lookupStudyHebrew(ref, mode);
			if (
				requestSeq !== this.studyRequestSeq ||
				queryAtStart !== this.inputEl.value ||
				this.activeStudyMode !== mode
			) {
				return;
			}
			const opts = {
				nikud: this.settings.includeNikud,
				teamim: this.settings.includeTeamim,
				fontCompat: this.settings.fontCompat,
			};
			const segments = rawSegments.map((segment) => formatHebrew(segment, opts)).filter(Boolean);
			if (!segments.length) {
				this.renderStudyMessage(t("noTextFound"));
				return;
			}
			this.studyPassage = { ref, label, segments, raw: rawSegments, source };
			this.renderStudyPreview(this.studyPassage);
		} catch {
			if (
				requestSeq !== this.studyRequestSeq ||
				queryAtStart !== this.inputEl.value ||
				this.activeStudyMode !== mode
			) {
				return;
			}
			this.renderStudyMessage(t("fetchTextError"));
		}
	}

	private renderStudyMessage(message: string) {
		this.resultsEl.empty();
		this.submitStudySearch = null;
		this.studyPreviewEl = null;
		this.selectedStudyText = "";
		this.hintEl.setText(
			t(this.activeStudyMode === "gemara" ? "gemaraHint" : "rambamHint")
		);
		this.resultsEl.createDiv({ cls: "pasuk-empty pasuk-study-message", text: message });
		const back = this.resultsEl.createEl("button", {
			text: t("changeReference"),
			cls: "pasuk-study-button",
			attr: { type: "button" },
		});
		back.addEventListener("click", () => this.restoreStudyForm());
	}

	private renderStudyPreview(passage: StudyPassage) {
		this.resultsEl.empty();
		this.submitStudySearch = null;
		this.selectedStudyText = "";
		this.hintEl.setText(t("selectionHint"));

		const preview = this.resultsEl.createDiv({ cls: "pasuk-study-preview-text" });
		preview.setAttr("dir", "rtl");
		preview.setAttr("aria-label", passage.label);
		for (const segment of passage.segments) {
			preview.createDiv({ text: segment });
		}
		this.studyPreviewEl = preview;

		const status = this.resultsEl.createDiv({
			cls: "pasuk-study-selection-status pasuk-hidden",
			text: t("selectionStatus", { count: 0 }),
		});
		this.studySelectionStatusEl = status;

		const actions = this.resultsEl.createDiv({ cls: "pasuk-study-actions pasuk-study-preview-actions" });
		const insertFull = actions.createEl("button", {
			text: t("insertFullText"),
			cls: "mod-cta pasuk-study-button",
			attr: { type: "button" },
		});
		insertFull.addEventListener("click", () => void this.insertStudyPassage(passage, null));

		this.studyInsertSelectionButton = actions.createEl("button", {
			text: t("insertSelection"),
			cls: "pasuk-study-button",
			attr: { type: "button" },
		});
		this.studyInsertSelectionButton.disabled = true;
		this.studyInsertSelectionButton.addEventListener("click", () => {
			if (this.selectedStudyText.trim()) {
				void this.insertStudyPassage(passage, this.selectedStudyText);
			}
		});

		const change = actions.createEl("button", {
			text: t("changeReference"),
			cls: "pasuk-study-button",
			attr: { type: "button" },
		});
		change.addEventListener("click", () => this.restoreStudyForm());
	}

	private trackStudySelection() {
		const selection = activeWindow.getSelection();
		if (!selection || !this.studyPreviewEl || !selection.anchorNode || !selection.focusNode) return;
		if (!this.studyPreviewEl.contains(selection.anchorNode) || !this.studyPreviewEl.contains(selection.focusNode)) {
			// Keep the last in-preview selection while the user clicks an action button.
			return;
		}
		this.selectedStudyText = selection.toString();
		this.updateStudySelectionControls();
	}

	private updateStudySelectionControls() {
		const selected = this.selectedStudyText.trim();
		if (this.studyInsertSelectionButton) this.studyInsertSelectionButton.disabled = !selected;
		if (this.studySelectionStatusEl) {
			this.studySelectionStatusEl.toggleClass("pasuk-hidden", !selected);
			this.studySelectionStatusEl.setText(t("selectionStatus", { count: selected.length }));
		}
	}

	private restoreStudyForm() {
		if (!this.activeStudyMode) return;
		this.studyRequestSeq++;
		this.hintEl.setText(t(this.activeStudyMode === "gemara" ? "gemaraHint" : "rambamHint"));
		this.renderStudyForm(this.activeStudyMode, this.studyRemainder);
	}

	private async insertStudyPassage(passage: StudyPassage, selection: string | null) {
		// One flowing paragraph, both for the full passage and for a selection.
		const content = flowIntoSingleLine(selection ?? passage.segments.join("\n"));
		if (!content) return;
		// The source note always holds the whole amud or halacha, even when the
		// user only inserted part of it.
		const prepared: PreparedSource[] = [
			{
				source: passage.source,
				text: passage.raw.map((segment) => formatHebrew(segment, FULL_TEXT)).filter(Boolean).join("\n"),
			},
		];
		await this.insertComposed(content, passage.label, prepared);
		this.close();
	}

	/**
	 * Insert the composed text at the cursor and, when the reference goes into
	 * a numbered footnote, append its definition at the end of the note.
	 */
	/**
	 * Make sure the atomic source notes exist and return the wikilink that the
	 * inserted reference should point at, or undefined when the reference stays
	 * plain text (linking off, or the vault could not be written).
	 */
	private async sourceLinkFor(location: string, sources: PreparedSource[]): Promise<string | undefined> {
		if (!this.settings.linkSourceFiles || !sources.length) return undefined;
		const root = this.settings.sourcesFolder.trim() || DEFAULT_SOURCES_FOLDER;
		try {
			if (this.settings.createMissingSources) {
				await ensureSourceNotes(vaultWriter(this.app), sources, root);
			}
			return sourceLink(sources[0].source, location, root);
		} catch (error) {
			console.error("Shiur Notes Inserter: could not write the source note", error);
			new Notice(t("sourceWriteError"));
			return undefined;
		}
	}

	private async insertComposed(content: string, location: string, sources: PreparedSource[] = []) {
		const locationLink = await this.sourceLinkFor(location, sources);
		const needsFootnoteId =
			this.settings.footnoteReference && this.settings.footnoteStyle === "numbered";
		const footnoteId = needsFootnoteId ? nextFootnoteId(this.editor.getValue()) : undefined;
		const { text, footnoteDefinition } = composeInsert(content, location, this.settings, {
			footnoteId,
			locationLink,
		});
		this.editor.replaceSelection(text);
		if (!footnoteDefinition) return;
		// Re-read the note after the insertion so the definition lands after
		// everything, including the text just inserted.
		const value = this.editor.getValue();
		const end = this.editor.offsetToPos(value.length);
		this.editor.replaceRange(footnoteDefinitionAppendix(value, footnoteDefinition), end, end);
	}

	private render() {
		this.resultsEl.removeClass("pasuk-study-results");
		this.resultsEl.empty();
		if (!this.items.length) {
			if (this.inputEl.value.trim()) {
				this.resultsEl.createDiv({ cls: "pasuk-empty", text: t("noResults") });
			}
			return;
		}
		this.items.forEach((item, i) => {
			const el = this.resultsEl.createDiv({
				cls: "pasuk-result" + (i === this.selected ? " is-selected" : ""),
			});
			el.createDiv({ cls: "pasuk-result-ref", text: item.label });
			el.createDiv({
				cls: "pasuk-result-text",
				text: formatHebrew(item.preview, {
					nikud: this.settings.includeNikud,
					teamim: this.settings.includeTeamim,
					fontCompat: this.settings.fontCompat,
				}),
			});
			el.addEventListener("click", () => {
				this.selected = i;
				void this.insertSelected();
			});
			el.addEventListener("mousemove", () => this.select(i));
		});
	}

	private select(i: number) {
		if (!this.items.length) return;
		this.selected = Math.max(0, Math.min(i, this.items.length - 1));
		const children = Array.from(this.resultsEl.children);
		children.forEach((c, idx) => c.toggleClass("is-selected", idx === this.selected));
		children[this.selected]?.scrollIntoView({ block: "nearest" });
	}

	private async insertSelected() {
		const item = this.items[this.selected];
		if (!item) return;
		const opts = {
			nikud: this.settings.includeNikud,
			teamim: this.settings.includeTeamim,
			fontCompat: this.settings.fontCompat,
		};
		const lines = item.verses.map((v) => formatHebrew(v, opts));

		const location = formatBookReferenceInHebrew(
			item.book,
			item.chapter,
			item.verseStart,
			item.verseEnd,
			item.wholeChapter ?? false
		);

		// One note per verse; a range or a whole chapter writes every verse it
		// covers and the inserted reference links to the first of them.
		const prepared: PreparedSource[] = item.verses.map((verse, offset) => ({
			source: {
				kind: "tanakh",
				bookKey: item.book.key,
				bookHe: item.book.he,
				chapter: item.chapter,
				verse: item.verseStart + offset,
			},
			text: formatHebrew(verse, FULL_TEXT),
		}));

		await this.insertComposed(lines.join(" "), location, prepared);
		this.close();
	}
}
