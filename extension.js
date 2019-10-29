// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
'use strict';
const vscode = require('vscode');

const config = vscode.workspace.getConfiguration('epub');
const Window = vscode.window;
const fs = require('fs');
const path = require('path');
const problemes = require('./src/problemes');

const util = require('./src/util');
const manifest = require('./src/manifest');
const mesMessages = require('./src/mesMessages');

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
    var exp = attr + '="([^"]*)"';
    if (this.indexOf(attr + '=') !== -1) {
        var re = new RegExp(exp, 'gi'),
            result = re.exec(this);
        return this.replace(result[1], val);
    } else {
        // result = this.match(exp);
        return this.replace('>', ' ' + attr + '="' + val + '">')
    }

}

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
            mesMessages.mesErreurs.erreurPathOEBPS();
            return; // No open text editor
        }

        var Liens = util.fichierLiens('.xhtml');

        util.transformePageNoire(Liens);

    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.navInsertion', function () {
        if (!util.testOEBPS()) {
            mesMessages.mesErreurs.erreurPathOEBPS();
            return; // No open text editor
        }
        const nav = require('./src/nav');

        var opts = {
            matchOnDescription: true,
            placeHolder: mesMessages.txtLangue["a11y.placeHolder"]
        };
        var items = [];

        items.push({
            label: mesMessages.txtLangue.navInsertTdm.label,
            description: mesMessages.txtLangue.navInsertTdm.description
        }, {
            label: mesMessages.txtLangue.navInsertPageList.label,
            description: mesMessages.txtLangue.navInsertPageList.description
        }, {
            label: mesMessages.txtLangue.navInsertTableList.label,
            description: mesMessages.txtLangue.navInsertTableList.description
        }, {
            label: mesMessages.txtLangue.navInsertIllustrationList.label,
            description: mesMessages.txtLangue.navInsertIllustrationList.description
        }, {
            label: mesMessages.txtLangue.navInsertAudioList.label,
            description: mesMessages.txtLangue.navInsertAudioList.description
        }, {
            label: mesMessages.txtLangue.navInsertVideoList.label,
            description: mesMessages.txtLangue.navInsertVideoList.description
        });
        Window.showQuickPick(items, opts).then((selection) => {
            if (!selection) {
                return;
            }
            switch (selection.label) {
                case mesMessages.txtLangue.navInsertTdm.label:
                    nav.tdm();
                    break;
                case mesMessages.txtLangue.navInsertPageList.label:
                    nav.navlist('page-list');
                    break;
                case mesMessages.txtLangue.navInsertTableList.label:
                    nav.navlist('lot');
                    break;
                case mesMessages.txtLangue.navInsertIllustrationList.label:
                    nav.navlist('loi');
                    break;
                case mesMessages.txtLangue.navInsertAudioList.label:
                    nav.navlist('loa');
                    break;
                case mesMessages.txtLangue.navInsertVideoList.label:
                    nav.navlist('lov');
                    break;
                default:

                    break;
            }
        });


    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('extension.epubA11Y', function () {
        if (!util.testOEBPS()) {
            mesMessages.mesErreurs.erreurPathOEBPS();
            return; // No open text editor
        }
        const a11y = require('./src/a11y');

        var opts = {
            matchOnDescription: true,
            placeHolder: mesMessages.txtLangue["a11y.placeHolder"]
        };
        var items = [];

        items.push({
            label: "DPub-Aria roles|epub:type",
            description: mesMessages.txtLangue["a11y.aria.description"]
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
            mesMessages.mesErreurs.erreurPathOEBPS();
            return; // No open text editor
        }

        let d = Window.activeTextEditor.document;
        if (path.extname(d.fileName) !== '.opf') {
            mesMessages.mesErreurs.erreurFichierOPF();
            return;
        }
        outputChannel.clear();

        manifest.epubManifest(d.fileName);

        let test = manifest.testSpine(d.fileName);
        if (test) {
            outputChannel.appendLine(mesMessages.txtLangue["outputChannelPbSpine"]);

            test.forEach(el => {
                outputChannel.appendLine('\t' + el);

            });

            outputChannel.show(true);
        }



    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.ecritureSpine', function () {
        if (!util.testOEBPS()) {
            mesMessages.mesErreurs.erreurPathOEBPS();
            return; // No open text editor
        }
        let d = Window.activeTextEditor.document;
        if (path.extname(d.fileName) !== '.opf') {
            mesMessages.mesErreurs.erreurFichierOPF();
            return;
        }
        outputChannel.clear();

        manifest.ecritureSpine(d.fileName);



    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.epubTitle', function () {
        if (!util.testOEBPS()) {
            mesMessages.mesErreurs.erreurPathOEBPS();
            return; // No open text editor
        }
        var Liens = util.recupFichiers('.xhtml');
        epubTitle(Liens);
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.epubError', function () {
        if (!util.testOEBPS()) {
            mesMessages.mesErreurs.erreurPathOEBPS();
            return; // No open text editor
        }

        // let doc = Window.activeTextEditor.document;
        // let wkFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(doc.fileName));

        // let textOutput;

        outputChannel.clear();
        let Liens = util.recupFichiers('.xhtml');

        let mesErreurs = problemes.problemesTable(Liens);
        (mesErreurs[1].length > 0) && outputChannel.appendLine('- ' + mesMessages.txtLangue["outputChannelTableauTh"]);
        mesErreurs[1].forEach(erreur => {
            outputChannel.appendLine('\t' + erreur + '\n');
        });
        (mesErreurs[0].length > 0) && outputChannel.appendLine('- ' + mesMessages.txtLangue["outputChannelTableauScope"]);
        mesErreurs[0].forEach(erreur => {
            outputChannel.appendLine('\t' + erreur + '\n');
        });

        outputChannel.appendLine(problemes.problemesTitres(Liens));

        let monOpf = util.recupFichiers('.opf')[0];
        let outSpine = manifest.testSpine(monOpf);
        if (outSpine) {
            outputChannel.appendLine('- ' + mesMessages.txtLangue["outputChannelPbSpine2"] + '(' + monOpf.toString() + ')');
            outSpine.forEach(el => {
                outputChannel.appendLine('\t' + el);
            })
        }

        outputChannel.show(true);
    });

    context.subscriptions.push(disposable);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;





function epubTitle(fichiers) {
    fichiers.forEach(function (el) {
        var txt = fs.readFileSync(el, 'utf8');
        var titres = util.rechercheTitre(txt, 6);
        if (titres) {
            var h = new RegExp('<h[1-9][^>]*>((?:.|\n|\r)*?)<\/h([1-9])>', 'ig');
            var result = h.exec(titres[0]);
            var par = util.epureBalise(result[1]);
            util.remplaceDansFichier(el, par.txt, 'title');
        }
    });
}