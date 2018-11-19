// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
'use strict';
const vscode = require('vscode');
// const nls = require('vscode-nls');
const maLangue = vscode.env.language;

const localTexte = {
    "fr": {
        "erreurPathOEBPS": "Vous devez être dans un dossier OEBPS.",
        "a11y.placeHolder": "Choisissez dans la liste ci-dessous.",
        "a11y.aria.description": "Ajoute role=\"doc-...\" si epub:type",
        "erreurFichierOPF": "Vous devez être dans un fichier opf",
        "outputChannelPbSpine": "Problème de spine :",
        "erreurFichierTOC": "Vous devez être dans un fichier toc",
        "outputChannelTableauTh": "Tableaux sans th",
        "outputChannelTableauScope": "Tableaux sans scope et/ou headers",
        "outputChannelPbSpine2": "Problème de spine [opf]",
        "erreurPageBreak": "Vous n'avez aucun \"epub:type=pagebreak\" dans votre EPUB.",
        "erreurMessageSpine": "Vous avez une erreur avec votre spine dans le fichier \"opf\".",

    },
    "en": {
        "erreurPathOEBPS": "You must be in an OEBPS folder.",
        "a11y.placeHolder": "Choose from the list below.",
        "a11y.aria.description": "Add role=\"doc-...\" if epub:type",
        "erreurFichierOPF": "You must be in an opf file",
        "outputChannelPbSpine": "Spine problem:",
        "erreurFichierTOC": "You must be in a toc file",
        "outputChannelTableauTh": "Tables without th",
        "outputChannelTableauScope": "Tables without scope and/or headers",
        "outputChannelPbSpine2": "Spine problem [opf]",
        "erreurPageBreak": "You don't have any \"epub:type=pagebreak\" in your EPUB.",
        "erreurMessageSpine": "You have an error with your spine in the \"opf\" file."
    }
}

const txtLangue = localTexte[maLangue] && localTexte[maLangue] || localTexte["en"];
const config = vscode.workspace.getConfiguration('epub');
const Window = vscode.window;
const fs = require('fs');
const path = require('path');
const problemes = require('./src/problemes');

const util = require('./src/util');
const manifest = require('./src/manifest');


//Sortie
let outputChannel = vscode.window.createOutputChannel('EPUB Tools');

String.prototype.remplaceEntre2Balises = function (balise, par, epubType) {
    epubType = epubType && ('.+?epub:type="' + epubType + '"') || '';
    var exp = '(<' + balise + epubType + '[^>]*>)((?:.|\n|\r)*?)(<\/' + balise + '>)',
        re = new RegExp(exp, 'gi');
    return this.replace(re, '$1' + par + '$3');
}

String.prototype.getAttr = function (attr) {
    var exp = attr + '="([^"]*)"',
        re = new RegExp(exp, 'gi'),
        result = re.exec(this);
    return result && result[1] || false;
}

String.prototype.setAttr = function (attr, val) {
    if (this.indexOf(attr + '=') !== -1) {
        var exp = attr + '="([^"]*)"',
            re = new RegExp(exp, 'gi'),
            result = re.exec(this);
        return this.replace(result[1], val);
    } else {
        result = this.match(exp);
        return this.replace(/ /i, ' ' + attr + '="' + val + '" ')
    }

}
const dom = require('./mes_modules/dom-js');

String.prototype.metaProperties = function () {
    var prop = [];
    // (this.indexOf('</nav>') !== -1) && prop.push('nav');
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

    vscode.commands.executeCommand('workbench.view.search');

    const a11ylint = require('./src/a11ylint');
    let wkFolderAvant;
    if (config.get('activerA11ylint')) {
        vscode.workspace.onDidOpenTextDocument(doc => {
            let wkFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(doc.fileName));
            if (wkFolder && (wkFolder !== wkFolderAvant)) {
                wkFolderAvant = wkFolder;
                a11ylint.remiseAzero();
                a11ylint.epubToolsDiagnostic(wkFolderAvant);
                a11ylint.epubToolsWatcher(wkFolderAvant);
            }
        });
        vscode.workspace.onDidChangeTextDocument(doc => {
            a11ylint.diagnosticDoc(doc.document);
        });

    }

    let disposable = vscode.commands.registerCommand('extension.epubSpanPageNoir', function () {
        if (!util.testOEBPS()) {
            Window.showInformationMessage(txtLangue["erreurPathOEBPS"]);
            return; // No open text editor
        }

        var Liens = util.fichierLiens('.xhtml');

        util.transformePageNoire(Liens);

    });
    context.subscriptions.push(disposable);



    disposable = vscode.commands.registerCommand('extension.epubA11Y', function () {
        if (!util.testOEBPS()) {
            Window.showInformationMessage(txtLangue["erreurPathOEBPS"]);
            return; // No open text editor
        }
        const a11y = require('./src/a11y');

        var opts = {
            matchOnDescription: true,
            placeHolder: txtLangue["a11y.placeHolder"]
        };
        var items = [];

        items.push({
            label: "DPub-Aria roles|epub:type",
            description: txtLangue["a11y.aria.description"]
        });
        Window.showQuickPick(items, opts).then((selection) => {
            if (!selection) {
                return;
            }
            switch (selection.label) {
                case "DPub-Aria roles|epub:type":
                    let Liens = util.fichierLiens('.xhtml');
                    a11y.roleDoc(Liens);
                    break;
                default:
                    break;
            }
        });


    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('extension.epubManifest', function () {
        if (!util.testOEBPS()) {
            Window.showInformationMessage(txtLangue["erreurPathOEBPS"]);
            return; // No open text editor
        }

        let d = Window.activeTextEditor.document;
        if (path.extname(d.fileName) !== '.opf') {
            Window.showInformationMessage(txtLangue["erreurFichierOPF"]);
            return;
        }
        outputChannel.clear();

        manifest.epubManifest(d.fileName);

        let test = manifest.testSpine(d.fileName);
        if (test) {
            outputChannel.appendLine(txtLangue["outputChannelPbSpine"]);

            test.forEach(el => {
                outputChannel.appendLine('\t' + el);

            });

            outputChannel.show(true);
        }



    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.ecritureSpine', function () {
        if (!util.testOEBPS()) {
            Window.showInformationMessage(txtLangue["erreurPathOEBPS"]);
            return; // No open text editor
        }
        let d = Window.activeTextEditor.document;
        if (path.extname(d.fileName) !== '.opf') {
            Window.showInformationMessage(txtLangue["erreurFichierOPF"]);
            return;
        }
        outputChannel.clear();

        manifest.ecritureSpine(d.fileName);



    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.epubTOC', function () {
        if (!util.testOEBPS()) {
            Window.showInformationMessage(txtLangue["erreurPathOEBPS"]);
            return; // No open text editor
        }

        let d = Window.activeTextEditor.document;
        var tdm = isTDM(d.fileName);
        if (!tdm) {
            Window.showInformationMessage(txtLangue["erreurFichierTOC"]);
            return; // No open text editor
        }
        outputChannel.clear();
        var Liens = util.fichierLiens('.xhtml');
        // console.log(problemes.problemesTitres(Liens));
        outputChannel.appendLine(problemes.problemesTitres(Liens));
        if (config.get("ancreTDM").ajouterAncre) {
            ajoutAncre(Liens);
        }
        epubTOC(Liens, d.fileName);
        outputChannel.show(true);
    });

    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.epubTitle', function () {
        if (!util.testOEBPS()) {
            Window.showInformationMessage(txtLangue["erreurPathOEBPS"]);
            return; // No open text editor
        }
        var Liens = util.recupFichiers('.xhtml');
        epubTitle(Liens);
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.epubError', function () {
        if (!util.testOEBPS()) {
            Window.showInformationMessage(txtLangue["erreurPathOEBPS"]);
            return; // No open text editor
        }

        let doc = Window.activeTextEditor.document;
        let wkFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(doc.fileName));

        let textOutput;

        outputChannel.clear();
        let Liens = util.recupFichiers('.xhtml');

        let mesErreurs = problemes.problemesTable(Liens);
        (mesErreurs[1].length > 0) && outputChannel.appendLine('- ' + txtLangue["outputChannelTableauTh"]);
        mesErreurs[1].forEach(erreur => {
            outputChannel.appendLine('\t' + erreur + '\n');
        });
        (mesErreurs[0].length > 0) && outputChannel.appendLine('- ' + txtLangue["outputChannelTableauScope"]);
        mesErreurs[0].forEach(erreur => {
            outputChannel.appendLine('\t' + erreur + '\n');
        });

        outputChannel.appendLine(problemes.problemesTitres(Liens));

        let monOpf = util.recupFichiers('.opf')[0];
        let outSpine = manifest.testSpine(monOpf);
        if (outSpine) {
            outputChannel.appendLine('- ' + txtLangue["outputChannelPbSpine2"] + '(' + monOpf.toString() + ')');
            outSpine.forEach(el => {
                outputChannel.appendLine('\t' + el);
            })
        }

        outputChannel.show(true);
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.epubPageList', function () {
        if (!util.testOEBPS()) {
            Window.showInformationMessage(txtLangue["erreurPathOEBPS"]);
            return; // No open text editor
        }
        let d = Window.activeTextEditor.document,
            tdm = isTDM(d.fileName);
        if (!tdm) {
            Window.showInformationMessage(txtLangue["erreurFichierTOC"]);
            return; // No open text editor
        }
        let Liens = util.recupFichiers('.xhtml'),
            pBreak = epubPageBreak(Liens, d.fileName);
        if (pBreak.length !== 0) {

            fs.readFile(d.fileName, 'utf8', (err, txt) => {
                if (txt.indexOf('epub:type="page-list"') !== -1) {
                    util.remplaceDansFichier(d.fileName, pBreak, 'nav', 'page-list');
                } else {
                    pBreak = '<nav epub:type="page-list" role="doc-pagelist">\n' + pBreak + '\n</nav>';
                    // find </nav>
                    if (txt.indexOf('</nav>') !== -1) {
                        var data = txt.replace(/<\/nav>/, '</nav>\n' + pBreak);
                        fs.writeFileSync(d.fileName, data);
                    } else {
                        insertEditorSelection(pBreak);
                    }
                }
            });

        } else {
            Window.showInformationMessage(txtLangue["erreurPageBreak"]);
            util.remplaceDansFichier(d.fileName, "", 'nav', 'page-list');
        }

    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;


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
    Object.values(fichiers).forEach(function (el) {
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
        var titres = util.rechercheTitre(txt);
        if (titres) {
            var h = new RegExp('<h[0-9][^>]*>((?:.|\n|\r)*?)<\/h([0-9])>', 'ig');
            var result = h.exec(titres[0]);
            var par = epureBalise(result[1]);
            util.remplaceDansFichier(el, par.txt, 'title');
        }
    });
}

function epureBalise(texte) {
    var txtTOC = texte,
        txt = texte;
    var h = new RegExp('<[^\/>]*>((?:.|\n|\r)*?)<\/[^>]*>?|<[^>]*>?', 'gi');
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
    return {
        'toc': txtTOC,
        'txt': txt,
    };
}

function epubTOC(liens, fichierTOC) {
    try {
        var mesLiens = recupSpine(),
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
        tableMatieres(mesTitres, fichierTOC);
    } catch (error) {

        Window.showErrorMessage(txtLangue["erreurMessageSpine"]);
    }
}

function ajoutAncre(liens) {
    var k = 0;
    var nomId = config.get("ancreTDM").nomAncre;
    var allID = recupAllID(liens);
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

function recupAllID(liens) {
    var allID = [];
    Object.values(liens).forEach(function (el) {
        var data = fs.readFileSync(el, 'utf8');
        var mesId = data.match(/id="[^"]*"/gi);
        allID = mesId && allID.concat(mesId) || allID
    });
    return allID;
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
    var monSpine = monDom.getElementByTagName('spine');
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
            var monTexte = epureBalise(result[1]);
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

function rechercheHrefParIdRef(texte, idref) {
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

function rechercheIdref(texte) {
    return texte.match(/idref=(\'|").*?(\'|")/gi);
}