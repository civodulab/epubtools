# Release Notes

## 1.9.0

- correction bug si le dossier ne s'appelait pas OEBPS
- ajout config `epub.navTDM`

## 1.8.4

- correction [issues#14](https://github.com/civodulab/epubtools/issues/14)


## 1.8.3

- ajout configuration `a11ylint`
- `a11ylint`: audio et vidéo
  
## 1.8.2

- fix bug `A11yLint` Vérification noteref

## 1.8.1

- `A11yLint` Vérification noteref

## 1.8.0

- Renomme les fichiers contenant des caractères accentués ou des espaces dans le manifest
- ajout `EpubTools : Récriture Spine`

## 1.7.9

- correction `a11ylint` (information sur emphase, strong, etc.)
- modification `EpubTools : A11Y` -> `DPub-Aria roles|epub:type`

## 1.7.8

- correction bug

## 1.7.7

- correction bug `a11ylint`

## 1.7.6

- `a11ylint` : ajout span italique, gras, etc. => emphase
- ajout `EpubTools : Problèmes ?` tableaux sans th, scope ou headers

## 1.7.5

- optimisation `a11ylint`

## 1.7.4

- fix `a11ylint` (ne scanne que les fichiers xhtml du dossier de l'epub)

## 1.7.3

- ajout `media-overlay` (manifest)
- option activer `a11ylint`

## 1.7.2

- fix mediatype smil (manifest)

## 1.7.1

- fix bug a11ylint

## 1.7.0

- ajout a11ylint -> image

## 1.6.0

- Ajout a11y

## 1.5.7

- ajout du nom du fichier ncx dans l'attribut toc du spine
- ajout properties="cover-image" (fichier opf)
- ajout recherche erreur dans spine

## 1.5.6

- correction bug `EpubTools : premier <h.> => <title>`

## 1.5.5

- correction bug TDM (ncx)
- ajout mediaType (vtt, srt)

## 1.5.4

- ajout de `EpubTools : <span...>{numPage}</span> => <span {epub:type} />`

## 1.5.3

- correction bug ancre titres

## 1.5.2

- corrections bug :
  - ancres titres (merci [garconvacher](https://github.com/garconvacher))
  - balises dans ncx, title (merci [garconvacher](https://github.com/garconvacher))

## 1.5.1

- correcion bug lors de l'ajout des ancres de titre.

## 1.5.0

- Affiche les problèmes (cf. `EpubTools : Problèmes ?`)
- Vérification de la hiérarchisation des titres.

## 1.4.13

- fix TOC

## 1.4.7

- correction bug Table des matières (merci [garconvacher](https://github.com/garconvacher)).

## 1.4.6

- modification des paramètres de configuration TDM
  - ajout de `balise`
  - ajout de `classe`

## 1.4.5

- Correction bug "cannot find command"
- Indique les fichiers ne contenant pas de titre lors de `EpubTools : Table des matières`
- Fix "page-liste" (message lorsqu'il n'y a pas de "pagebreak" dans l'EPUB)

## 1.4.0

- Ajout de "page-liste"

## 1.3.2

- fix bug "properties" vide
- fix "media-type" JPG, jpeg

## 1.3.1

- changement de logo

## 1.3.0

- correction bug dans le manifest (merci [garconvacher](https://github.com/garconvacher))
- ajout d'ancres sur les titres (cf. options) (re-merci [garconvacher](https://github.com/garconvacher))

## 1.2.2

- correction bug

## 1.2.1

- OPF xhtml item properties
  - "scripted"
  - "mathml"
  - "nav"

## 1.2.0

- ajout `EpubTools : premier <h.> => <title>`

## 1.1.1

- correction bug quand on déplace les fichiers toc

## 1.1.0

- être dans un fichier TDM pour appliquer `Table des matières`

## 1.0.1

- corrections bug
- image

## 1.0.0

- Manifest
- Table des matières