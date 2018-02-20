# EpubTools README

Outils destinés à améliorer le travail sur les EPUB.

## À savoir
Le fichier EPUB doit être décompressé. Ensuite vous pouvez travailler dans les répertoires de celui-ci.

----------

## EpubTools contenu (`ctrl+shift+P`)

- `EpubTools : Manifest`
    > Remplace le manifest dans l'OPF
- `EpubTools : Table des matières`
    > Modifie les fichiers contenant une table des matières `(toc).xhtml` ou/et `(toc).ncx` en utilisant le spine de l'OPF.
- `EpubTools : premier <h.> => <title>`
    > Copie le premier titre (s'il y en a) de chaque page xhtml dans la balise title de celle-ci
- `EpubTools : Création Page Liste`
    >  Récupère les balises avec l'attribut `epub:type="pagebreak"`. Crée ou modifie `<nav epub:type="page-list">` dans le fichier de la table des matière `(toc).xhtml`.
- `EpubTools : Problèmes ?`
    >  Affiche les problèmes dans l'onglet `SORTIE`
    >   - Pages sans titre
    >   - Hiérarchie des titres

----------

## EpubTools Configuration (`ctrl+,`)
- `epub.niveauTitre`
    > Niveau de titre dans la table des matières (défaut : **3**)
- `epub.titreTDM`
    >- `titre` : Titre de la table des matières (défaut : **Table des matières**)
    >- `balise` : Balise pour le titre (défaut : **h1**)
    >- `classe` : classe pour le titre (défaut : **titre1**)
- `epub.classeTDM`
    > Classe appliquée à la balise `<ol>` (défaut : **ol-toc**)
- `epub.ancreTDM`
    >- `ajouterAncre` : boolean  (défaut : **true**)
    >- `nomAncre` : nom de l'ancre (défaut : **toc-epubtools**)

----------


## Release Notes

### 1.5.1
- correcion bug lors de l'ajout des ancres de titre.

### 1.5.0
- Affiche les problèmes (cf. `EpubTools : Problèmes ?`)
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
- Indique les fichiers ne contenant pas de titre lors de `EpubTools : Table des matières`
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
- ajout `EpubTools : premier <h.> => <title>`

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


