// Offline Torah-study lookup backed by the bundled Sefaria text corpus.
import { GEMARA_GZ, RAMBAM_GZ } from "./study-corpus";

export type StudyMode = "rambam" | "gemara";

export interface StudyTopic {
	name: string;
}

export interface RambamBook {
	name: string;
	shortName: string;
	topics: StudyTopic[];
}

export interface GemaraTractate {
	name: string;
}

/** The 14 books of the Mishneh Torah and their Sefaria topic titles. */
export const RAMBAM_BOOKS: RambamBook[] = [
	{
		name: "Sefer Madda",
		shortName: "Madda",
		topics: [
			{ name: "Foundations of the Torah" },
			{ name: "Human Dispositions" },
			{ name: "Torah Study" },
			{ name: "Foreign Worship and Customs of the Nations" },
			{ name: "Repentance" },
		],
	},
	{
		name: "Sefer Ahavah",
		shortName: "Ahavah",
		topics: [
			{ name: "Reading the Shema" },
			{ name: "Prayer and the Priestly Blessing" },
			{ name: "Tefillin, Mezuzah and the Torah Scroll" },
			{ name: "Fringes" },
			{ name: "Blessings" },
			{ name: "Circumcision" },
			{ name: "The Order of Prayer" },
		],
	},
	{
		name: "Sefer Zemanim",
		shortName: "Zemanim",
		topics: [
			{ name: "Sabbath" },
			{ name: "Eruvin" },
			{ name: "Rest on the Tenth of Tishrei" },
			{ name: "Rest on a Holiday" },
			{ name: "Leavened and Unleavened Bread" },
			{ name: "Shofar, Sukkah and Lulav" },
			{ name: "Sheqel Dues" },
			{ name: "Sanctification of the New Month" },
			{ name: "Fasts" },
			{ name: "Scroll of Esther and Hanukkah" },
		],
	},
	{
		name: "Sefer Nashim",
		shortName: "Nashim",
		topics: [
			{ name: "Marriage" },
			{ name: "Divorce" },
			{ name: "Levirate Marriage and Release" },
			{ name: "Virgin Maiden" },
			{ name: "Woman Suspected of Infidelity" },
		],
	},
	{
		name: "Sefer Kedushah",
		shortName: "Kedushah",
		topics: [
			{ name: "Forbidden Intercourse" },
			{ name: "Forbidden Foods" },
			{ name: "Ritual Slaughter" },
		],
	},
	{
		name: "Sefer Haflaah",
		shortName: "Haflaah",
		topics: [
			{ name: "Oaths" },
			{ name: "Vows" },
			{ name: "Nazariteship" },
			{ name: "Appraisals and Devoted Property" },
		],
	},
	{
		name: "Sefer Zeraim",
		shortName: "Zeraim",
		topics: [
			{ name: "Diverse Species" },
			{ name: "Gifts to the Poor" },
			{ name: "Heave Offerings" },
			{ name: "Tithes" },
			{ name: "Second Tithes and Fourth Year's Fruit" },
			{ name: "First Fruits and other Gifts to Priests Outside the Sanctuary" },
			{ name: "Sabbatical Year and the Jubilee" },
		],
	},
	{
		name: "Sefer Avodah",
		shortName: "Avodah",
		topics: [
			{ name: "The Chosen Temple" },
			{ name: "Vessels of the Sanctuary and Those Who Serve Therein" },
			{ name: "Admission into the Sanctuary" },
			{ name: "Things Forbidden on the Altar" },
			{ name: "Sacrificial Procedure" },
			{ name: "Daily Offerings and Additional Offerings" },
			{ name: "Sacrifices Rendered Unfit" },
			{ name: "Service on the Day of Atonement" },
			{ name: "Trespass" },
		],
	},
	{
		name: "Sefer Korbanot",
		shortName: "Korbanot",
		topics: [
			{ name: "Paschal Offering" },
			{ name: "Festival Offering" },
			{ name: "Firstlings" },
			{ name: "Offerings for Unintentional Transgressions" },
			{ name: "Offerings for Those with Incomplete Atonement" },
			{ name: "Substitution" },
		],
	},
	{
		name: "Sefer Taharah",
		shortName: "Taharah",
		topics: [
			{ name: "Defilement by a Corpse" },
			{ name: "Red Heifer" },
			{ name: "Defilement by Leprosy" },
			{ name: "Those Who Defile Bed or Seat" },
			{ name: "Other Sources of Defilement" },
			{ name: "Defilement of Foods" },
			{ name: "Vessels" },
			{ name: "Immersion Pools" },
		],
	},
	{
		name: "Sefer Nezikim",
		shortName: "Nezikim",
		topics: [
			{ name: "Damages to Property" },
			{ name: "Theft" },
			{ name: "Robbery and Lost Property" },
			{ name: "One Who Injures a Person or Property" },
			{ name: "Murderer and the Preservation of Life" },
		],
	},
	{
		name: "Sefer Kinyan",
		shortName: "Kinyan",
		topics: [
			{ name: "Sales" },
			{ name: "Ownerless Property and Gifts" },
			{ name: "Neighbors" },
			{ name: "Agents and Partners" },
			{ name: "Slaves" },
		],
	},
	{
		name: "Sefer Mishpatim",
		shortName: "Mishpatim",
		topics: [
			{ name: "Hiring" },
			{ name: "Borrowing and Deposit" },
			{ name: "Creditor and Debtor" },
			{ name: "Plaintiff and Defendant" },
			{ name: "Inheritances" },
		],
	},
	{
		name: "Sefer Shoftim",
		shortName: "Shoftim",
		topics: [
			{ name: "The Sanhedrin and the Penalties within Their Jurisdiction" },
			{ name: "Testimony" },
			{ name: "Rebels" },
			{ name: "Mourning" },
			{ name: "Kings and Wars" },
		],
	},
];

/** Tractates of the Babylonian Talmud (Bavli) available on Sefaria. */
export const GEMARA_TRACTATES: GemaraTractate[] = [
	{ name: "Berakhot" },
	{ name: "Shabbat" },
	{ name: "Eruvin" },
	{ name: "Pesachim" },
	{ name: "Rosh Hashanah" },
	{ name: "Yoma" },
	{ name: "Sukkah" },
	{ name: "Beitzah" },
	{ name: "Taanit" },
	{ name: "Megillah" },
	{ name: "Moed Katan" },
	{ name: "Chagigah" },
	{ name: "Yevamot" },
	{ name: "Ketubot" },
	{ name: "Nedarim" },
	{ name: "Nazir" },
	{ name: "Sotah" },
	{ name: "Gittin" },
	{ name: "Kiddushin" },
	{ name: "Bava Kamma" },
	{ name: "Bava Metzia" },
	{ name: "Bava Batra" },
	{ name: "Sanhedrin" },
	{ name: "Makkot" },
	{ name: "Shevuot" },
	{ name: "Avodah Zarah" },
	{ name: "Horayot" },
	{ name: "Zevachim" },
	{ name: "Menachot" },
	{ name: "Chullin" },
	{ name: "Bekhorot" },
	{ name: "Arakhin" },
	{ name: "Temurah" },
	{ name: "Keritot" },
	{ name: "Meilah" },
	{ name: "Tamid" },
	{ name: "Niddah" },
];

export interface StudyPrefixMatch {
	mode: StudyMode;
	alias: string;
	remainder: string;
}

function normalizeAlias(value: string): string {
	return value
		.trim()
		.toLocaleLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function aliasesFromSetting(value: string): string[] {
	return value
		.split(/[/,;\n]+/)
		.map((alias) => alias.trim())
		.filter(Boolean);
}

/** Match a configured leading search token, e.g. `rm` or `gm`. */
export function matchStudyPrefix(
	query: string,
	rambamTerms: string,
	gemaraTerms: string
): StudyPrefixMatch | null {
	const trimmed = query.trimStart();
	const normalizedQuery = normalizeAlias(trimmed);
	const candidates: Array<{ mode: StudyMode; alias: string; normalized: string }> = [
		...aliasesFromSetting(rambamTerms).map((alias) => ({
			mode: "rambam" as const,
			alias,
			normalized: normalizeAlias(alias),
		})),
		...aliasesFromSetting(gemaraTerms).map((alias) => ({
			mode: "gemara" as const,
			alias,
			normalized: normalizeAlias(alias),
		})),
	];

	candidates.sort((a, b) => b.normalized.length - a.normalized.length);
	for (const candidate of candidates) {
		if (!candidate.normalized || !normalizedQuery.startsWith(candidate.normalized)) continue;
		const next = trimmed[candidate.alias.length] ?? "";
		if (next && !/[\s:]/.test(next)) continue;
		return {
			mode: candidate.mode,
			alias: candidate.alias,
			remainder: trimmed.slice(candidate.alias.length).trim(),
		};
	}
	return null;
}

const rambamCache = new Map<string, unknown>();
const gemaraCache = new Map<string, unknown>();

function collectText(value: unknown, out: string[]): void {
	if (typeof value === "string") {
		// The corpus builder strips source markup and normalizes whitespace before bundling.
		const text = value.trim();
		if (text) out.push(text);
		return;
	}
	if (Array.isArray(value)) {
		for (const child of value) collectText(child, out);
	}
}

async function loadText(
	corpus: Record<string, string>,
	cache: Map<string, unknown>,
	key: string,
	mode: StudyMode
): Promise<unknown> {
	if (cache.has(key)) return cache.get(key);
	const encoded = corpus[key];
	if (!encoded) throw new Error(`No bundled ${mode} text for “${key}”`);
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
	const json = await new Response(stream).text();
	const text: unknown = JSON.parse(json);
	cache.set(key, text);
	return text;
}

async function lookupGemara(tractate: string, daf: string): Promise<string[]> {
	const match = daf.trim().toLowerCase().match(/^(\d{1,3})([ab])$/);
	if (!match) return [];
	const dafNumber = Number(match[1]);
	if (dafNumber < 2) return [];
	// Sefaria's jagged array uses one index per side: 2a=2, 2b=3, 3a=4, …
	const dafIndex = dafNumber * 2 - (match[2] === "a" ? 2 : 1);
	const pages = await loadText(GEMARA_GZ, gemaraCache, tractate, "gemara");
	if (!Array.isArray(pages)) return [];
	const segments: string[] = [];
	collectText(pages[dafIndex], segments);
	return segments;
}

async function lookupRambam(topic: string, chapter: number, halacha: number): Promise<string[]> {
	if (!Number.isInteger(chapter) || !Number.isInteger(halacha) || chapter < 1 || halacha < 1) {
		return [];
	}
	const chapters = await loadText(RAMBAM_GZ, rambamCache, topic, "rambam");
	if (!Array.isArray(chapters)) return [];
	const chapterText: unknown = chapters[chapter - 1];
	if (!Array.isArray(chapterText)) return [];
	const segments: string[] = [];
	collectText(chapterText[halacha - 1], segments);
	return segments;
}

/** Look up a bundled Hebrew/Aramaic passage without making a network request. */
export async function lookupStudyHebrew(ref: string, mode: StudyMode): Promise<string[]> {
	if (mode === "gemara") {
		const match = ref.match(/^(.+)\.(\d{1,3}[ab])$/i);
		if (!match) return [];
		return lookupGemara(match[1], match[2]);
	}

	const match = ref.match(/^Mishneh Torah,\s*(.+?)\.(\d{1,3})\.(\d{1,3})$/i);
	if (!match) return [];
	return lookupRambam(match[1], Number(match[2]), Number(match[3]));
}
