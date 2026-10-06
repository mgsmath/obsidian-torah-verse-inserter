<div align="center">

# 📖 Shiur Notes Inserter

**Insérez n'importe quel verset de la Bible hébraïque (Torah / Tanakh) dans vos notes — beau, instantané, hors ligne**

Texte hébreu complet avec nikoud et cantillation · Tapez l'hébreu avec votre **clavier habituel** · Traductions optionnelles

[![GitHub release](https://img.shields.io/github/v/release/mgsmath/obsidian-torah-verse-inserter?style=flat-square)](https://github.com/mgsmath/obsidian-torah-verse-inserter/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/LICENSE)
[![Ko-fi](https://img.shields.io/badge/Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/elevalma)

🌐 [English](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README.md) | [Español](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_es.md) | [עברית](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_he.md) | [العربية](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_ar.md) | Français | [Русский](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_ru.md) | [Português](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_pt.md)

![Shiur Notes Inserter — cherchez l'hébreu avec votre clavier habituel](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/fr/hero.svg)

</div>

---

## ✨ La fonctionnalité phare : l'hébreu sans changer de clavier

Chercher du texte hébreu signifie normalement basculer sans cesse la disposition du clavier. **Pas ici.** Tapez comme vous prononcez — le plugin comprend la translittération latine *naturellement* et trouve l'hébreu :

![Flux de translittération — bereshit trouve l'hébreu](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/fr/translit-flow.svg)

| Vous tapez (clavier habituel) | Il trouve (hébreu) |
|---|---|
| `bereshit` | בְּרֵאשִׁית |
| `shema israel` | שְׁמַע יִשְׂרָאֵל |
| `mayim` | מַיִם |
| `torah` | תּוֹרָה |

Le plugin gère pour vous les subtilités de l'hébreu : les voyelles sont flexibles et les lettres ambiguës (youd, vav, alef) sont appariées intelligemment — ainsi `mayim` trouve מַיִם et `adam` trouve אָדָם sans que vous y pensiez.

Bien sûr, vous pouvez aussi coller ou taper de **l'hébreu directement** (avec ou sans nikoud), ou utiliser le **clavier alef-bet à l'écran** — à vous de choisir.

---

## 📚 Ce qu'il fait

- **Insère n'importe quel verset du Tanakh** (Torah, Nevi'im, Ketouvim — les 39 livres) dans votre note sous forme de citation Markdown propre avec sa référence.
- **Texte hébreu complet embarqué, hors ligne** — le Miqra selon la Massorah (MAM) intégral, avec **nikoud (voyelles) et te'amim (cantillation)**. Le texte hébreu ne nécessite jamais de connexion.
- **Trois façons de trouver un verset :**
  1. **Par référence** — `Genesis 1:1`, `bereshit 1:1-3`, `תהלים 23` (noms de livres en anglais, espagnol, translittération ou hébreu, avec plages)
  2. **Par translittération** — tapez `veahavta` avec votre clavier habituel
  3. **Par texte hébreu** — collez בראשית avec ou sans nikoud
- **Traductions optionnelles** — choisissez dans la bibliothèque de Sefaria (anglais, espagnol, français et plus, selon le livre), insérée sous l'hébreu.
- **Liens AlHaTorah** — une case à cocher ajoute un lien qui ouvre le verset dans les Mikraot Guedolot (Rachi, Ramban, Ibn Ezra côte à côte).
- **Votre format, vos règles** — hébreu avec ou sans nikoud / cantillation, citation ou en ligne.

---

## 🚀 Mode d'emploi

1. **Installez et activez** le plugin (Paramètres → Plugins communautaires → cherchez « Torah » ou « Hebrew »).
2. Ouvrez une note et lancez la commande **« Insérer un passouk (verset du Tanakh) »** depuis la palette de commandes (`Cmd/Ctrl+P`).
   💡 *Attribuez-lui un raccourci dans Paramètres → Raccourcis clavier (cherchez « pasuk »).*
3. **Cherchez** de l'une des trois façons :
   - Référence : `shemot 3:14` ou `Exodus 3:14`
   - Translittération : `ehyeh asher ehyeh` *(clavier habituel !)*
   - Hébreu : `אהיה אשר אהיה`
4. Choisissez éventuellement une **traduction** dans le menu et/ou cochez **Lien AlHaTorah** — les deux choix sont mémorisés.
5. Appuyez sur **Entrée** (ou cliquez un résultat). Terminé :

```markdown
> וַיֹּאמֶר אֱלֹהִים אֶל־מֹשֶׁה אֶהְיֶה אֲשֶׁר אֶהְיֶה...
>
> Dieu dit à Moché : « Je serai qui je serai... »
> — Exodus 3:14 · (fr) Bible du Rabbinat · [AlHaTorah](https://mg.alhatorah.org/Full/Exodus/3.14)
```

### Le clavier alef-bet à l'écran

Cliquez sur le bouton **א** pour ouvrir un clavier hébreu dans la fenêtre de recherche — pratique quand vous voulez une lettre précise (comme ע vs א). Survolez une touche pour voir son nom et son son. Il se souvient si vous l'avez laissé ouvert.

![Clavier alef-bet à l'écran — fonctionnement](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/fr/keyboard.svg)

---

## ⚙️ Paramètres

| Paramètre | Description | Défaut |
|---|---|---|
| Inclure le nikoud (voyelles) | Insérer les versets avec les points-voyelles | On |
| Inclure les te'amim (cantillation) | Insérer les versets avec les signes de cantillation | Off |
| Insérer en bloc de citation | Encadrer les versets dans une citation avec la référence | On |
| Nombre maximal de résultats | Limiter le nombre de versets en recherche textuelle | 30 |
| Compatibilité des polices | Remplacer les signes rares (qamats qatan, holam haser) par des équivalents standard | On |

---

## 🕮 Sources du texte

- **Texte hébreu :** [Miqra selon la Massorah (MAM)](https://en.wikipedia.org/wiki/Miqra_according_to_the_Masorah) — une édition numérique rigoureuse du Tanakh fondée sur le Codex d'Alep, version figée via Sefaria. Dans les cas de ketiv/qeré, le plugin insère le **qeré** (la forme lue), entièrement vocalisé.
- **Traductions :** à la demande depuis la bibliothèque [Sefaria](https://www.sefaria.org) (nécessite internet, optionnel).
- **Liens Mikraot Guedolot :** [AlHaTorah.org](https://mg.alhatorah.org).

---

## ☕ Soutien

Shiur Notes Inserter est gratuit et open source. S'il aide votre étude de la Torah ou votre travail en hébreu, vous pouvez soutenir son développement :

[![Soutenez-moi sur Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/elevalma)

[![Soutenir sur GitHub](https://img.shields.io/badge/Soutenir-%E2%9D%A4-db61a2?logo=github&style=for-the-badge)](https://github.com/sponsors/mgsmath)

---

## 🤝 Contribuer

Issues et PRs bienvenus — en particulier les cas de translittération qui ne trouvent pas ce que vous attendiez, ou des alias de noms de livres dans votre langue. [Ouvrez un issue](https://github.com/mgsmath/obsidian-torah-verse-inserter/issues) avec un exemple.

> Vous cherchez une recherche insensible aux diacritiques dans vos propres notes ? Découvrez mon autre plugin : [Diacritics-Free Search](https://github.com/mgsmath/obsidian-diacritics-free-search).

---

<div align="center">

Fait avec ❤️ pour les étudiants de la Torah et de la langue hébraïque

**[mgsmath](https://github.com/mgsmath)**

</div>
