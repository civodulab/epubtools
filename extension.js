// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
'use strict';
const vscode = require('vscode');
const config = vscode.workspace.getConfiguration('epub');

const Window = vscode.window;
const fs = require('fs');
const path = require('path');

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

// const attr = require('elt-attr');


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
        var Liens = fichierLiens();
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
        var Liens = fichierLiens('.xhtml');
        testLiensPages(Liens);
        if (config.get("ancreTDM").ajouterAncre) {
            ajoutAncre(Liens);
        }
        epubTOC(Liens, d.fileName);

    });

    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.epubTitle', function () {
        var Liens = recupFichiers('.xhtml');
        epubTitle(Liens);
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
        var Liens = recupFichiers('.xhtml');
        var txt = fs.readFileSync(d.fileName, 'utf8');
        var pBreak = epubPageBreak(Liens, d.fileName);
        if (txt.indexOf('epub:type="page-list"') !== -1) {

            remplaceDansFichier(d.fileName, pBreak, 'nav', 'page-list');
        } else {
            pBreak = '<nav epub:type="page-list">\n' + pBreak + '\n</nav>';
            insertEditorSelection(pBreak);
        }


    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;


function testLiensPages(liens){
    Object.keys(liens).forEach(function (el) {
        var data = fs.readFileSync(liens[el], 'utf8'),
            rtitre = rechercheTitre(data);
        if (rtitre.length===0) {
           Window.showWarningMessage('Le fichier "**'+path.basename(el)+'**" ne contient aucun liens');
        }
    });
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

    var pageList = '<ol>\n';
    pageBreaks.forEach(function (el) {
        pageList += '<li><a href="' + el.page + '#' + el.id + '">' + el.value + '</a></li>\n';

    });
    pageList += '</ol>\n';
    return pageList;
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

function recupFichiers(typeOrfichier) {
    return getFilesFromDir(pathOEBPS(), typeOrfichier);
}

function pathOEBPS() {
    let e = Window.activeTextEditor;
    let d = e.document;
    if (d.fileName.indexOf('OEBPS') !== -1) {
        var chemin = d.fileName.substring(0, d.fileName.indexOf('OEBPS'));
    }
    return path.join(chemin, 'OEBPS');
}


function epubTOC(liens, fichierTOC) {
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

function fichierLiens(type) {
    var mesXhtml = recupFichiers(type);
    var Liens = {};
    mesXhtml.forEach(function (el) {
        var el2 = path.basename(el);
        Liens[el2] = el;
    });
    return Liens;
}

function isTDM(fichier) {
    var txt = fs.readFileSync(fichier, 'utf8');
    if (txt.indexOf('</nav>') !== -1 || txt.indexOf('</navMap') !== -1) {
        return true;
    }
    return false;
}

function recupSpine() {
    var monOPF = recupFichiers('.opf')[0];
    var data = fs.readFileSync(monOPF, 'utf8');
    var monDom = new dom(data);
    var monSpine = monDom.getElementByTagName('spine')
    var idref = rechercheIdref(monSpine[0]);
    return rechercheHrefParIdRef(data, idref);
}



function tableMatieres(titres, fichierTOC) {
    var maTableXhtml = '<h2 class="titre1">' + config.get('titreTDM') + '</h2>\n',
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

            maTableXhtml += '<a href="' + relativeP + id + '">';
            maTableXhtml += result[1] + '</a>';

            maTableNCX += '<navLabel>\n<text>';
            maTableNCX += result[1];
            maTableNCX += '</text>\n</navLabel>\n';
            maTableNCX += '<content src="' + relativeP + id + '" />';
            // maTableNCX += '</navPoint>';

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

function rechercheTitre(texte) {
    var nivT = config.get('niveauTitre'),
        monDom = new dom(texte),
        mesTitres = [];
    // var tt = 'h[0-' + nivT + ']';
    for (let i = 1; i <= nivT; i++) {
        var tt = monDom.getElementByTagName('h' + i);
        mesTitres = tt && mesTitres.concat(monDom.getElementByTagName('h' + i)) || mesTitres;
    }
    return mesTitres;

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


// Return a list of files of the specified fileTypes in the provided dir, 
// with the file path relative to the given dir
// dir: path of the directory you want to search the files for
// fileTypes: array of file types you are search files, ex: ['.txt', '.jpg']
function getFilesFromDir(dir, typeO) {
    var filesToReturn = [],
        type = typeO,
        fichier = false;
    if (type && type.split('.')[0] !== '') {
        fichier = true;
        filesToReturn = '';
    }

    function walkDir(currentPath) {
        var files = fs.readdirSync(currentPath);
        for (var i in files) {
            var curFile = path.join(currentPath, files[i]);
            if (fichier === true && files[i] === type) {
                filesToReturn = curFile;
            }
            if (!typeO) type = path.extname(curFile);
            if (fs.statSync(curFile).isFile() && path.extname(curFile) === type) {
                // filesToReturn.push(curFile.replace(dir, ''));
                filesToReturn.push(curFile);
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    };
    walkDir(dir);
    // if (fichier) {
    //     filesToReturn = walkDir(dir);
    // } else {
    //     walkDir(dir);
    // }
    return filesToReturn;
}