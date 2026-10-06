import { App, Editor, Plugin, PluginSettingTab, Setting } from "obsidian";
import { PasukModal } from "./modal";
import { initI18n, t } from "./i18n";
import {
	DEFAULT_GEMARA_TRACTATE_ALIASES,
	GEMARA_TRACTATES,
	RAMBAM_BOOKS,
} from "./study";

export interface PasukSettings {
	includeNikud: boolean;
	includeTeamim: boolean;
	quoteFormat: boolean;
	quoteMarks: boolean;
	inlineReference: boolean;
	maxResults: number;
	fontCompat: boolean;
	alefBetOpen: boolean;
	rambamSearchTerms: string;
	gemaraSearchTerms: string;
	gemaraTractateAliases: string;
	defaultRambamBook: string;
	defaultRambamSection: string;
	defaultGemaraTractate: string;
}

const DEFAULT_SETTINGS: PasukSettings = {
	includeNikud: true,
	includeTeamim: false,
	quoteFormat: true,
	quoteMarks: false,
	inlineReference: false,
	maxResults: 30,
	fontCompat: true,
	alefBetOpen: false,
	rambamSearchTerms: "rmbm/rm",
	gemaraSearchTerms: "gm",
	gemaraTractateAliases: DEFAULT_GEMARA_TRACTATE_ALIASES,
	defaultRambamBook: "",
	defaultRambamSection: "",
	defaultGemaraTractate: "",
};

const GITHUB_URL = "https://github.com/mgsmath/obsidian-torah-verse-inserter";

export default class PasukPlugin extends Plugin {
	settings: PasukSettings;

	async onload() {
		await this.loadSettings();
		initI18n();

		this.addCommand({
			id: "insert-verse",
			name: t("cmdInsert"),
			editorCallback: (editor: Editor) => {
				new PasukModal(this.app, editor, this).open();
			},
		});

		this.addSettingTab(new PasukSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		const data = (await this.loadData()) as Partial<PasukSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);

		// Backwards compatibility: previously, disabling quoteFormat always resulted in an inline reference.
		if (data && data.quoteFormat === false && typeof data.inlineReference === "undefined") {
			this.settings.inlineReference = true;
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class PasukSettingTab extends PluginSettingTab {
	plugin: PasukPlugin;

	constructor(app: App, plugin: PasukPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const s = this.plugin.settings;
		const save = () => void this.plugin.saveSettings();
		let refreshDefaultRambamSectionOptions: (() => void) | null = null;

		new Setting(containerEl).setName(t("settings")).setHeading();

		new Setting(containerEl)
			.setName(t("includeNikud"))
			.setDesc(t("includeNikudDesc"))
			.addToggle((tg) =>
				tg.setValue(s.includeNikud).onChange((v) => {
					s.includeNikud = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("includeTeamim"))
			.setDesc(t("includeTeamimDesc"))
			.addToggle((tg) =>
				tg.setValue(s.includeTeamim).onChange((v) => {
					s.includeTeamim = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("quoteFormat"))
			.setDesc(t("quoteFormatDesc"))
			.addToggle((tg) =>
				tg.setValue(s.quoteFormat).onChange((v) => {
					s.quoteFormat = v;
					save();
				})
			);

		// Only used when the block quote is off: a quoted passage with the
		// reference in parentheses, e.g. "בראשית ברא..." (בראשית א:א).
		new Setting(containerEl)
			.setName(t("quoteMarks"))
			.setDesc(t("quoteMarksDesc"))
			.addToggle((tg) =>
				tg.setValue(s.quoteMarks).onChange((v) => {
					s.quoteMarks = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("inlineReference"))
			.setDesc(t("inlineReferenceDesc"))
			.addToggle((tg) =>
				tg.setValue(s.inlineReference).onChange((v) => {
					s.inlineReference = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("fontCompat"))
			.setDesc(t("fontCompatDesc"))
			.addToggle((tg) =>
				tg.setValue(s.fontCompat).onChange((v) => {
					s.fontCompat = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("maxResults"))
			.setDesc(t("maxResultsDesc"))
			.addText((txt) =>
				txt.setValue(String(s.maxResults)).onChange((v) => {
					const n = parseInt(v, 10);
					if (!isNaN(n) && n > 0) {
						s.maxResults = n;
						save();
					}
				})
			);

		new Setting(containerEl).setName(t("studySearches")).setHeading();

		new Setting(containerEl)
			.setName(t("rambamSearchTerms"))
			.setDesc(t("rambamSearchTermsDesc"))
			.addText((txt) =>
				txt.setValue(s.rambamSearchTerms).onChange((v) => {
					s.rambamSearchTerms = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("gemaraSearchTerms"))
			.setDesc(t("gemaraSearchTermsDesc"))
			.addText((txt) =>
				txt.setValue(s.gemaraSearchTerms).onChange((v) => {
					s.gemaraSearchTerms = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("gemaraTractateAliases"))
			.setDesc(t("gemaraTractateAliasesDesc"))
			.addTextArea((txt) => {
				txt.setValue(s.gemaraTractateAliases).onChange((v) => {
					s.gemaraTractateAliases = v;
					save();
				});
				txt.inputEl.rows = 8;
				txt.inputEl.cols = 40;
				txt.inputEl.addClass("pasuk-setting-textarea");
			});

		new Setting(containerEl)
			.setName(t("defaultRambamBook"))
			.setDesc(t("defaultRambamBookDesc"))
			.addDropdown((dropdown) => {
				dropdown.addOption("", t("chooseSefer"));
				for (const book of RAMBAM_BOOKS) dropdown.addOption(book.name, book.heName);
				dropdown.setValue(s.defaultRambamBook || "");
				dropdown.onChange((value) => {
					s.defaultRambamBook = value;
					s.defaultRambamSection = "";
					refreshDefaultRambamSectionOptions?.();
					save();
				});
			});

		new Setting(containerEl)
			.setName(t("defaultRambamSection"))
			.setDesc(t("defaultRambamSectionDesc"))
			.addDropdown((dropdown) => {
				const refreshOptions = () => {
					const book = RAMBAM_BOOKS.find((candidate) => candidate.name === s.defaultRambamBook);
					dropdown.selectEl.options.length = 0;
					dropdown.addOption("", t("chooseSection"));
					for (const topic of book?.topics ?? []) dropdown.addOption(topic.name, topic.heName);
					const selectedSection = book?.topics.find(
						(topic) => topic.name === s.defaultRambamSection
					);
					dropdown.setValue(selectedSection?.name ?? "");
					dropdown.setDisabled(!book);
				};
				refreshDefaultRambamSectionOptions = refreshOptions;
				refreshOptions();
				dropdown.onChange((value) => {
					s.defaultRambamSection = value;
					save();
				});
			});

		new Setting(containerEl)
			.setName(t("defaultGemaraTractate"))
			.setDesc(t("defaultGemaraTractateDesc"))
			.addDropdown((dropdown) => {
				dropdown.addOption("", t("chooseTractate"));
				for (const tractate of GEMARA_TRACTATES) {
					dropdown.addOption(tractate.name, tractate.heName);
				}
				dropdown.setValue(s.defaultGemaraTractate || "");
				dropdown.onChange((value) => {
					s.defaultGemaraTractate = value;
					save();
				});
			});

		const about = containerEl.createDiv({ cls: "pasuk-about" });
		about.createSpan({ text: `Shiur Notes Inserter v${this.plugin.manifest.version} · ` });
		const gh = about.createEl("a", { text: t("viewGithub"), href: GITHUB_URL });
		gh.setAttr("target", "_blank");
		about.createSpan({ text: " · " });
		const issue = about.createEl("a", { text: t("reportIssue"), href: GITHUB_URL + "/issues" });
		issue.setAttr("target", "_blank");
		about.createEl("div", { text: "Originally created by Saleh Penhos." });
	}
}
