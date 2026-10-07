<div align="center">

# 📖 Shiur Notes Inserter

**Insira qualquer versículo da Bíblia hebraica (Torá / Tanakh) nas suas notas — bonito, instantâneo, offline**

Texto hebraico completo com nikud e cantilação · Digite hebraico com o **teclado normal** · Traduções opcionais

[![GitHub release](https://img.shields.io/github/v/release/mgsmath/obsidian-torah-verse-inserter?style=flat-square)](https://github.com/mgsmath/obsidian-torah-verse-inserter/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/LICENSE)
[![Ko-fi](https://img.shields.io/badge/Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/elevalma)

🌐 [English](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README.md) | [Español](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_es.md) | [עברית](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_he.md) | [العربية](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_ar.md) | [Français](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_fr.md) | [Русский](https://github.com/mgsmath/obsidian-torah-verse-inserter/blob/main/README_ru.md) | Português

![Shiur Notes Inserter — pesquise hebraico com o teclado normal](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/pt/hero.svg)

</div>

---

## ✨ O recurso matador: hebraico sem trocar de teclado

Pesquisar texto hebraico normalmente significa alternar o layout do teclado o tempo todo. **Aqui não.** Digite como você pronuncia — o plugin entende a transliteração latina *naturalmente* e encontra o hebraico:

![Fluxo de transliteração — bereshit encontra o hebraico](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/pt/translit-flow.svg)

| Você digita (teclado normal) | Ele encontra (hebraico) |
|---|---|
| `bereshit` | בְּרֵאשִׁית |
| `shema israel` | שְׁמַע יִשְׂרָאֵל |
| `mayim` | מַיִם |
| `torah` | תּוֹרָה |

O plugin cuida das partes difíceis do hebraico: as vogais são flexíveis e as letras ambíguas (yud, vav, alef) são correspondidas com inteligência — assim `mayim` encontra מַיִם e `adam` encontra אָדָם sem você pensar nisso.

Claro, você também pode colar ou digitar **hebraico diretamente** (com ou sem nikud), ou usar o **teclado alef-bet na tela** — você escolhe.

---

## 📚 O que ele faz

- **Insere qualquer versículo do Tanakh** (Torá, Nevi'im, Ketuvim — todos os 39 livros) na sua nota como uma citação Markdown limpa com sua referência.
- **Texto hebraico completo embutido, offline** — o Miqra segundo a Massorá (MAM) integral, com **nikud (vogais) e te'amim (cantilação)**. O texto hebraico nunca precisa de conexão.
- **Três formas de encontrar um versículo:**
  1. **Por referência** — `Genesis 1:1`, `bereshit 1:1-3`, `תהלים 23` (nomes de livros em inglês, espanhol, transliteração ou hebraico, com intervalos)
  2. **Por transliteração** — digite `veahavta` com o teclado normal
  3. **Por texto hebraico** — cole בראשית com ou sem nikud
- **Traduções opcionais** — escolha da biblioteca do Sefaria (inglês, espanhol, francês e mais, varia por livro), inserida abaixo do hebraico.
- **Links AlHaTorah** — uma caixa de seleção adiciona um link que abre o versículo no Mikraot Gedolot (Rashi, Ramban, Ibn Ezra lado a lado).
- **Seu formato, suas regras** — hebraico com ou sem nikud / cantilação, citação ou na linha.

---

## 🚀 Como usar

1. **Instale e ative** o plugin (Configurações → Plugins da comunidade → pesquise "Torah" ou "Hebrew").
2. Abra uma nota e execute o comando **"Inserir pasuk (versículo do Tanakh)"** pela paleta de comandos (`Cmd/Ctrl+P`).
   💡 *Atribua um atalho em Configurações → Atalhos de teclado (pesquise "pasuk").*
3. **Pesquise** de qualquer uma das três formas:
   - Referência: `shemot 3:14` ou `Exodus 3:14`
   - Transliteração: `ehyeh asher ehyeh` *(teclado normal!)*
   - Hebraico: `אהיה אשר אהיה`
4. Opcionalmente escolha uma **tradução** no menu e/ou marque **Link AlHaTorah** — ambas as escolhas são lembradas.
5. Pressione **Enter** (ou clique em um resultado). Pronto:

```markdown
> וַיֹּאמֶר אֱלֹהִים אֶל־מֹשֶׁה אֶהְיֶה אֲשֶׁר אֶהְיֶה...
>
> E Deus disse a Moshé: "Serei o que serei..."
> — Exodus 3:14 · [AlHaTorah](https://mg.alhatorah.org/Full/Exodus/3.14)
```

### O teclado alef-bet na tela

Clique no botão **א** para abrir um teclado hebraico dentro da janela de pesquisa — útil quando você quer uma letra específica (como ע vs א). Passe o mouse sobre qualquer tecla para ver seu nome e som. Ele lembra se você o deixou aberto.

![Teclado alef-bet na tela — como funciona](https://raw.githubusercontent.com/mgsmath/obsidian-torah-verse-inserter/main/assets/pt/keyboard.svg)

---

## ⚙️ Configurações

| Configuração | Descrição | Padrão |
|---|---|---|
| Incluir nikud (vogais) | Inserir os versículos com sinais vocálicos | On |
| Incluir te'amim (cantilação) | Inserir os versículos com sinais de cantilação | Off |
| Inserir como citação | Envolver os versículos em um blockquote com a referência | On |
| Referência em nota de rodapé | A referência vai numa nota ligada ao texto | Off |
| Estilo da nota de rodapé | Em linha `^[Bereshit 1:1]`, ou numerada `[^1]` com a definição no fim da nota | Em linha |
| Máximo de resultados | Limitar quantos versículos aparecem na pesquisa por texto | 30 |
| Compatibilidade de fontes | Substituir sinais raros (qamats qatan, holam haser) por equivalentes padrão | On |

---

## 📁 Biblioteca de fontes (מקורות/)

Cada fonte tem a sua própria nota no cofre, com pastas e nomes em hebraico e numeração com letras hebraicas:

| Fonte | Unidade | Caminho |
|---|---|---|
| Tanakh (תנ״ך) | 1 versículo por arquivo | `מקורות/תנך/[livro]/פרק [letra]/[letra].md` |
| Guemará (גמרא) | 1 amud por arquivo | `מקורות/גמרא/[tratado]/פרק [letra]/[daf amud].md` |
| Rambam (רמב״ם) | 1 halachá por arquivo | `מקורות/רמבם/[seção]/פרק [letra]/[letra].md` |

```text
מקורות/תנך/בראשית/פרק א/א.md
מקורות/גמרא/ברכות/פרק א/ב עא.md   ← daf 2 amud א
מקורות/רמבם/קריאת שמע/פרק א/א.md  ← sem o prefixo "הלכות"
```

Cada nota contém apenas um título em hebraico com a localização e o texto da fonte, seguido de links para a fonte anterior, a seguinte e a primeira do seu capítulo. A referência inserida é um **wikilink** para esse arquivo:

```md
> וַתֹּאמֶר הָאִשָּׁה...
> — [[מקורות/תנך/בראשית/פרק כ/ד|בְּרֵאשִׁית כ:ד]]
```

`mekorot-library.zip` (anexado a cada versão, ou gerado com `npm run build-library`) contém toda a biblioteca: 23.206 versículos, 5.349 amudim e 15.210 halachot. Extraia-o na raiz do cofre. O plugin também cria os arquivos que faltam na hora de inserir e **nunca sobrescreve** os que já existem.

## 🕮 Fontes do texto

- **Texto hebraico:** [Miqra segundo a Massorá (MAM)](https://en.wikipedia.org/wiki/Miqra_according_to_the_Masorah) — uma edição digital meticulosa do Tanakh baseada no Códice de Alepo, com versão fixada via Sefaria. Em casos de ketiv/qere, o plugin insere o **qere** (a forma lida), totalmente vocalizado.
- **Traduções:** sob demanda da biblioteca do [Sefaria](https://www.sefaria.org) (requer internet, opcional).
- **Links do Mikraot Gedolot:** [AlHaTorah.org](https://mg.alhatorah.org).

---

## ☕ Apoio

Shiur Notes Inserter é gratuito e de código aberto. Se ele ajuda no seu estudo de Torá ou no seu trabalho com hebraico, você pode apoiar o desenvolvimento:

[![Apoie no Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/elevalma)

[![Apoiar no GitHub](https://img.shields.io/badge/Apoiar-%E2%9D%A4-db61a2?logo=github&style=for-the-badge)](https://github.com/sponsors/mgsmath)

---

## 🤝 Contribuindo

Issues e PRs são bem-vindos — especialmente casos de transliteração que não encontraram o que você esperava, ou apelidos de livros no seu idioma. [Abra um issue](https://github.com/mgsmath/obsidian-torah-verse-inserter/issues) com um exemplo.

> Procurando pesquisa sem diacríticos dentro das suas próprias notas? Conheça meu outro plugin: [Diacritics-Free Search](https://github.com/mgsmath/obsidian-diacritics-free-search).

---

<div align="center">

Feito com ❤️ para estudantes da Torá e da língua hebraica

**[mgsmath](https://github.com/mgsmath)**

</div>
