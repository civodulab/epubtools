# EpubTools README

Outils destinés à améliorer le travail sur les EPUB.

## À savoir
Le fichier EPUB doit être décompressé. Ensuite vous pouvez travailler dans les répertoires de celui-ci.

## EpubTools contenu (`ctrl+shift+P`)

- `EpubTools : Manifest`
    > remplace le manifest dans l'OPF
- `EpubTools : Table des matières`
    > modifie les fichiers contenant une table des matières `(toc).xhtml` ou/et `(toc).ncx` en utilisant le spine de l'OPF.

## EpubTools Configuration (`ctrl+,`)
- `epub.niveauTitre`
    > niveau de titre dans la table des matières (défaut : **3**)
- `epub.titreTDM`
    > titre de la table des matières (défaut : **Table des matières**)
- `epub.classeTDM`
    > classe appliquée à la balise `<ol>` (défaut : **ol-toc**)


## Release Notes

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


