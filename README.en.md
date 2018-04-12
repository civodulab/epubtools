# EpubTools README

[![Licence](https://img.shields.io/github/license/civodulab/epubtools.svg)](https://github.com/civodulab/epubtools)
[![VS Code Marketplace](https://vsmarketplacebadge.apphb.com/version-short/civodulab.epubtools.svg) ![Rating](https://vsmarketplacebadge.apphb.com/rating-short/civodulab.epubtools.svg) ![Installs](https://vsmarketplacebadge.apphb.com/installs/civodulab.epubtools.svg)](https://marketplace.visualstudio.com/items?itemName=civodulab.epubtools)

Tools to facilitate work on EPUBs.

## Important

The EPUB file must be uncompressed. Then you can work in his directories.

----------

## EpubTools contents (`ctrl+shift+P`)

- `EpubTools: A11Y`
  > Open a list of tools to improve accessibility (a11y):
  > - `DPub-Aria roles` : Add _role="doc-`X`"_ in markup if _epub:type="`X`"_ is in it  (I was helped by the scripts from [JayPanoz](https://gist.github.com/JayPanoz/45896f17a69892de9a121d701c578d1e) et de [rodebert](https://gist.github.com/rodebert/81837a2676cf2c04819a582c3eb49c13))  
  Reference: [Digital Publishing WAI-ARIA Module 1.0](https://www.w3.org/TR/dpub-aria-1.0/)
  
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
  >- Issues with `<spine>` if `idref` in `<itemref>` are missing in the `<manifest>`
- `EpubTools : <span...>{numPage}</span> => <span {epub:type} />`

  >  Converts...
  > ```xhtml
  > <span class="epubTools-numPage-style">{number}</span>
  > ```
  > ... to
  > ```xhtml
  >  <span id="page{number}" title="{number}" epub:type="pagebreak" role="doc-pagebreak"></span>
  >  ```

  _**Tip:** Use InDesign script [epubTools-numPage](https://github.com/civodulab/epubTools-numPage) if your EPUB is based on InDesign files._
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
- `epub.coverImage`
  > Name of the file of the cover image (add _properties="**cover-image**"_ to this image in `<manifest>` - default **cover**)

- `epub.activerA11ylint`
  > Activate _a11ylint_ (default **true**)

* * *

## EpubToolsLint

- Display issues with `<img>`:
  - if `alt` is empty
  - if `alt` is missing