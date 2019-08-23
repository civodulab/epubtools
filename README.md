# EpubTools LISEZMOI <!-- omit in toc -->

[![Licence](https://img.shields.io/github/license/civodulab/epubtools.svg)](https://github.com/civodulab/epubtools)
[![VS Code Marketplace](https://vsmarketplacebadge.apphb.com/version-short/civodulab.epubtools.svg) ![Rating](https://vsmarketplacebadge.apphb.com/rating-short/civodulab.epubtools.svg) ![Installs](https://vsmarketplacebadge.apphb.com/installs/civodulab.epubtools.svg) ![Downloads](https://vsmarketplacebadge.apphb.com/downloads/civodulab.epubtools.svg)](https://marketplace.visualstudio.com/items?itemName=civodulab.epubtools)

Outils destinés à faciliter le travail sur les EPUB.

([English README](README.en.md)) merci [garconvacher](https://github.com/garconvacher)

***

## Table des matières <!-- omit in toc -->
- [À savoir](#%c3%80-savoir)
- [EpubTools contenu (`ctrl+shift+P`) <a id="epubtools-contenu"></a>](#epubtools-contenu-ctrlshiftp-a-id%22epubtools-contenu%22a)
- [EpubTools Configuration (`ctrl+,`) <a id="epubtools-configuration"></a>](#epubtools-configuration-ctrl-a-id%22epubtools-configuration%22a)
- [A11yLint](#a11ylint)
- [Release Notes](#release-notes)

***

## À savoir

Le fichier EPUB doit être décompressé. Ensuite vous pouvez travailler dans les répertoires de celui-ci.

***

## EpubTools contenu (`ctrl+shift+P`) <a id="epubtools-contenu"></a>

- `EpubTools : Insertion nav`
  > _(Si titre dans le `<nav>` celui-ci est conservé)_  
  > Liste déroulante avec :
  > - `TDM` : Insère la table des matières. Il faut être dans le fichier `(toc).xhtml` ou `(toc).ncx`;  
  > Utilise le `<spine>` de l'`opf`.  
  > Ajoute si besoin des `id="toc-epubtools-XX"` dans les titres (`<h.>`) pour créer des ancres.
  > - `Page List` : Insère la liste des pages;
  > - `Table List` : Insère la liste des tableaux;
  > - `Illustration List` : Insère la liste des illustrations/images. Ne prends que les balises `<figure>` contenant `<img>`.
  > - `Audio List` : Insère la liste des fichiers audios. Récupère le `aria-label` de la balise sinon affiche l'`id`.
  > - `Video List` : Insère la liste des vidéos. Récupère le `aria-label` de la balise sinon affiche l'`id`.

- `EpubTools : A11Y`
  > Ouvre une liste d'outils pour améliorer l'accessibilité :
  > - `DPub-Aria roles|epub:type` : ajoute _role="doc-`X`"_ dans les balises comportant _epub:type="`X`"_ (je me suis aidé des scripts de [JayPanoz](https://gist.github.com/JayPanoz/45896f17a69892de9a121d701c578d1e) et de [rodebert](https://gist.github.com/rodebert/81837a2676cf2c04819a582c3eb49c13))  
  > Référence : [Digital Publishing WAI-ARIA Module 1.0](https://www.w3.org/TR/dpub-aria-1.0/)

- `EpubTools : Création Page Liste`

  >  Récupère les balises avec l'attribut `epub:type="pagebreak"`. Crée ou modifie `<nav epub:type="page-list">` dans le fichier de la table des matière `(toc).xhtml`.

- `EpubTools : Manifest`
  > Reconstruit le manifest dans l'OPF suivant les fichiers présents dans l'EPUB. La commande doit être lancée dans le fichier `.opf`.  
  > Renomme les fichiers contenant des caractères accentués ou des espaces

- `EpubTools : Récriture Spine`
  > Récrit le spine dans le fichier `.opf`. La commande doit être lancée dans le fichier `.opf`.  

- `EpubTools : premier <h.> => <title>`

  > Copie le premier titre (s'il y en a) de chaque page `xhtml` dans la balise `<title>` de celle-ci.

- `EpubTools : Problèmes ?`

  > Modifie les fichiers contenant une table des matières `(toc).xhtml` ou/et `(toc).ncx` en utilisant le `<spine>` de l'`opf`.  
  > Ajoute si besoin des `id="toc-epubtools-XX"` dans les titres (`<h.>`) pour créer des ancres.

- `EpubTools : <span...>{numPage}</span> => <span {epub:type} />`

  >  Transforme les ...
  > ```xhtml
  > <span class="epubTools-numPage">{numéro}</span>
  > ```
  > ... en
  > ```xhtml
  >  <span id="page{numéro}" title="{numéro}" epub:type="pagebreak" role="doc-pagebreak"></span>
  >  ```
    >  _**Astuce :** Utiliser le script InDesign [epubTools-numPage](https://github.com/civodulab/epubTools-numPage) avant l'export en EPUB._

***

## EpubTools Configuration (`ctrl+,`) <a id="epubtools-configuration"></a>

- `epub.activerA11ylint` ([A11yLint](#a11ylint))
  > Active _a11ylint_ (défaut **true**)

- `epub.ancreTDM`
  - `ajouterAncre` : boolean  (défaut : **true**)
  - `nomAncre` : préfixe du nom de l'ancre (défaut : **toc-epubtools**)

- `epub.classeTDM`
  > Classe appliquée à la balise `<ol>` de la table des matières (défaut : **ol-toc**)

- `epub.coverImage`
  > Nom du fichier pour la couverture de l'ouvrage (Permet d'ajouter  _properties="**cover-image**"_ à l'image dans le `<manifest>` - défaut : **cover**)

- `epub.emphaseStyleAChercher` ([A11yLint](#a11ylint))
  > Classes CSS contenant la chaîne de caractères dans son nom. Permet de trouver les classes à changer.
  > - `italique` (défaut **["italique","italic"]**)
  > - `gras` (défaut **["bold", "gras", "strong"]**)
  > - `emphase` (défaut **["emphase", "emphasis"]**)
  >
  > Exemple : `<span class="italique-sympa">` déclenchera une alerte dans a11yLint.

- `epub.emphaseStyleAEviter` ([A11yLint](#a11ylint))
  > Chaînes de caractères non pris en compte par `epub.emphaseStyleAChercher` (default **["no-bold", "no-italique","no-emphase"]**)
  >
  > Exemple : `<span class="no-italique-sympa">` ne déclenchera pas d'alerte dans a11yLint.


- `epub.navTDM`
  > Nom du fichier pour la table des matières (Permet d'ajouter  _properties="**nav**"_ à l'`<item>` référençant la TDM dans le `<manifest>` - défaut : **toc**)

- `epub.niveauTitre`
  > Niveau de titre dans la table des matières (défaut : **3**)

- `epub.titreTDM`
  - `titre` : titre de la table des matières (défaut : **Table des matières**)
  - `balise` : balise pour le titre (défaut : **h1**)
  - `classe` : classe pour le titre (défaut : **titre1**)

- `epub.styleNumPage`
  > Style recherché pour `EpubTools : <span...>{numPage}</span> => <span {epub:type} />`

***

## A11yLint

Référence : [Accessible Publishing Knowledge Base](http://kb.daisy.org/publishing/)

- Vérification des images `<img>` :
  - `alt` vide
  - pas de `alt`
- Vérification des `<span>` avec classe italique, gras, etc. => transformer en `<em>` ?
- Vérification des `noteref` dans des `<sup>` => retirer `<sup>`
- Vérification des `aria-label` et `controls` dans les balises `<audio>` et `<video>`

***

## Release Notes

### 2.1.0 <!-- omit in toc -->

- Ajout configuration `epub.styleNumPage`
- Conservation du titre dans les nav

Toutes les [release notes](CHANGELOG.md).
