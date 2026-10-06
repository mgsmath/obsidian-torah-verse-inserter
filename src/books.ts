// Metadata de los 39 libros del Tanaj (orden tradicional).
// `key` debe coincidir con los nombres de archivo del corpus (codigos-torah).

export interface BookInfo {
	key: string; // corpus key
	en: string;
	es: string;
	he: string;
	translit: string; // nombre hebreo romanizado
	aliases: string[]; // abreviaturas y variantes (sin acentos, lowercase)
}

export const BOOKS: BookInfo[] = [
	// --- Torá ---
	{ key: "Genesis", en: "Genesis", es: "Génesis", he: "בְּרֵאשִׁית", translit: "Bereshit", aliases: ["gen", "gn", "ber", "bereshit", "genesis"] },
	{ key: "Exodus", en: "Exodus", es: "Éxodo", he: "שְׁמוֹת", translit: "Shemot", aliases: ["ex", "exo", "shem", "shemot", "exodo"] },
	{ key: "Leviticus", en: "Leviticus", es: "Levítico", he: "וַיִּקְרָא", translit: "Vayikra", aliases: ["lev", "lv", "vay", "vayikra", "levitico"] },
	{ key: "Numbers", en: "Numbers", es: "Números", he: "בְּמִדְבַּר", translit: "Bemidbar", aliases: ["num", "nm", "bam", "bem", "bamidbar", "bemidbar", "numeros"] },
	{ key: "Deuteronomy", en: "Deuteronomy", es: "Deuteronomio", he: "דְּבָרִים", translit: "Devarim", aliases: ["deut", "dt", "dev", "devarim", "deuteronomio"] },
	// --- Neviim ---
	{ key: "Joshua", en: "Joshua", es: "Josué", he: "יְהוֹשֻׁעַ", translit: "Yehoshúa", aliases: ["jos", "josh", "yeho", "yehoshua", "josue"] },
	{ key: "Judges", en: "Judges", es: "Jueces", he: "שׁוֹפְטִים", translit: "Shoftim", aliases: ["jue", "jud", "shof", "shoftim", "jueces"] },
	{ key: "ISamuel", en: "I Samuel", es: "1 Samuel", he: "שְׁמוּאֵל א", translit: "Shmuel Alef", aliases: ["1sam", "1sa", "1samuel", "isamuel", "shmuel1", "shmuela"] },
	{ key: "IISamuel", en: "II Samuel", es: "2 Samuel", he: "שְׁמוּאֵל ב", translit: "Shmuel Bet", aliases: ["2sam", "2sa", "2samuel", "iisamuel", "shmuel2", "shmuelb"] },
	{ key: "IKings", en: "I Kings", es: "1 Reyes", he: "מְלָכִים א", translit: "Melajim Alef", aliases: ["1re", "1rey", "1reyes", "1ki", "1kings", "ikings", "melajim1", "melachim1"] },
	{ key: "IIKings", en: "II Kings", es: "2 Reyes", he: "מְלָכִים ב", translit: "Melajim Bet", aliases: ["2re", "2rey", "2reyes", "2ki", "2kings", "iikings", "melajim2", "melachim2"] },
	{ key: "Isaiah", en: "Isaiah", es: "Isaías", he: "יְשַׁעְיָהוּ", translit: "Yeshaiahu", aliases: ["isa", "is", "yesh", "yeshaiahu", "isaias"] },
	{ key: "Jeremiah", en: "Jeremiah", es: "Jeremías", he: "יִרְמְיָהוּ", translit: "Yirmiyahu", aliases: ["jer", "yirm", "yirmiyahu", "jeremias"] },
	{ key: "Ezekiel", en: "Ezekiel", es: "Ezequiel", he: "יְחֶזְקֵאל", translit: "Yejezkel", aliases: ["eze", "ez", "yejez", "yechezkel", "yejezkel", "ezequiel"] },
	{ key: "Hosea", en: "Hosea", es: "Oseas", he: "הוֹשֵׁעַ", translit: "Hoshea", aliases: ["os", "hos", "hoshea", "oseas"] },
	{ key: "Joel", en: "Joel", es: "Joel", he: "יוֹאֵל", translit: "Yoel", aliases: ["joe", "yoel", "joel"] },
	{ key: "Amos", en: "Amos", es: "Amós", he: "עָמוֹס", translit: "Amós", aliases: ["am", "amos"] },
	{ key: "Obadiah", en: "Obadiah", es: "Abdías", he: "עֹבַדְיָה", translit: "Ovadiá", aliases: ["abd", "oba", "ovadia", "abdias", "obadiah"] },
	{ key: "Jonah", en: "Jonah", es: "Jonás", he: "יוֹנָה", translit: "Yoná", aliases: ["jon", "yona", "jonas", "jonah"] },
	{ key: "Micah", en: "Micah", es: "Miqueas", he: "מִיכָה", translit: "Mijá", aliases: ["miq", "mic", "mija", "micha", "miqueas", "micah"] },
	{ key: "Nahum", en: "Nahum", es: "Nahúm", he: "נַחוּם", translit: "Najum", aliases: ["nah", "najum", "nahum"] },
	{ key: "Habakkuk", en: "Habakkuk", es: "Habacuc", he: "חֲבַקּוּק", translit: "Javakuk", aliases: ["hab", "javakuk", "habacuc", "habakkuk"] },
	{ key: "Zephaniah", en: "Zephaniah", es: "Sofonías", he: "צְפַנְיָה", translit: "Tzefaniá", aliases: ["sof", "zep", "tzefania", "sofonias", "zephaniah"] },
	{ key: "Haggai", en: "Haggai", es: "Ageo", he: "חַגַּי", translit: "Jagai", aliases: ["age", "hag", "jagai", "ageo", "haggai"] },
	{ key: "Zechariah", en: "Zechariah", es: "Zacarías", he: "זְכַרְיָה", translit: "Zejariá", aliases: ["zac", "zec", "zejaria", "zacarias", "zechariah"] },
	{ key: "Malachi", en: "Malachi", es: "Malaquías", he: "מַלְאָכִי", translit: "Malají", aliases: ["mal", "malaji", "malaquias", "malachi"] },
	// --- Ketuvim ---
	{ key: "Psalms", en: "Psalms", es: "Salmos", he: "תְּהִלִּים", translit: "Tehilim", aliases: ["sal", "ps", "psa", "teh", "tehilim", "salmos", "psalms", "salmo"] },
	{ key: "Proverbs", en: "Proverbs", es: "Proverbios", he: "מִשְׁלֵי", translit: "Mishlei", aliases: ["pro", "prov", "mish", "mishlei", "proverbios"] },
	{ key: "Job", en: "Job", es: "Job", he: "אִיּוֹב", translit: "Iyov", aliases: ["job", "iyov", "iov"] },
	{ key: "SongOfSongs", en: "Song of Songs", es: "Cantar de los Cantares", he: "שִׁיר הַשִּׁירִים", translit: "Shir HaShirim", aliases: ["cant", "shir", "shirhashirim", "cantares", "songofsongs", "song"] },
	{ key: "Ruth", en: "Ruth", es: "Rut", he: "רוּת", translit: "Rut", aliases: ["rut", "ruth"] },
	{ key: "Lamentations", en: "Lamentations", es: "Lamentaciones", he: "אֵיכָה", translit: "Eijá", aliases: ["lam", "eija", "eicha", "lamentaciones", "lamentations"] },
	{ key: "Ecclesiastes", en: "Ecclesiastes", es: "Eclesiastés", he: "קֹהֶלֶת", translit: "Kohélet", aliases: ["ecl", "ecc", "kohelet", "qohelet", "eclesiastes", "ecclesiastes"] },
	{ key: "Esther", en: "Esther", es: "Ester", he: "אֶסְתֵּר", translit: "Ester", aliases: ["est", "ester", "esther"] },
	{ key: "Daniel", en: "Daniel", es: "Daniel", he: "דָּנִיֵּאל", translit: "Daniel", aliases: ["dan", "daniel"] },
	{ key: "Ezra", en: "Ezra", es: "Esdras", he: "עֶזְרָא", translit: "Ezrá", aliases: ["esd", "ezr", "ezra", "esdras"] },
	{ key: "Nehemiah", en: "Nehemiah", es: "Nehemías", he: "נְחֶמְיָה", translit: "Nejemiá", aliases: ["neh", "nejemia", "nehemias", "nehemiah"] },
	{ key: "IChronicles", en: "I Chronicles", es: "1 Crónicas", he: "דִּבְרֵי הַיָּמִים א", translit: "Divrei HaYamim Alef", aliases: ["1cr", "1cro", "1cron", "1chronicles", "ichronicles", "divrei1"] },
	{ key: "IIChronicles", en: "II Chronicles", es: "2 Crónicas", he: "דִּבְרֵי הַיָּמִים ב", translit: "Divrei HaYamim Bet", aliases: ["2cr", "2cro", "2cron", "2chronicles", "iichronicles", "divrei2"] },
];

/** Ref de Sefaria por key del corpus (solo los que difieren del key). */
const SEFARIA_REF_OVERRIDES: Record<string, string> = {
	ISamuel: "I_Samuel",
	IISamuel: "II_Samuel",
	IKings: "I_Kings",
	IIKings: "II_Kings",
	SongOfSongs: "Song_of_Songs",
	IChronicles: "I_Chronicles",
	IIChronicles: "II_Chronicles",
};

export function sefariaRef(book: BookInfo): string {
	return SEFARIA_REF_OVERRIDES[book.key] ?? book.key;
}

/**
 * Deep-link al Mikraot Gedolot de AlHaTorah (texto + Rashi, Ramban, Ibn Ezra...).
 * Mismo formato que usa elevalma/codigos-torah en producción.
 */
export function alhatorahUrl(book: BookInfo, chapter: number, verse: number): string {
	return `https://mg.alhatorah.org/Full/${sefariaRef(book)}/${chapter}.${verse}`;
}

/** Normaliza para matching: minúsculas, sin acentos latinos, sin espacios/puntos. */
export function normName(s: string): string {
	return s
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[\s.''׳]/g, "");
}

const lookup = new Map<string, BookInfo>();
for (const b of BOOKS) {
	const names = [b.en, b.es, b.he, b.translit, b.key, ...b.aliases];
	for (const n of names) lookup.set(normName(n), b);
}

/** Resuelve un nombre de libro (exacto o por prefijo único). */
export function resolveBook(input: string): BookInfo | null {
	const n = normName(input);
	if (!n) return null;
	const exact = lookup.get(n);
	if (exact) return exact;
	// prefijo único
	const hits = new Set<BookInfo>();
	for (const [name, book] of lookup) {
		if (name.startsWith(n)) hits.add(book);
	}
	return hits.size === 1 ? [...hits][0] : null;
}
