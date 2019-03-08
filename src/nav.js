'use strict';
const vscode = require('vscode');
const dom = require('../mes_modules/dom-js');
const config = vscode.workspace.getConfiguration('epub');
const Window = vscode.window;
const fs = require('fs');
const path = require('path');
const problemes = require('./problemes');
const util = require('./util');
let outputChannel = vscode.window.createOutputChannel('EPUB Tools');

function tdm(d){
    var Liens = util.fichierLiens('.xhtml');
    // console.log(problemes.problemesTitres(Liens));
    outputChannel.appendLine(problemes.problemesTitres(Liens));
    if (config.get("ancreTDM").ajouterAncre) {
        _ajoutAncre(Liens);
    }
    _epubTOC(Liens, d);
}

function _ajoutAncre(liens) {
    var k = 0;
    var nomId = config.get("ancreTDM").nomAncre;
    var allID = _recupAllID(liens);
    Object.values(liens).forEach(function (fichier) {
        var data = fs.readFileSync(fichier, 'utf8');
        var mesTitres = util.rechercheTitre(data);
        if (mesTitres) {
            mesTitres.forEach(function (titre) {
                ++k;
                var newID = 'id="' + nomId + '-' + k + '"';
                while (allID.indexOf(newID) !== -1) {
                    ++k;
                    newID = 'id="' + nomId + '-' + k + '"';
                }
                var h = new RegExp('<h([0-9])([^>]*)>', 'ig');
                var result = h.exec(titre);
                if (result[2].indexOf('id') === -1) {
                    if (result[2] === "") {
                        var newtitre = titre.replace(result[1], result[1] + ' ' + newID);
                    } else {
                        newtitre = titre.replace(result[2], result[2] + ' ' + newID);
                    }

                } else {
                    newtitre = titre;
                }
                data = data.replace(titre, newtitre);
            });
            fs.writeFileSync(fichier, data, 'utf8');
        }
    });

}

function _recupAllID(liens) {
    var allID = [];
    Object.values(liens).forEach(function (el) {
        var data = fs.readFileSync(el, 'utf8');
        var mesId = data.match(/id="[^"]*"/gi);
        allID = mesId && allID.concat(mesId) || allID
    });
    return allID;
}

function _epubTOC(liens, fichierTOC) {
    try {
        var mesLiens = _recupSpine(),
            mesTitres = [];

        mesLiens.forEach(function (el) {
            el = path.basename(el);
            var el1 = liens[el],
                data = fs.readFileSync(el1, 'utf8'),
                rtitre = util.rechercheTitre(data);
            if (rtitre) {
                var monLien = [];
                monLien.push(el1);
                monLien.push(rtitre);
                mesTitres.push(monLien);
            }
        });
        _tableMatieres(mesTitres, fichierTOC);
    } catch (error) {
        mesErreurs.erreurMessageSpine();
    }
}

function _recupSpine() {
    var monOPF = util.recupFichiers('.opf')[0];
    var data = fs.readFileSync(monOPF, 'utf8');
    var monDom = new dom(data);
    var monSpine = monDom.getElementByTagName('spine');
    var idref = _rechercheIdref(monSpine[0]);
    return _rechercheHrefParIdRef(data, idref);

}
function _rechercheIdref(texte) {
    return texte.match(/idref=(\'|").*?(\'|")/gi);
}
function _rechercheHrefParIdRef(texte, idref) {
    var mesLiens = [];
    idref.forEach(function (el) {
        var id = el.replace('ref=', '='),
            exp = id + '.+?href=(\'|")(.*?)(\'|")',
            re = new RegExp(exp, 'gi'),
            val = re.exec(texte);
        mesLiens.push(val[2]);

    });
    return mesLiens;
}

function _tableMatieres(titres, fichierTOC) {
    var titreTDM = config.get('titreTDM');
    var maTableXhtml = '<' + titreTDM.balise + ' class="' + titreTDM.classe + '">' + titreTDM.titre + '</' + titreTDM.balise + '>\n',
        titreAvant = 0,
        classeOL = config.get('classeTDM');
    var maTableNCX = '';
    var i = 0;
    var ltitres = titres.length,
        k = 0;
    for (; k !== ltitres; k++) {
        var el = titres[k];
        var relativeP = path.relative(path.dirname(fichierTOC), path.dirname(el[0]));
        if (relativeP !== '') {
            relativeP = relativeP + '/' + path.basename(el[0]);
        } else {
            relativeP = path.basename(el[0]);
        }

        el[1].forEach(function (titre) {
            var h = new RegExp('<h[0-9][^>]*>((?:.|\n|\r)*?)<\/h([0-9])>', 'ig'),
                id = '';
            if (titre.indexOf('id=') !== -1) {
                var idexp = new RegExp('id="([^"]*)"', 'gi');
                id = '#' + idexp.exec(titre)[1];
            }
            var result = h.exec(titre);
            if (result[2] === titreAvant) {
                maTableXhtml += '</li>\n<li>\n';

                maTableNCX += '</navPoint>\n<navPoint id="navPoint' + i + '" playOrder="' + i + '">\n';
            } else if (result[2] < titreAvant) {
                maTableXhtml += '</li>\n</ol>\n'.repeat(titreAvant - result[2]);
                maTableXhtml += '</li>\n<li>\n';

                maTableNCX += '</navPoint>\n'.repeat(titreAvant - result[2]);
                maTableNCX += '</navPoint>\n<navPoint id="navPoint' + i + '" playOrder="' + i + '">\n';
            } else if (result[2] > titreAvant) {
                if (titreAvant === 0) {
                    maTableXhtml += '<ol class="' + classeOL + '">\n<li>\n';
                    maTableXhtml += '<ol>\n<li>\n'.repeat(result[2] - titreAvant - 1);
                } else {
                    maTableXhtml += '<ol>\n<li>\n'.repeat(result[2] - titreAvant);
                }
                maTableNCX += ('<navPoint id="navPoint' + i + '" playOrder="' + i + '">\n').repeat(result[2] - titreAvant);
            }

            if (path.basename(relativeP) === path.basename(fichierTOC)) {
                id = "";
            }
            var monTexte = _epureBalise(result[1]);
            maTableXhtml += '<a href="' + relativeP + id + '">';
            maTableXhtml += monTexte.toc + '</a>';

            maTableNCX += '<navLabel>\n<text>';
            maTableNCX += monTexte.txt;
            maTableNCX += '</text>\n</navLabel>\n';

            maTableNCX += '<content src="' + relativeP + id + '" />';

            titreAvant = result[2];
            i++;

        });
        if (k === ltitres - 1) {
            maTableXhtml += '</li>\n</ol>\n'.repeat(titreAvant);
            maTableNCX += '</navPoint>\n'.repeat(titreAvant);
        }
    }

    if (path.basename(fichierTOC) === 'toc.ncx') {
        util.remplaceDansFichier(fichierTOC, maTableNCX, 'navMap');
    } else {
        util.remplaceDansFichier(fichierTOC, maTableXhtml, 'nav', 'toc');
    }

}

function _epureBalise(texte) {
    // Supprime notes
    var note = new RegExp('<span[^>]+id=(?:"|\')footnote-[0-9]*-backlink(?:"|\')[^>]*>((.|\s|\n|\r)*?)<\/span>', 'gi');
    texte = texte.replace(note, '');

    var txtTOC = texte,
        txt = texte,
        baliseAsupp = ['a', 'span', 'sup'];

    baliseAsupp.forEach(bal => {
        var h = new RegExp('<' + bal + '[^>]+>((?:.|\n|\r)*?)<\/' + bal + '>', 'gi');
        var re;
        while ((re = h.exec(texte)) !== null) {
            txtTOC = (re[1] === "" || !re[1]) && txtTOC.replace(re[0], '') || txtTOC;
            txt = (re[1] === "" || !re[1]) && txt.replace(re[0], '') || txt.replace(re[0], re[1]);
        }
        txtTOC = txtTOC.replace(/[\n\r]/g, '');
        txt = txt.replace(/[\n\r]/g, '');
        txtTOC = txtTOC.replace(/\s{2,}/g, ' ');
        txt = txt.replace(/\s{2,}/g, ' ');
        txtTOC = txtTOC.trim();
        txt = txt.trim();
    });

    return {
        'toc': txtTOC,
        'txt': txt,
    };
}


module.exports = {
    tdm,
}