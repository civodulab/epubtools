// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
'use strict';
const vscode = require('vscode');

const config = vscode.workspace.getConfiguration('epub');
const Window = vscode.window;
const fs = require('fs');
const path = require('path');

var util = require('./src/util');

//Sortie
let outputChannel = vscode.window.createOutputChannel('EPUB Tools');


String.prototype.remplaceEntre2Balises = function (balise, par, epubType) {
    epubType = epubType && ('.+?epub:type="' + epubType + '"') || '';
    var exp = '<' + balise + epubType + '[^>]*>((?:.|\n|\r)*?)<\/' + balise + '>',
        re = new RegExp(exp, 'gi'),
        result = re.exec(this);
    return this.replace(result[1], par);
}

String.prototype.getAttr = function (attr) {
    var exp = attr + '="([^"]*)"',
        re = new RegExp(exp, 'gi'),
        result = re.exec(this);
    return result[1];
}

const dom = require('./mes_modules/dom-js');
const isNumeric = require('./mes_modules/str-isnum');


String.prototype.metaProperties = function () {
    var prop = [];
    (this.indexOf('</nav>') !== -1) && prop.push('nav');
    (this.indexOf('</math>') !== -1) && prop.push('mathml');
    (this.indexOf('</script>') !== -1) && prop.push('scripted');
    return prop;
}


function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "EpubTools" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.epubManifest', function () {
        let e = Window.activeTextEditor;
        if (!e) {
            Window.showInformationMessage('Vous devez être dans un fichier opf.');
            return; // No open text editor
        }
        let d = e.document;
        if (path.extname(d.fileName) !== '.opf') {
            Window.showInformationMessage('Vous devez être dans un fichier opf');
            return;
        }
        var Liens = util.fichierLiens();
        epubManifest(Liens, d.fileName);

    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('extension.epubTOC', function () {
        let e = Window.activeTextEditor;
        if (!e) {
            Window.showInformationMessage('Vous devez être dans un fichier quelconque du dossier');
            return; // No open text editor
        }
        let d = e.document;
        var tdm = isTDM(d.fileName);
        if (!tdm) {
            Window.showInformationMessage('Vous devez être dans un fichier toc');
            return; // No open text editor
        }
        outputChannel.clear();
        var Liens = util.fichierLiens('.xhtml');
        testLiensPages(Liens);
        if (config.get("ancreTDM").ajouterAncre) {
            ajoutAncre(Liens);
        }


        epubTOC(Liens, d.fileName);
        outputChannel.show(true);


    });

    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.epubTitle', function () {
        var Liens = util.recupFichiers('.xhtml');
        epubTitle(Liens);
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.epubError', function () {
        let e = Window.activeTextEditor;
        if (!e) {
            Window.showInformationMessage('Vous devez être dans un fichier quelconque du dossier');
            return; // No open text editor
        }
        var Liens = util.recupFichiers('.xhtml');
        testLiensPages(Liens);
        outputChannel.show(true);
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.epubPageList', function () {
        let e = Window.activeTextEditor;
        if (!e) {
            Window.showInformationMessage('Vous devez être dans un fichier quelconque du dossier');
            return; // No open text editor
        }
        let d = e.document;
        var tdm = isTDM(d.fileName);
        if (!tdm) {
            Window.showInformationMessage('Vous devez être dans un fichier toc');
            return; // No open text editor
        }
        var Liens = util.recupFichiers('.xhtml');
        var pBreak = epubPageBreak(Liens, d.fileName);
        if (pBreak.length !== 0) {
            var txt = fs.readFileSync(d.fileName, 'utf8');

            if (txt.indexOf('epub:type="page-list"') !== -1) {

                remplaceDansFichier(d.fileName, pBreak, 'nav', 'page-list');
            } else {
                pBreak = '<nav epub:type="page-list">\n' + pBreak + '\n</nav>';
                insertEditorSelection(pBreak);
            }
        } else {
            Window.showInformationMessage("Vous n'avez aucun \"epub:type=pagebreak\" dans votre EPUB.");
            remplaceDansFichier(d.fileName, "", 'nav', 'page-list');


        }

    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;


function testLiensPages(liens) {
    var sansTitre = [],
        pbHierarchie = [];
    var text = "";
    Object.keys(liens).forEach(function (el) {
        var fd = vscode.Uri.file(liens[el]);
        var data = fs.readFileSync(liens[el], 'utf8'),
            rtitre = rechercheTitre(data);
        if (!rtitre) {
            sansTitre.push(fd);
        } else {
            if (!hierarchieTitre(data)) {
                pbHierarchie.push(fd);
            }
        }
    });
    if (sansTitre.length !== 0) {
        text = '- Fichiers sans Titres\n';
        sansTitre.forEach(function (el, i) {
            text += '\t' + (i + 1) + ' -\t' + el.toString() + '\n';

        });

    }
    if (pbHierarchie.length !== 0) {
        text += '- Problème de hiérarchie dans les titres sur les fichiers suivants :\n';
        pbHierarchie.forEach(function (el, i) {
            text += '\t' + (i + 1) + ' -\t' + el.toString() + '\n';
        });
    }
    outputChannel.appendLine(text);
}

function insertEditorSelection(text) {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;
    editor.edit((editBuilder) => {
        selections.forEach((selection) => {
            editBuilder.insert(selection.active, text);
        });
    });
}



function recherchePageBreak(texte) {
    var monDom = new dom(texte),
        mesTitres = [];
    var tt = monDom.getElementByAttr('epub:type', 'pagebreak');
    mesTitres = tt && mesTitres.concat(tt) || mesTitres;
    return mesTitres;
}


function epubPageBreak(fichiers, fichierTOC) {
    var pageBreaks = [];
    fichiers.forEach(function (el) {
        var relativeP = path.relative(path.dirname(fichierTOC), path.dirname(el));
        if (relativeP !== '') {
            relativeP = relativeP + '/' + path.basename(el);
        } else {
            relativeP = path.basename(el);
        }
        var txt = fs.readFileSync(el, 'utf8');
        var pb = recherchePageBreak(txt);
        if (pb.length !== 0) {
            pb.forEach(function (sp) {

                pageBreaks.push({
                    page: relativeP,
                    value: sp.getAttr('title'),
                    id: sp.getAttr('id')
                });
            });

        }
    });
    pageBreaks.sort(function (a, b) {
        return a.value - b.value;
    });
    if (pageBreaks.length !== 0) {
        var pageList = '<ol>\n';
        pageBreaks.forEach(function (el) {
            pageList += '<li><a href="' + el.page + '#' + el.id + '">' + el.value + '</a></li>\n';

        });
        pageList += '</ol>\n';
        return pageList;
    }
    return pageBreaks;
}


function epubTitle(fichiers) {
    fichiers.forEach(function (el) {
        var txt = fs.readFileSync(el, 'utf8');
        var titres = rechercheTitre(txt);
        if (titres) {
            var h = new RegExp('<h[0-9][^>]*>((?:.|\n|\r)*?)<\/h([0-9])>', 'ig');
            var result = h.exec(titres[0]);
            var par = result[1];
            remplaceDansFichier(el, par, 'title');
        }
    });
}



function epubTOC(liens, fichierTOC) {
    try {
        var mesLiens = recupSpine(),
            mesTitres = [];

        mesLiens.forEach(function (el) {
            el = path.basename(el);
            var el1 = liens[el],
                data = fs.readFileSync(el1, 'utf8'),
                rtitre = rechercheTitre(data);
            if (rtitre) {
                var monLien = [];
                monLien.push(el1);
                monLien.push(rtitre);
                mesTitres.push(monLien);
            }
        });
        tableMatieres(mesTitres, fichierTOC);
    } catch (error) {

        Window.showErrorMessage('Vous avez une erreur avec votre spine dans le fichier "opf".');
    }
}

function ajoutAncre(liens) {
    var k = 0;
    var nomId = config.get("ancreTDM").nomAncre;
    for (var fichier in liens) {
        var data = fs.readFileSync(liens[fichier], 'utf8');
        var mesTitres = rechercheTitre(data);
        if (mesTitres) {
            var newdata = data;
            mesTitres.forEach(function (titre) {
                var h = new RegExp('<h[0-9]([^>]*)>', 'ig');
                var result = h.exec(titre);
                if (result[1].indexOf('id') === -1) {
                    var newtitre = titre.replace(result[1], result[1] + ' id="' + nomId + '-' + k + '"');
                } else {
                    var idexp = new RegExp('id="([^"]*)"', "ig");
                    var res = idexp.exec(titre);
                    newtitre = titre.replace(res[1], nomId + '-' + k);

                }
                newdata = newdata.replace(titre, newtitre);
                k++;
            });
            fs.writeFileSync(liens[fichier], newdata, 'utf8');
        }
    }

}


function isTDM(fichier) {
    var txt = fs.readFileSync(fichier, 'utf8');
    if (txt.indexOf('</nav>') !== -1 || txt.indexOf('</navMap') !== -1) {
        return true;
    }
    return false;
}

function recupSpine() {
    var monOPF = util.recupFichiers('.opf')[0];
    var data = fs.readFileSync(monOPF, 'utf8');
    var monDom = new dom(data);
    var monSpine = monDom.getElementByTagName('spine')
    var idref = rechercheIdref(monSpine[0]);
    return rechercheHrefParIdRef(data, idref);

}

function tableMatieres(titres, fichierTOC) {
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
            maTableXhtml += '<a href="' + relativeP + id + '">';
            maTableXhtml += result[1] + '</a>';

            maTableNCX += '<navLabel>\n<text>';
            maTableNCX += result[1];
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
        remplaceDansFichier(fichierTOC, maTableNCX, 'navMap');
    } else {
        remplaceDansFichier(fichierTOC, maTableXhtml, 'nav', 'toc');
    }

}

function rechercheHrefParIdRef(texte, idref) {
    var mesLiens = [];
    idref.forEach(function (el) {
        var id = el.replace('ref=', '='),
            exp = id + '.+?href="([^"]*)"',
            re = new RegExp(exp, 'gi'),
            val = re.exec(texte);
        mesLiens.push(val[1]);

    });
    return mesLiens;
}

function rechercheIdref(texte) {
    var re = new RegExp('idref="[^"]*"', 'gi');
    return texte.match(re);
}

function rechercheTitre(texte, nivT) {
    nivT = nivT || config.get('niveauTitre');
    var exp = '<h[1-' + nivT + '][^>]*>(?:.|\n|\r)*?<\/h[1-' + nivT + ']>?',
        re = new RegExp(exp, 'gi'),
        result = texte.match(re);
    return result;
}

function hierarchieTitre(texte) {
    var mesTitres = rechercheTitre(texte, 9);
    var titreAvant;
    for (let i = 0; i < mesTitres.length; i++) {
        const el = mesTitres[i];
        var h = new RegExp('<h([0-9])', 'ig');
        var result = h.exec(el);
        if (i === 0) {
            titreAvant = result[1];
        } else {
            if (result[1] >= titreAvant && result[1] - titreAvant > 1) {
                return false;
            }
            titreAvant = result[1];
        }
    }
    return true;

}

function remplaceDansFichier(fichier, texte, balise, epubType) {
    fs.readFile(fichier, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var rpl = data.remplaceEntre2Balises(balise, texte, epubType);
        fs.writeFile(fichier, rpl, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}


function ecritureLigne(fichier, fichierOPF) {
    var relativeP = path.relative(path.dirname(fichierOPF), path.dirname(fichier)),
        relativeFichier;
    if (relativeP !== '') {
        relativeFichier = relativeP + '/' + path.basename(fichier);
    } else {
        relativeFichier = path.basename(fichier);
    }

    var maligne = "",
        mediaType = "",
        properties = "",
        ext = path.extname(relativeFichier),
        nom = path.basename(relativeFichier);
    nom = isNumeric(nom.substring(0, 1)) && ("x" + nom) || nom;
    ext = ext.toLowerCase();
    switch (ext) {
        case '.xhtml':
            mediaType = "application/xhtml+xml";
            nom = path.basename(nom, '.xhtml');
            var data = fs.readFileSync(fichier, 'utf8');
            var proper = data.metaProperties();
            if (proper.length !== 0) {
                properties = ' properties="' + proper.join(' ') + '"';
            }
            break;
        case '.pls':
            mediaType = "application/pls+xml";
            break;
        case '.js':
            mediaType = "application/javascript";
            break;
        case ".ncx":
            mediaType = "application/x-dtbncx+xml"
            break;
            //  Text Types
        case ".css":
            mediaType = "text/css"
            break;

            //  Font Types
        case ".ttf":
        case ".otf":
            // mediaType = "application/font-sfnt"; //version 3.1
            mediaType = "application/vnd.ms-opentype";
            break;
        case ".woff":
            mediaType = "application/font-woff"
            break;

            //  Images type
        case ".gif":
            mediaType = "image/gif"
            break;
        case ".jpeg":
        case ".jpg":
            mediaType = "image/jpeg"
            break;
        case ".png":
            mediaType = "image/png"
            break;
        case ".svg":
            mediaType = "image/svg+xml"
            break;
            // Audio types
        case ".mpg":
        case ".mp3":
            mediaType = "audio/mpeg"
            break;
        case ".mp4":
        case ".aac":
            mediaType = "audio/mp4"
        default:
            break;
    }

    maligne = '<item id="' + nom + '" href="' + relativeFichier + '" media-type="' + mediaType + '"' + properties + ' />\n';
    return maligne;
}


function epubManifest(mesFichiers, fichierOPF) {
    var montexte = "";
    var opf = path.basename(fichierOPF);
    for (var fich in mesFichiers) {
        if (fich !== opf) {
            montexte += ecritureLigne(mesFichiers[fich], fichierOPF);
        }
    }
    remplaceDansFichier(fichierOPF, montexte, 'manifest');
}