# EpubTools README

Tools to facilitate work on EPUBs.

## Important

The EPUB file must be uncompressed. Then you can work in his directories.

----------

## EpubTools contents (`ctrl+shift+P`)

- `EpubTools: Manifest`
  > Rebuilds the manifest in the OPF according to the files in the EPUB. The command must be launched in the `.opf` file.
- `EpubTools: Table des matières`
  > Modify files containing a table of contents `(toc).xhtml` or/and `(toc).ncx` using the `spine` of the `opf`.
- `EpubTools: premier <h.> => <title>`
  > Copy the first title (if any) of each `xhtml` page into the`<title>`tag of that page.
- `EpubTools: Création Page Liste`
  >  Retrieves tags with the `epub:type="pagebreak"` attribute. Creates or modifies `<nav epub:type="page-list">` in the table of contents file `(toc).xhtml`.
- `EpubTools: Problèmes ?`
  >  Displays problems in the `OUTPUT` tab:
  >- Pages without `<h>`
  >- Bad hierarchy of titles  (e.g., `h1` followed by `h3` without `h2` between them).

----------

## EpubTools Configuration (`ctrl+,`)

- `epub.niveauTitre`
    > Titles level in the table of contents (default: **3**)
- `epub.titreTDM`
  - `titre`: Text title of the table of contents (default: **Table des matières**)
  - `balise`: HTML Tag for the title (default: **h1**)
  - `classe`: CSS class for the title (default: **titre1**)
- `epub.classeTDM`
  > CSS class applied to the `<ol>` tag (default: **ol-toc**)
- `epub.ancreTDM`
  - `ajouterAncre`: boolean  (default: **true**)
  - `nomAncre`: prefix's name of the (default: **toc-epubtools**)

----------

## Release Notes

### 1.5.2
- README in english.

### 1.5.1

- correction bug lors de l'ajout des ancres de titre.

### 1.5.0

- Affiche les problèmes (cf. `EpubTools: Problèmes ?`)
- Vérification de la hiérarchisation des titres.

### 1.4.13

- fix TOC

### 1.4.7

- correction bug Table des matières (merci [garconvacher](https://github.com/garconvacher)).

### 1.4.6

- modification des paramètres de configuration TDM
  - ajout de `balise`
  - ajout de `classe`

### 1.4.5

- Correction bug "cannot find command"
- Indique les fichiers ne contenant pas de titre lors de `EpubTools: Table des matières`
- Fix "page-liste" (message lorsqu'il n'y a pas de "pagebreak" dans l'EPUB)

### 1.4.0

- Ajout de "page-liste"

### 1.3.2

- fix bug "properties" vide
- fix "media-type" JPG, jpeg

### 1.3.1

- changement de logo

### 1.3.0

- correction bug dans le manifest (merci [garconvacher](https://github.com/garconvacher)).
- ajout d'ancres sur les titres (cf. options) (re-merci [garconvacher](https://github.com/garconvacher))

### 1.2.2

- correction bug

### 1.2.1

- OPF xhtml item properties
  - "scripted"
  - "mathml"
  - "nav"

### 1.2.0

- ajout `EpubTools: premier <h.> => <title>`

### 1.1.1

- correction bug quand on déplace les fichiers toc

### 1.1.0

- être dans un fichier TDM pour appliquer `Table des matières`

### 1.0.1

- corrections bug
- image

### 1.0.0

- Manifest
- Table des matières
