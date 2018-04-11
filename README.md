# EpubTools LISEZMOI

[![Licence](https://img.shields.io/github/license/civodulab/epubtools.svg)](https://github.com/civodulab/epubtools)
[![VS Code Marketplace](https://vsmarketplacebadge.apphb.com/version-short/civodulab.epubtools.svg) ![Rating](https://vsmarketplacebadge.apphb.com/rating-short/civodulab.epubtools.svg) ![Installs](https://vsmarketplacebadge.apphb.com/installs/civodulab.epubtools.svg)](https://marketplace.visualstudio.com/items?itemName=civodulab.epubtools)

Outils destinés à faciliter le travail sur les EPUB.

([English README](README.en.md)) merci [garconvacher](https://github.com/garconvacher)

## À savoir

Le fichier EPUB doit être décompressé. Ensuite vous pouvez travailler dans les répertoires de celui-ci.

* * *

## EpubTools contenu (`ctrl+shift+P`)

- `EpubTools : A11Y`
  > Ouvre une liste d'outils d'accessibilité :
  > - `DPub-Aria roles` : Ajoute _role="doc-..."_ si _epub:type_ (je me suis aidé des scripts de [JayPanoz](https://gist.github.com/JayPanoz/45896f17a69892de9a121d701c578d1e) et de [rodebert](https://gist.github.com/rodebert/81837a2676cf2c04819a582c3eb49c13))

- `EpubTools : Manifest`
  > Reconstruit le manifest dans l'OPF suivant les fichiers présents dans l'EPUB. La commande doit être lancée dans le fichier `.opf`.

- `EpubTools : Table des matières`

  > Modifie les fichiers contenant une table des matières `(toc).xhtml` ou/et `(toc).ncx` en utilisant le `<spine>` de l'`opf`.

- `EpubTools : premier <h.> => <title>`

  > Copie le premier titre (s'il y en a) de chaque page `xhtml` dans la balise `<title>` de celle-ci.

- `EpubTools : Création Page Liste`

  >  Récupère les balises avec l'attribut `epub:type="pagebreak"`. Crée ou modifie `<nav epub:type="page-list">` dans le fichier de la table des matière `(toc).xhtml`.

- `EpubTools : Problèmes ?`

  >  Affiche les problèmes dans l'onglet `SORTIE` :
  > - Pages sans titre
  > - Hiérarchie des titres illogique (`h1` suivi d'un `h3` sans `h2` par exemple)
  > - Affiche les problèmes de liens dans le spine de l'opf

- `EpubTools : <span...>{numPage}</span> => <span {epub:type} />`

  >  Transforme les ...
  > ```xhtml
  > <span class="epubTools-numPage-style">{numéro}</span>
  > ```
  > ... en
  > ```xhtml
  >  <span id="page{numéro}" title="{numéro}" epub:type="pagebreak" role="doc-pagebreak"></span>
  >  ```

  _**Astuce :** Utiliser le script Indesign [epubTools-numPage](https://github.com/civodulab/epubTools-numPage) avant l'export en EPUB._

* * *

## EpubTools Configuration (`ctrl+,`)

- `epub.niveauTitre`
  > Niveau de titre dans la table des matières (défaut : **3**)

- `epub.titreTDM`
  - `titre` : Titre de la table des matières (défaut : **Table des matières**)
  - `balise` : Balise pour le titre (défaut : **h1**)
  - `classe` : classe pour le titre (défaut : **titre1**)

- `epub.classeTDM`
  > Classe appliquée à la balise `<ol>` (défaut : **ol-toc**)

- `epub.ancreTDM`
  - `ajouterAncre` : boolean  (défaut : **true**)
  - `nomAncre` : préfixe du nom de l'ancre (défaut : **toc-epubtools**)

- `epub.coverImage`
  > Nom de la couverture de l'ouvrage (Permet d'ajouter la _properties_ **cover-image** à l'image dans le _manifest_)

- `epub.activerA11ylint`
  > Active _a11ylint_ (défaut **true**)

* * *

## EpubToolsLint

- Vérification des images :
  - `alt` vide
  - pas de `alt`

* * *

## Release Notes

## 1.7.3

- ajout `media-overlay` (manifest)
- option activer `a11ylint`

Toutes les [release notes](release-notes.md).