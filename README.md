# EpubTools LISEZMOI <!-- omit in toc -->

[![Licence](https://img.shields.io/github/license/civodulab/epubtools.svg)](https://github.com/civodulab/epubtools)
[![VS Code Marketplace](https://vsmarketplacebadge.apphb.com/version-short/civodulab.epubtools.svg) ![Rating](https://vsmarketplacebadge.apphb.com/rating-short/civodulab.epubtools.svg) ![Installs](https://vsmarketplacebadge.apphb.com/installs/civodulab.epubtools.svg)](https://marketplace.visualstudio.com/items?itemName=civodulab.epubtools)

Outils destinés à faciliter le travail sur les EPUB.

([English README](README.en.md)) merci [garconvacher](https://github.com/garconvacher)

***

## Table des matières <!-- omit in toc -->
- [À savoir](#%C3%A0-savoir)
- [EpubTools contenu](#epubtools-contenu)
- [EpubTools Configuration](#epubtools-configuration)
- [A11yLint](#a11ylint)
- [Release Notes](#release-notes)

***

## À savoir

Le fichier EPUB doit être décompressé. Ensuite vous pouvez travailler dans les répertoires de celui-ci.

* * *

## EpubTools contenu (`ctrl+shift+P`) <a id="epubtools-contenu"></a>

- `EpubTools : A11Y`
  > Ouvre une liste d'outils pour améliorer l'accessibilité :
  > - `DPub-Aria roles|epub:type` : ajoute _role="doc-`X`"_ dans les balises comportant _epub:type="`X`"_ et inversement (je me suis aidé des scripts de [JayPanoz](https://gist.github.com/JayPanoz/45896f17a69892de9a121d701c578d1e) et de [rodebert](https://gist.github.com/rodebert/81837a2676cf2c04819a582c3eb49c13))  
  > Référence : [Digital Publishing WAI-ARIA Module 1.0](https://www.w3.org/TR/dpub-aria-1.0/)

- `EpubTools : Manifest`
  > Reconstruit le manifest dans l'OPF suivant les fichiers présents dans l'EPUB. La commande doit être lancée dans le fichier `.opf`.  
  > Renomme les fichiers contenant des caractères accentués ou des espaces

- `EpubTools : Récriture Spine`
  > Récrit le spine dans le fichier `.opf`. La commande doit être lancée dans le fichier `.opf`.  

- `EpubTools : Table des matières`

  > Modifie les fichiers contenant une table des matières `(toc).xhtml` ou/et `(toc).ncx` en utilisant le `<spine>` de l'`opf`.  
  > Ajoute si besoin des `id="toc-epubtools-XX"` dans les titres (`<h.>`) pour créer des ancres.

- `EpubTools : premier <h.> => <title>`

  > Copie le premier titre (s'il y en a) de chaque page `xhtml` dans la balise `<title>` de celle-ci.

- `EpubTools : Création Page Liste`

  >  Récupère les balises avec l'attribut `epub:type="pagebreak"`. Crée ou modifie `<nav epub:type="page-list">` dans le fichier de la table des matière `(toc).xhtml`.

- `EpubTools : Problèmes ?`

  >  Affiche les problèmes dans l'onglet `SORTIE` :
  > - Pages sans titre
  > - Hiérarchie des titres illogique (`h1` suivi d'un `h3` sans `h2` par exemple)
  > - Problèmes dans le `<spine>` de l'opf si un `idref` dans un `<itemref>` manque dans le `<manifest>`
  > - Problèmes des tableaux sans `<th>`, `scope` ou `headers`.

- `EpubTools : <span...>{numPage}</span> => <span {epub:type} />`

  >  Transforme les ...
  > ```xhtml
  > <span class="epubTools-numPage-style">{numéro}</span>
  > ```
  > ... en
  > ```xhtml
  >  <span id="page{numéro}" title="{numéro}" epub:type="pagebreak" role="doc-pagebreak"></span>
  >  ```

  _**Astuce :** Utiliser le script InDesign [epubTools-numPage](https://github.com/civodulab/epubTools-numPage) avant l'export en EPUB._

* * *

## EpubTools Configuration (`ctrl+,`) <a id="epubtools-configuration"></a>

- `epub.niveauTitre`
  > Niveau de titre dans la table des matières (défaut : **3**)

- `epub.titreTDM`
  - `titre` : titre de la table des matières (défaut : **Table des matières**)
  - `balise` : balise pour le titre (défaut : **h1**)
  - `classe` : classe pour le titre (défaut : **titre1**)

- `epub.classeTDM`
  > Classe appliquée à la balise `<ol>` (défaut : **ol-toc**)

- `epub.ancreTDM`
  - `ajouterAncre` : boolean  (défaut : **true**)
  - `nomAncre` : préfixe du nom de l'ancre (défaut : **toc-epubtools**)

- `epub.coverImage`
  > Nom du fichier pour la couverture de l'ouvrage (Permet d'ajouter  _properties="**cover-image**"_ à l'image dans le `<manifest>` - défaut : **cover**)

- `epub.activerA11ylint` ([A11yLint](#a11ylint))
  > Active _a11ylint_ (défaut **true**)

- `epub.emphaseStyleAChercher` ([A11yLint](#a11ylint))
  > Styles contenant le mot dans son nom. Permet de trouver les classes à changer.
  > - `italique` (défaut **["italique","italic"]**)
  > - `gras` (défaut **["bold", "gras", "strong"]**)
  > - `emphase` (défaut **["emphase", "emphasis"]**)

- `epub.emphaseStyleAEviter` ([A11yLint](#a11ylint))
  > Styles non pris en compte par `epub.emphaseStyleAChercher` (default **["no-bold", "no-italique","no-emphase"]**)

* * *

## A11yLint
_[Accessible Publishing Knowledge Base](http://kb.daisy.org/publishing/)_
- Vérification des images `<img>` :
  - `alt` vide
  - pas de `alt`
- Vérification des `<span>` avec classe italique, gras, etc. => transformer en `<em>` ?
- Vérification des `noteref` dans des `<sup>` => retirer `<sup>`

* * *

## Release Notes

### 1.8.3

- ajout configuration `a11ylint`

Toutes les [release notes](CHANGELOG.md).