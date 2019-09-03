'use strict';
const vscode = require('vscode');
const dom = require('../mes_modules/dom-js');
const config = vscode.workspace.getConfiguration('epub');
const Window = vscode.window;
const fs = require('fs');
const path = require('path');
const problemes = require('./problemes');
const util = require('./util');
const mesMessages = require('./mesMessages');
let mesErreurs = mesMessages.mesErreurs;
let outputChannel = vscode.window.createOutputChannel('EPUB Tools');

const functionCommune = {
    _recupTitreNav: function (texte) {
        return texte.match(/<h.*?<\/h[0-6]>/);
    },
    _writeList: function (mesFonctions, fichiers, fichierTOC) {
        var mesTables = [];
        Object.values(fichiers).forEach(function (el) {
            var relativeP = path.relative(path.dirname(fichierTOC), path.dirname(el));
            if (relativeP !== '') {
                relativeP = relativeP + '/' + path.basename(el);
            } else {
                relativeP = path.basename(el);
            }
            var txt = fs.readFileSync(el, 'utf8');
            var pb = mesFonctions._getElement(txt);

            if (pb.length !== 0) {
                pb.forEach(function (sp) {
                    mesTables.push({
                        page: relativeP,
                        value: mesFonctions._getCaption(sp),
                        id: sp.getAttr('id')
                    });
                });

            }
        });
        mesTables.sort(function (a, b) {
            return a.value - b.value;
        });
        if (mesTables.length !== 0) {
            let pageList = '<ol>\n';
            mesTables.forEach(function (el) {
                pageList += '<li><a href="' + el.page + '#' + el.id + '">' + (el.value && el.value || el.id) + '</a></li>\n';
            });
            pageList += '</ol>\n';
            return pageList;
        }
        return mesTables;
    },
    _ajoutAncre: function (liens, qui) {
        var k = 0;
        var nomId = config.get("ancreTDM").nomAncre;
        var allID = functionCommune._recupAllID(liens);
        Object.values(liens).forEach(function (fichier) {
            var data = fs.readFileSync(fichier, 'utf8');

            switch (qui) {
                case 'titre':
                    var mesTitres = util.rechercheTitre(data);
                    var regtxt = '<h([0-9])([^>]*)?>';
                    break;
                case 'figure':
                    mesTitres = functionIllustrationList._getElement(data);
                    regtxt = '<(figure)([^>]*)?>'
                    break;
                case 'table':
                    mesTitres = functionTableList._getElement(data);
                    regtxt = '<(table)([^>]*)?>'
                    break;
                case 'audio':
                    mesTitres = functionAudioList._getElement(data);
                    regtxt = '<(audio)([^>]*)?>'
                    break;
                case 'video':
                    mesTitres = functionVideoList._getElement(data);
                    regtxt = '<(video)([^>]*)?>'
                    break;
                default:
                    break;
            }


            if (mesTitres) {
                mesTitres.forEach(function (titre) {
                    ++k;
                    var newID = 'id="' + nomId + '-' + k + '"';
                    while (allID.indexOf(newID) !== -1) {
                        ++k;
                        newID = 'id="' + nomId + '-' + k + '"';
                    }

                    var mareg = new RegExp(regtxt, 'gi');
                    var result = mareg.exec(titre);
                    if (result[2].indexOf('id=') === -1) {
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

    },
    _recupAllID: function (liens) {
        var allID = [];
        Object.values(liens).forEach(function (el) {
            var data = fs.readFileSync(el, 'utf8');
            var mesId = data.match(/id="[^"]+"/gi);
            allID = mesId && allID.concat(mesId) || allID
        });
        return allID;
    },
}


function navlist(epubType) {
    let d = Window.activeTextEditor.document;
    let Liens = util.recupFichiers('.xhtml');
    let pBreak, role = "",
        titreNav = "",
        monErreur = "";
    switch (epubType) {
        case "page-list":
            pBreak = functionCommune._writeList(functionPageList, Liens, d.fileName);
            role = 'role="doc-pagelist"';
            monErreur = "erreurPageBreak";
            titreNav = "pagelist";
            break;
        case "lot":
            functionCommune._ajoutAncre(Liens, 'table');
            pBreak = functionCommune._writeList(functionTableList, Liens, d.fileName);
            monErreur = "erreurTable";
            titreNav = "tablelist";

            break;
        case "loi":
            functionCommune._ajoutAncre(Liens, 'figure');
            pBreak = functionCommune._writeList(functionIllustrationList, Liens, d.fileName);
            monErreur = "erreurIllustration";
            titreNav = "illustrationlist";
            break;
        case "loa":
            functionCommune._ajoutAncre(Liens, 'audio');
            pBreak = functionCommune._writeList(functionAudioList, Liens, d.fileName);
            monErreur = "erreurAudio";
            titreNav = "audiolist";
            break;
        case "lov":
            functionCommune._ajoutAncre(Liens, 'video');
            pBreak = functionCommune._writeList(functionVideoList, Liens, d.fileName);
            monErreur = "erreurVideo";
            titreNav = "videolist";
            break;
        default:
            break;
    }

    if (pBreak.length !== 0) {
        fs.readFile(d.fileName, 'utf8', (err, txt) => {

            if (txt.indexOf('epub:type="' + epubType + '"') !== -1) {
                let exp = '<nav [^>]*epub:type="' + epubType + '"[^>]*>(\\n|\\s|.)+?</nav>';
                let maRegEx = new RegExp(exp);
                let maRecup = functionCommune._recupTitreNav(txt.match(maRegEx)[0]);
                pBreak = maRecup && ('\n' + maRecup + '\n' + pBreak) || '\n<h2>' + titreNav + '</h2>\n' + pBreak

                util.remplaceDansFichier(d.fileName, pBreak, 'nav', epubType);
            } else {
                pBreak = '<nav epub:type="' + epubType + '"' + role + '>\n<h2>' + titreNav + '</h2>\n' + pBreak + '\n</nav>';
                // find </nav>
                if (txt.indexOf('</nav>') !== -1) {
                    var data = txt.replace(/<\/nav>/, '</nav>\n' + pBreak);
                    fs.writeFileSync(d.fileName, data);
                } else {
                    util.insertEditorSelection(pBreak);
                }
            }
        });

    } else {

        erreurCallBack(mesErreurs[monErreur]);
        util.remplaceDansFichier(d.fileName, "", 'nav', epubType);
    }
}

function erreurCallBack(ft) {
    ft();
}


function tdm() {
    let d = Window.activeTextEditor.document;
    if (!functionTDM._isTDM(d.fileName)) {
        mesErreurs.erreurFichierTOC();
        return;
    }
    var Liens = util.fichierLiens('.xhtml');
    // console.log(problemes.problemesTitres(Liens));
    outputChannel.appendLine(problemes.problemesTitres(Liens));
    if (config.get("ancreTDM").ajouterAncre) {
        functionCommune._ajoutAncre(Liens, 'titre');
    }
    functionTDM._epubTOC(Liens, d.fileName);
}

let functionTDM = {
    _isTDM: function (fichier) {
        if (path.extname(fichier) === '.ncx') return true;
        let opf = util.recupFichiers('.opf');
        let data = fs.readFileSync(opf[0], 'utf8');
        let regexp = /<[^<>]* ?properties=("[^"]*\snav|"nav\s[^"]*|"nav|"[^"]*nav\s[^"]*)"[^>]*?>/;
        let found = data.match(regexp);
        let href = found[0].getAttr('href').split('/').pop();

        if (path.basename(fichier) === href) return true;
        return false;
    },

    _epubTOC: function (liens, fichierTOC) {
        try {
            var mesLiens = functionTDM._recupSpine(),
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
            functionTDM._tableMatieres(mesTitres, fichierTOC);
        } catch (error) {
            mesErreurs.erreurMessageSpine();
        }
    },

    _recupSpine: function () {
        var monOPF = util.recupFichiers('.opf')[0],
            data = fs.readFileSync(monOPF, 'utf8'),
            monDom = new dom(data),
            monSpine = monDom.getElementByTagName('spine'),
            idref = functionTDM._rechercheIdref(monSpine[0]);
        return functionTDM._rechercheHrefParIdRef(data, idref);

    },

    _rechercheIdref: function (texte) {
        return texte.match(/idref=(\'|").*?(\'|")/gi);
    },
    _rechercheHrefParIdRef: function (texte, idref) {
        var mesLiens = [];
        idref.forEach(function (el) {
            var id = el.replace('ref=', '='),
                exp = id + '.+?href=(\'|")(.*?)(\'|")',
                re = new RegExp(exp, 'gi'),
                val = re.exec(texte);
            mesLiens.push(val[2]);

        });
        return mesLiens;
    },

    _tableMatieres: function (titres, fichierTOC) {
        let maRecup="";
        if(path.basename(fichierTOC)!=='toc.ncx'){
            let exp = '<nav [^>]*epub:type="toc"[^>]*>(\\n|\\s|.)+?</nav>';
            let maRegEx = new RegExp(exp);
            let data = fs.readFileSync(fichierTOC, 'utf8');
            let monNav=data.match(maRegEx)[0];
            maRecup = functionCommune._recupTitreNav(monNav);
        }
       
        let titreTDM = config.get('titreTDM'),
            maTableXhtml = maRecup && ('\n' + maRecup + '\n') || ('<' + titreTDM.balise + ' class="' + titreTDM.classe + '">' + titreTDM.titre + '</' + titreTDM.balise + '>\n'),
            titreAvant = 0,
            classeOL = config.get('classeTDM'),
            maTableNCX = '',
            i = 0,
            ltitres = titres.length,
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

                // if (path.basename(relativeP) === path.basename(fichierTOC)) {
                //     id = "";
                // }
                var monTexte = util.epureBalise(result[1]);
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

        if (path.extname(fichierTOC) === '.ncx') {
            util.remplaceDansFichier(fichierTOC, maTableNCX, 'navMap');
        } else {
            util.remplaceDansFichier(fichierTOC, maTableXhtml, 'nav', 'toc');
        }

    }
}

let functionPageList = {
    _getElement: function (texte) {
        var monDom = new dom(texte);
        return monDom.getElementByAttr('epub:type', 'pagebreak') || [];
    },
    _getCaption: function (texte) {
        return texte.getAttr('title');
    }
}

let functionAudioList = {
    _getElement: function (texte) {
        var monDom = new dom(texte);
        return monDom.getElementByTagName('audio') || [];
    },
    _getCaption: function (texte) {
        return texte.getAttr('aria-label');
    }

}


let functionVideoList = {
    _getElement: function (texte) {
        var monDom = new dom(texte);
        return monDom.getElementByTagName('video') || [];
    },
    _getCaption: function (texte) {
        return texte.getAttr('aria-label');
    }

}

let functionTableList = {

    _getElement: function (texte) {
        var monDom = new dom(texte);
        return monDom.getElementByTagName('table') || [];
    },
    _getCaption: function (txtTable) {
        let mareg = /(?<=<caption[^>]*>)((?:.|\s|\r)+?)(?=<\/caption>)/i;
        let found = txtTable.match(mareg);

        return found && util.epureBalise(found[0]).txt || "";

    }
}


let functionIllustrationList = {

    _getElement: function (texte) {
        var monDom = new dom(texte);
        let mesFig = monDom.getElementByTagName('figure');
        return mesFig && mesFig.filter(fig => fig.indexOf('<img') !== -1) || [];
    },
    _getCaption: function (texte) {
        let mareg = /(?<=<figcaption[^>]*>)((?:.|\s|\r)+?)(?=<\/figcaption>)/i;
        let found = texte.match(mareg);

        return found && util.epureBalise(found[0]).txt || "";
    }
}

module.exports = {
    tdm,
    navlist
}