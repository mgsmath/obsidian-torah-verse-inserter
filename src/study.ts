// Offline Torah-study lookup backed by the bundled Hebrew/Aramaic text corpus.
import { GEMARA_GZ, RAMBAM_GZ } from "./study-corpus";

export type StudyMode = "rambam" | "gemara";

export interface StudyTopic {
	name: string;
	heName: string;
}

export interface RambamBook {
	name: string;
	heName: string;
	shortName: string;
	shortHeName: string;
	topics: StudyTopic[];
}

export interface GemaraTractate {
	name: string;
	heName: string;
}

/** The 14 books of the Mishneh Torah and their section titles. */
export const RAMBAM_BOOKS: RambamBook[] = [
	{
		name: "Sefer Madda",
		heName: "ספר המדע",
		shortName: "Madda",
		shortHeName: "המדע",
		topics: [
			{ name: "Foundations of the Torah", heName: "יסודי התורה" },
			{ name: "Human Dispositions", heName: "דעות" },
			{ name: "Torah Study", heName: "תלמוד תורה" },
			{
				name: "Foreign Worship and Customs of the Nations",
				heName: "עבודה זרה וחוקות הגויים",
			},
			{ name: "Repentance", heName: "תשובה" },
		],
	},
	{
		name: "Sefer Ahavah",
		heName: "ספר אהבה",
		shortName: "Ahavah",
		shortHeName: "אהבה",
		topics: [
			{ name: "Reading the Shema", heName: "קריאת שמע" },
			{ name: "Prayer and the Priestly Blessing", heName: "תפילה וברכת כהנים" },
			{ name: "Tefillin, Mezuzah and the Torah Scroll", heName: "תפילין ומזוזה וספר תורה" },
			{ name: "Fringes", heName: "ציצית" },
			{ name: "Blessings", heName: "ברכות" },
			{ name: "Circumcision", heName: "מילה" },
			{ name: "The Order of Prayer", heName: "סדר התפילות" },
		],
	},
	{
		name: "Sefer Zemanim",
		heName: "ספר זמנים",
		shortName: "Zemanim",
		shortHeName: "זמנים",
		topics: [
			{ name: "Sabbath", heName: "שבת" },
			{ name: "Eruvin", heName: "עירובין" },
			{ name: "Rest on the Tenth of Tishrei", heName: "שביתת עשור" },
			{ name: "Rest on a Holiday", heName: "שביתת יום טוב" },
			{ name: "Leavened and Unleavened Bread", heName: "חמץ ומצה" },
			{ name: "Shofar, Sukkah and Lulav", heName: "שופר וסוכה ולולב" },
			{ name: "Sheqel Dues", heName: "שקלים" },
			{ name: "Sanctification of the New Month", heName: "קידוש החודש" },
			{ name: "Fasts", heName: "תעניות" },
			{ name: "Scroll of Esther and Hanukkah", heName: "מגילה וחנוכה" },
		],
	},
	{
		name: "Sefer Nashim",
		heName: "ספר נשים",
		shortName: "Nashim",
		shortHeName: "נשים",
		topics: [
			{ name: "Marriage", heName: "אישות" },
			{ name: "Divorce", heName: "גירושין" },
			{ name: "Levirate Marriage and Release", heName: "יבום וחליצה" },
			{ name: "Virgin Maiden", heName: "נערה בתולה" },
			{ name: "Woman Suspected of Infidelity", heName: "סוטה" },
		],
	},
	{
		name: "Sefer Kedushah",
		heName: "ספר קדושה",
		shortName: "Kedushah",
		shortHeName: "קדושה",
		topics: [
			{ name: "Forbidden Intercourse", heName: "איסורי ביאה" },
			{ name: "Forbidden Foods", heName: "מאכלות אסורות" },
			{ name: "Ritual Slaughter", heName: "שחיטה" },
		],
	},
	{
		name: "Sefer Haflaah",
		heName: "ספר הפלאה",
		shortName: "Haflaah",
		shortHeName: "הפלאה",
		topics: [
			{ name: "Oaths", heName: "שבועות" },
			{ name: "Vows", heName: "נדרים" },
			{ name: "Nazariteship", heName: "נזירות" },
			{ name: "Appraisals and Devoted Property", heName: "ערכין וחרמין" },
		],
	},
	{
		name: "Sefer Zeraim",
		heName: "ספר זרעים",
		shortName: "Zeraim",
		shortHeName: "זרעים",
		topics: [
			{ name: "Diverse Species", heName: "כלאים" },
			{ name: "Gifts to the Poor", heName: "מתנות עניים" },
			{ name: "Heave Offerings", heName: "תרומות" },
			{ name: "Tithes", heName: "מעשרות" },
			{ name: "Second Tithes and Fourth Year's Fruit", heName: "מעשר שני ונטע רבעי" },
			{
				name: "First Fruits and other Gifts to Priests Outside the Sanctuary",
				heName: "ביכורים ושאר מתנות כהונה שבגבולין",
			},
			{ name: "Sabbatical Year and the Jubilee", heName: "שמיטה ויובל" },
		],
	},
	{
		name: "Sefer Avodah",
		heName: "ספר עבודה",
		shortName: "Avodah",
		shortHeName: "עבודה",
		topics: [
			{ name: "The Chosen Temple", heName: "בית הבחירה" },
			{ name: "Vessels of the Sanctuary and Those Who Serve Therein", heName: "כלי המקדש והעובדין בו" },
			{ name: "Admission into the Sanctuary", heName: "ביאת המקדש" },
			{ name: "Things Forbidden on the Altar", heName: "איסורי מזבח" },
			{ name: "Sacrificial Procedure", heName: "מעשה הקרבנות" },
			{ name: "Daily Offerings and Additional Offerings", heName: "תמידין ומוספין" },
			{ name: "Sacrifices Rendered Unfit", heName: "פסולי המוקדשין" },
			{ name: "Service on the Day of Atonement", heName: "עבודת יום הכיפורים" },
			{ name: "Trespass", heName: "מעילה" },
		],
	},
	{
		name: "Sefer Korbanot",
		heName: "ספר קרבנות",
		shortName: "Korbanot",
		shortHeName: "קרבנות",
		topics: [
			{ name: "Paschal Offering", heName: "קרבן פסח" },
			{ name: "Festival Offering", heName: "חגיגה" },
			{ name: "Firstlings", heName: "בכורות" },
			{ name: "Offerings for Unintentional Transgressions", heName: "שגגות" },
			{ name: "Offerings for Those with Incomplete Atonement", heName: "מחוסרי כפרה" },
			{ name: "Substitution", heName: "תמורה" },
		],
	},
	{
		name: "Sefer Taharah",
		heName: "ספר טהרה",
		shortName: "Taharah",
		shortHeName: "טהרה",
		topics: [
			{ name: "Defilement by a Corpse", heName: "טומאת מת" },
			{ name: "Red Heifer", heName: "פרה אדומה" },
			{ name: "Defilement by Leprosy", heName: "טומאת צרעת" },
			{ name: "Those Who Defile Bed or Seat", heName: "מטמאי משכב ומושב" },
			{ name: "Other Sources of Defilement", heName: "שאר אבות הטומאות" },
			{ name: "Defilement of Foods", heName: "טומאת אוכלין" },
			{ name: "Vessels", heName: "כלים" },
			{ name: "Immersion Pools", heName: "מקוואות" },
		],
	},
	{
		name: "Sefer Nezikim",
		heName: "ספר נזיקין",
		shortName: "Nezikim",
		shortHeName: "נזיקין",
		topics: [
			{ name: "Damages to Property", heName: "נזקי ממון" },
			{ name: "Theft", heName: "גניבה" },
			{ name: "Robbery and Lost Property", heName: "גזילה ואבידה" },
			{ name: "One Who Injures a Person or Property", heName: "חובל ומזיק" },
			{ name: "Murderer and the Preservation of Life", heName: "רוצח ושמירת נפש" },
		],
	},
	{
		name: "Sefer Kinyan",
		heName: "ספר קניין",
		shortName: "Kinyan",
		shortHeName: "קניין",
		topics: [
			{ name: "Sales", heName: "מכירה" },
			{ name: "Ownerless Property and Gifts", heName: "זכייה ומתנה" },
			{ name: "Neighbors", heName: "שכנים" },
			{ name: "Agents and Partners", heName: "שלוחין ושותפין" },
			{ name: "Slaves", heName: "עבדים" },
		],
	},
	{
		name: "Sefer Mishpatim",
		heName: "ספר משפטים",
		shortName: "Mishpatim",
		shortHeName: "משפטים",
		topics: [
			{ name: "Hiring", heName: "שכירות" },
			{ name: "Borrowing and Deposit", heName: "שאלה ופיקדון" },
			{ name: "Creditor and Debtor", heName: "מלווה ולווה" },
			{ name: "Plaintiff and Defendant", heName: "טוען ונטען" },
			{ name: "Inheritances", heName: "נחלות" },
		],
	},
	{
		name: "Sefer Shoftim",
		heName: "ספר שופטים",
		shortName: "Shoftim",
		shortHeName: "שופטים",
		topics: [
			{
				name: "The Sanhedrin and the Penalties within Their Jurisdiction",
				heName: "סנהדרין והעונשין המסורין להם",
			},
			{ name: "Testimony", heName: "עדות" },
			{ name: "Rebels", heName: "ממרים" },
			{ name: "Mourning", heName: "אבל" },
			{ name: "Kings and Wars", heName: "מלכים ומלחמות" },
		],
	},
];

/** Tractates of the Babylonian Talmud (Bavli) available offline. */
export const GEMARA_TRACTATES: GemaraTractate[] = [
	{ name: "Berakhot", heName: "ברכות" },
	{ name: "Shabbat", heName: "שבת" },
	{ name: "Eruvin", heName: "עירובין" },
	{ name: "Pesachim", heName: "פסחים" },
	{ name: "Rosh Hashanah", heName: "ראש השנה" },
	{ name: "Yoma", heName: "יומא" },
	{ name: "Sukkah", heName: "סוכה" },
	{ name: "Beitzah", heName: "ביצה" },
	{ name: "Taanit", heName: "תענית" },
	{ name: "Megillah", heName: "מגילה" },
	{ name: "Moed Katan", heName: "מועד קטן" },
	{ name: "Chagigah", heName: "חגיגה" },
	{ name: "Yevamot", heName: "יבמות" },
	{ name: "Ketubot", heName: "כתובות" },
	{ name: "Nedarim", heName: "נדרים" },
	{ name: "Nazir", heName: "נזיר" },
	{ name: "Sotah", heName: "סוטה" },
	{ name: "Gittin", heName: "גיטין" },
	{ name: "Kiddushin", heName: "קידושין" },
	{ name: "Bava Kamma", heName: "בבא קמא" },
	{ name: "Bava Metzia", heName: "בבא מציעא" },
	{ name: "Bava Batra", heName: "בבא בתרא" },
	{ name: "Sanhedrin", heName: "סנהדרין" },
	{ name: "Makkot", heName: "מכות" },
	{ name: "Shevuot", heName: "שבועות" },
	{ name: "Avodah Zarah", heName: "עבודה זרה" },
	{ name: "Horayot", heName: "הוריות" },
	{ name: "Zevachim", heName: "זבחים" },
	{ name: "Menachot", heName: "מנחות" },
	{ name: "Chullin", heName: "חולין" },
	{ name: "Bekhorot", heName: "בכורות" },
	{ name: "Arakhin", heName: "ערכין" },
	{ name: "Temurah", heName: "תמורה" },
	{ name: "Keritot", heName: "כריתות" },
	{ name: "Meilah", heName: "מעילה" },
	{ name: "Tamid", heName: "תמיד" },
	{ name: "Niddah", heName: "נדה" },
];

export const DEFAULT_GEMARA_TRACTATE_ALIASES = [
	"ברכות=br",
	"שבת=sh",
	"ראש השנה=rh",
	"מועד קטן=mk",
	"בבא קמא=bk",
	"בבא מציעא=bm",
	"בבא בתרא=bb",
	"עבודה זרה=az",
	"סנהדרין=sanh",
].join("\n");

export interface StudyPrefixMatch {
	mode: StudyMode;
	alias: string;
	remainder: string;
}

export function normalizeStudyName(value: string): string {
	return value
		.trim()
		.toLocaleLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/['"׳״]/g, "")
		.replace(/[^a-z0-9\u0590-\u05ff]+/g, " ")
		.trim();
}

function normalizeAlias(value: string): string {
	return normalizeStudyName(value);
}

function aliasesFromSetting(value: string): string[] {
	return value
		.split(/[\/,;\n]+/)
		.map((alias) => alias.trim())
		.filter(Boolean);
}

export function gemaraAliasMap(value: string): Map<string, string[]> {
	const out = new Map<string, string[]>();
	for (const rawLine of value.split(/\n+/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;
		const parts = line.split(/\s*[:=]\s*/, 2);
		if (parts.length < 2) continue;
		const tractate = resolveGemaraTractate(parts[0]);
		if (!tractate) continue;
		const aliases = aliasesFromSetting(parts[1]);
		if (!aliases.length) continue;
		out.set(tractate.name, [...new Set([...(out.get(tractate.name) ?? []), ...aliases])]);
	}
	return out;
}

export function resolveGemaraTractate(input: string): GemaraTractate | null {
	const normalized = normalizeStudyName(input);
	if (!normalized) return null;
	for (const tractate of GEMARA_TRACTATES) {
		if (normalizeStudyName(tractate.name) === normalized) return tractate;
		if (normalizeStudyName(tractate.heName) === normalized) return tractate;
	}
	return null;
}

export function gemaraTractateNames(tractate: GemaraTractate, aliasSetting: string): string[] {
	const custom = gemaraAliasMap(aliasSetting).get(tractate.name) ?? [];
	return [...new Set([tractate.name, tractate.heName, ...custom])];
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
	// The bundled jagged array uses one index per side: 2a=2, 2b=3, 3a=4, …
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
