<div align="center">

# 📖 Shiur Notes Inserter

**Inserta cualquier versículo de la Biblia hebrea (Torá / Tanaj) en tus notas — bello, instantáneo y sin internet**

Texto hebreo completo con nikud y cantilación · Escribe hebreo con tu **teclado normal** · Traducciones opcionales

[![GitHub release](https://img.shields.io/github/v/release/mgsmath/obsidian-torah-verse-inserter?style=flat-square)](https://github.com/mgsmath/obsidian-torah-verse-inserter/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/LICENSE)
[![Ko-fi](https://img.shields.io/badge/Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/elevalma)

🌐 [English](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README.md) | Español | [עברית](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_he.md) | [العربية](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_ar.md) | [Français](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_fr.md) | [Русский](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_ru.md) | [Português](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_pt.md)

![Shiur Notes Inserter — busca hebreo con tu teclado normal](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/es/hero.svg)

</div>

---

## ✨ La función estrella: hebreo sin cambiar de teclado

Buscar texto hebreo normalmente significa cambiar la distribución del teclado a cada rato. **Aquí no.** Escribe como lo pronuncias — el plugin entiende la transliteración latina *de forma natural* y encuentra el hebreo:

![Flujo de transliteración — bereshit encuentra el hebreo](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/es/translit-flow.svg)

| Tú escribes (teclado normal) | Encuentra (hebreo) |
|---|---|
| `bereshit` | בְּרֵאשִׁית |
| `shema israel` | שְׁמַע יִשְׂרָאֵל |
| `mayim` | מַיִם |
| `torah` | תּוֹרָה |

El plugin maneja por ti las partes difíciles del hebreo: las vocales son flexibles y las letras ambiguas (yud, vav, álef) se comparan con inteligencia — así `mayim` encuentra מַיִם y `adam` encuentra אָדָם sin que lo pienses.

Por supuesto, también puedes pegar o escribir **hebreo directamente** (con o sin nikud), o usar el **teclado alef-bet en pantalla** — tú eliges.

---

## 📚 Qué hace

- **Inserta cualquier versículo del Tanaj** (Torá, Nevi'im, Ketuvim — los 39 libros) en tu nota como una cita Markdown limpia con su referencia.
- **Texto hebreo completo incluido, sin internet** — el Miqra al pi haMasorá (MAM) completo, con **nikud (vocales) y te'amim (cantilación)**. El texto hebreo nunca necesita conexión.
- **Tres formas de encontrar un versículo:**
  1. **Por referencia** — `Génesis 1:1`, `Gén 1:1-3`, `bereshit 1:1`, `תהלים 23` (nombres de libros en español, inglés, transliteración o hebreo, con rangos)
  2. **Por transliteración** — escribe `veahavta` con tu teclado normal
  3. **Por texto hebreo** — pega בראשית con o sin nikud
- **Traducciones opcionales** — elige de la biblioteca de Sefaria (español, inglés, francés y más, varía por libro) y se inserta debajo del hebreo.
- **Links a AlHaTorah** — un checkbox agrega un enlace que abre el versículo en el Mikraot Gedolot (Rashi, Rambán, Ibn Ezra lado a lado).
- **Tu formato, tus reglas** — hebreo con o sin nikud / cantilación, cita o en línea.

---

## 🚀 Cómo se usa

1. **Instala y activa** el plugin (Ajustes → Plugins de la comunidad → busca "Torah" o "Hebrew").
2. Abre una nota y ejecuta el comando **"Insertar pasuk (versículo del Tanaj)"** desde la paleta de comandos (`Cmd/Ctrl+P`).
   💡 *Asígnale un atajo en Ajustes → Atajos de teclado (busca "pasuk") — ej. `Cmd+Shift+P`.*
3. **Busca** de cualquiera de las tres formas:
   - Referencia: `shemot 3:14` o `Éxodo 3:14` o `Exodus 3:14`
   - Transliteración: `ehyeh asher ehyeh` *(teclado normal — ¡sin distribución hebrea!)*
   - Hebreo: `אהיה אשר אהיה`
4. Opcionalmente elige una **traducción** del menú y/o marca **Link a AlHaTorah** — ambas elecciones se recuerdan.
5. Presiona **Enter** (o haz clic en un resultado). Listo:

```markdown
> וַיֹּאמֶר אֱלֹהִים אֶל־מֹשֶׁה אֶהְיֶה אֲשֶׁר אֶהְיֶה...
>
> Y dijo Dios a Moshé: "Seré el que seré..."
> — Éxodo 3:14 · (es) El Pentateuco con Rashí · [AlHaTorah](https://mg.alhatorah.org/Full/Exodus/3.14)
```

### El teclado alef-bet en pantalla

Haz clic en el botón **א** para abrir un teclado hebreo dentro de la ventana de búsqueda — útil cuando quieres una letra específica (como ע vs א). Pasa el cursor sobre cualquier tecla para ver su nombre y sonido. Recuerda si lo dejaste abierto.

![Teclado alef-bet en pantalla — cómo funciona](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/es/keyboard.svg)

---

## ⚙️ Ajustes

| Ajuste | Descripción | Default |
|---|---|---|
| Incluir nikud (vocales) | Insertar los versículos con puntos vocálicos | On |
| Incluir te'amim (cantilación) | Insertar los versículos con marcas de cantilación | Off |
| Insertar como cita | Envolver los versículos en un blockquote con la referencia | On |
| Referencia en nota al pie | La referencia va en una nota al pie unida al texto | Off |
| Estilo de nota al pie | En línea `^[Bereshit 1:1]`, o numerada `[^1]` con la definición al final de la nota | En línea |
| Máximo de resultados | Límite de versículos al buscar por texto | 30 |
| Compatibilidad de fuentes | Reemplaza signos raros (kamatz katán, jolam jaser) por equivalentes estándar para que se vean en cualquier fuente | On |

---

## 📁 Biblioteca de fuentes (מקורות/)

Cada fuente vive en su propia nota del vault, con carpetas y nombres en hebreo y numeración con letras hebreas:

| Fuente | Unidad | Ruta |
|---|---|---|
| Tanaj (תנ״ך) | 1 versículo por archivo | `מקורות/תנך/[libro]/פרק [letra]/[letra].md` |
| Guemará (גמרא) | 1 amud por archivo | `מקורות/גמרא/[tratado]/פרק [letra]/[daf amud].md` |
| Rambam (רמב״ם) | 1 halajá por archivo | `מקורות/רמבם/[sección]/פרק [letra]/[letra].md` |

```text
מקורות/תנך/בראשית/פרק א/א.md
מקורות/גמרא/ברכות/פרק א/ב עא.md   ← daf 2 amud א
מקורות/רמבם/קריאת שמע/פרק א/א.md  ← sin el prefijo "הלכות"
```

Cada nota lleva el texto, propiedades YAML (colección, libro/tratado/sección, capítulo, versículo/daf/halajá, la cita en hebreo y la referencia de Sefaria) y enlaces al archivo anterior, al siguiente y al primero de su capítulo. La referencia insertada es un **wikienlace** a ese archivo:

```md
> וַתֹּאמֶר הָאִשָּׁה...
> — [[מקורות/תנך/בראשית/פרק כ/ד|בְּרֵאשִׁית כ:ד]]
```

`mekorot-library.zip` (adjunto a cada versión, o con `npm run build-library`) contiene toda la biblioteca: 23 206 versículos, 5349 amudim y 15 210 halajot. Extráelo en la raíz del vault. El complemento también crea los archivos que falten al insertar, y **nunca sobrescribe** los que ya existen.

## 🕮 Fuentes del texto

- **Texto hebreo:** [Miqra al pi haMasorá (MAM)](https://en.wikipedia.org/wiki/Miqra_according_to_the_Masorah) — una edición digital meticulosa del Tanaj basada en el Códice de Alepo, con versión fijada vía Sefaria. En los casos de ketiv/qeré, el plugin inserta el **qeré** (la forma que se lee), totalmente vocalizado.
- **Traducciones:** bajo demanda desde la biblioteca de [Sefaria](https://www.sefaria.org) (requiere internet, opcional).
- **Links al Mikraot Gedolot:** [AlHaTorah.org](https://mg.alhatorah.org).

---

## ☕ Apoyo

Shiur Notes Inserter es gratuito y de código abierto. Si te ayuda en tu estudio de Torá o tu trabajo con hebreo, puedes apoyar su desarrollo:

[![Apóyame en Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/elevalma)

[![Patrocinar en GitHub](https://img.shields.io/badge/Patrocinar-%E2%9D%A4-db61a2?logo=github&style=for-the-badge)](https://github.com/sponsors/mgsmath)

---

## 🤝 Contribuir

Issues y PRs son bienvenidos — sobre todo casos de transliteración que no encuentren lo que esperabas, o alias de nombres de libros en tu idioma. [Abre un issue](https://github.com/mgsmath/obsidian-torah-verse-inserter/issues) con un ejemplo.

> ¿Buscas búsqueda sin diacríticas dentro de tus propias notas? Conoce mi otro plugin: [Diacritics-Free Search](https://github.com/mgsmath/obsidian-diacritics-free-search).

---

<div align="center">

Hecho con ❤️ para estudiantes de la Torá y de la lengua hebrea

**[mgsmath](https://github.com/mgsmath)**

</div>
