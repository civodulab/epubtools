# EpubTools README

Outils destinés à améliorer le travail sur les EPUB.

## À savoir
Le fichier EPUB doit être décompressé. Ensuite vous pouvez travailler dans les répertoires de celui-ci.

## EpubTools contenu (`ctrl+shift+P`)

- `EpubTools : Manifest`
    > Remplace le manifest dans l'OPF
- `EpubTools : Table des matières`
    > Modifie les fichiers contenant une table des matières `(toc).xhtml` ou/et `(toc).ncx` en utilisant le spine de l'OPF.
- `EpubTools : premier <h.> => <title>`
    > Copie le premier titre (s'il y en a) de chaque page xhtml dans la balise title de celle-ci
- `EpubTools : Création Page Liste`
    >  Récupère les balises avec l'attribut `epub:type="pagebreak"`. Crée ou modifie `<nav epub:type="page-list">` dans le fichier de la table des matière `(toc).xhtml`.

## EpubTools Configuration (`ctrl+,`)
- `epub.niveauTitre`
    > Niveau de titre dans la table des matières (défaut : **3**)
- `epub.titreTDM`
    > Titre de la table des matières (défaut : **Table des matières**)
- `epub.classeTDM`
    > Classe appliquée à la balise `<ol>` (défaut : **ol-toc**)
- `epub.ancreTDM`
    >- `ajouterAncre` : boolean  (défaut : **true**)
    >- `nomAncre` : nom de l'ancre (défaut : **toc-epubtools**)


## Release Notes

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


