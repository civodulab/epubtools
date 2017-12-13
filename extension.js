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
    var tsCarac = '(?:.|\n|\r)*?';
    var exp = '<' + balise + epubType + '[^>]*>(' + tsCarac + ')<\/' + balise + '>';
    var re = new RegExp(exp, 'gi'),
        result = re.exec(this);
    return this.replace(result[1], par);
}

String.prototype.rechercheEntre2Balises = function rechercheEntre2Balises(balise) {
    var exp = "<" + balise + "[^>]*>((?:.|\n|\r)*?)<\/" + balise + ">",
        re = new RegExp(exp, 'gi');
    return this.match(re);
}

function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "EpubTools" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.epubManifest', function () {
        epubManifest();
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.epubTOC', function () {
        epubTOC();
    });
    context.subscriptions.push(disposable);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;


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


function epubTOC() {
    let e = Window.activeTextEditor;
    if (!e) {
        Window.showInformationMessage('Vous devez être dans un fichier quelconque du dossier.');
        return; // No open text editor
    }
    let d = e.document;
    var tdm = isTDM(d.fileName);
    if (!tdm) {
        Window.showInformationMessage('Vous devez être dans un fichier toc.');
        return; // No open text editor
    }
    var mesLiens = recupSpine(),
        cheminOEBPS = pathOEBPS(),
        mesTitres = [];
    mesLiens.forEach(function (el) {
        var el1 = path.join(cheminOEBPS, el.replace('..', '')),
            data = fs.readFileSync(el1, 'utf8'),
            rtitre = rechercheTitre(data);
        if (rtitre) {
            var monLien = [];
            monLien.push(el);
            monLien.push(rtitre);
            mesTitres.push(monLien);
        }
    });

    tableMatieres(mesTitres, d.fileName);
}

function isTDM(fichier) {
    var txt = fs.readFileSync(fichier, 'utf8');
    var regNav = new RegExp('<\/nav>', 'g');
    var regNavMap = new RegExp("<\/navMap>", 'g');

    if (txt.match(regNav) || txt.match(regNavMap)) {
        return true;
    }
    return false;
}

function recupSpine() {
    var monOPF = recupFichiers('.opf')[0];
    var data = fs.readFileSync(monOPF, 'utf8');
    var monSpine = data.rechercheEntre2Balises('spine');
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
        el[1].forEach(function (titre) {
            var h = new RegExp('<h[0-9][^>]*>([^<]*)<\/h([0-9])>', 'ig'),
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

            maTableXhtml += '<a href="' + el[0] + id + '">';
            maTableXhtml += result[1] + '</a>';

            maTableNCX += '<navLabel>\n<text>';
            maTableNCX += result[1];
            maTableNCX += '</text>\n</navLabel>\n';
            maTableNCX += '<content src="' + el[0] + id + '" />';
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
        exp = '<h[0-' + nivT + '][^>]*>[^<]*<\/h[0-' + nivT + ']>',
        re = new RegExp(exp, 'gi');
    return texte.match(re);

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
        property = "",
        ext = relativeFichier.split('.').pop(),
        nom = path.basename(relativeFichier);
    switch (ext) {
        case 'xhtml':
            mediaType = "application/xhtml+xml";
            nom = path.basename(nom, '.xhtml');
            if (findScript(fichier)) {
                property = ' properties="scripted"';
            }
            break;
        case 'js':
            mediaType = "application/javascript";
            break;
        case "ncx":
            mediaType = "application/x-dtbncx+xml"
            break;
            //  Text Types
        case "css":
            mediaType = "text/css"
            break;

            //  Font Types
        case "ttf":
        case "otf":
            mediaType = "application/font-sfnt"
            break;
        case "woff":
            mediaType = "application/font-woff"
            break;

            //  Images type
        case "gif":
            mediaType = "image/gif"
            break;
        case "jpg":
            mediaType = "image/jpeg"
            break;
        case "png":
            mediaType = "image/png"
            break;
        case "svg":
            mediaType = "image/svg+xml"
            break;
            // Audio types
        case "mpg":
        case "mp3":
            mediaType = "audio/mpeg"
            break;
        case "mp4":
        case "aac":
            mediaType = "audio/mp4"
        default:
            break;
    }

    maligne = '<item id="' + nom + '" href="' + relativeFichier + '" media-type="' + mediaType + '"' + property + ' />';
    return maligne;
}


function epubManifest() {
    let e = Window.activeTextEditor;
    if (!e) {
        Window.showInformationMessage('Vous devez être dans un fichier opf.');
        return; // No open text editor
    }
    let d = e.document;
    if (d.fileName.split('.').pop() !== 'opf') {
        Window.showInformationMessage('Vous devez être dans un fichier opf');
        return;
    }

    var mesFichiers = recupFichiers(),
        montexte = "";
    mesFichiers.forEach(function (el) {
        console.log(findScript(el));

        if (el !== d.fileName) {
            montexte += ecritureLigne(el, d.fileName);
        }
    });
    remplaceDansFichier(d.fileName, montexte, 'manifest');
}

function findScript(fichier) {
    var data = fs.readFileSync(fichier);
    if (data.indexOf('</script>') !== -1) {
        return true;
    }
    return false;
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
                return curFile;
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
    if (fichier) {
        filesToReturn = walkDir(dir);
    } else {
        walkDir(dir);
    }
    return filesToReturn;
}