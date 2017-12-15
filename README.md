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

## EpubTools Configuration (`ctrl+,`)
- `epub.niveauTitre`
    > Niveau de titre dans la table des matières (défaut : **3**)
- `epub.titreTDM`
    > Titre de la table des matières (défaut : **Table des matières**)
- `epub.classeTDM`
    > Classe appliquée à la balise `<ol>` (défaut : **ol-toc**)


## Release Notes

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


