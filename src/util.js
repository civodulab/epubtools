'use strict';
const vscode = require('vscode');
const Window = vscode.window;
const fs = require('fs');
const path = require('path');
const config = vscode.workspace.getConfiguration('epub');



function fichierLiens(type) {
    var mesXhtml = recupFichiers(type);
    var Liens = {};
    mesXhtml.forEach(function (el) {
        var el2 = path.basename(el);
        Liens[el2] = el;
    });
    return Liens;
}

function recupFichiers(typeOrfichier) {
    return getFilesFromDir(pathOEBPS(), typeOrfichier);
}

function pathOEBPS_old() {
    let e = Window.activeTextEditor;
    let d = e.document;
    if (d.fileName.indexOf('OEBPS') !== -1) {
        var chemin = d.fileName.substring(0, d.fileName.indexOf('OEBPS'));
    }
    return path.join(chemin, 'OEBPS');
}

function pathOEBPS() {
    let folders = vscode.workspace.workspaceFolders;
    let e = Window.activeTextEditor;
    let d = e.document;
    let chemin;
    folders.forEach(rep => {
        if (d.fileName.indexOf(rep.name) !== -1) {
            chemin = d.fileName.substring(0, d.fileName.indexOf(rep.name) + rep.name.length);
        }
    });
    let fullPath = _chercheRoot(chemin);
    return fullPath;
}

function _chercheRoot(dir) {
    let cont = getFilesFromDir(dir, 'container.xml');
    let data = fs.readFileSync(cont);
    let regex1 = new RegExp('full-path="([^"]+)"', 'g');
    let result = regex1.exec(data);

    return path.join(cont.substring(0, cont.indexOf('META-INF')), result[1].split('/')[0]);


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
                filesToReturn.push(curFile);
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    };
    walkDir(dir);

    return filesToReturn;
}

function transformePageNoire(fichiersXhtml) {
    Object.values(fichiersXhtml).forEach(el => {
        var data = fs.readFileSync(el, 'utf8');
        var exp = '<span class="epubTools-numPage-style">(.[^<]*)</span>';
        var re = new RegExp(exp, 'gi');
        data = data.replace(re, '<span id="page$1" title="$1" epub:type="pagebreak" role="doc-pagebreak"></span>');
        fs.writeFileSync(el, data);
    });
}

function remplaceDansFichier(fichier, texte, balise, epubType) {
    let data = fs.readFileSync(fichier, 'utf8');
    let rpl = data.remplaceEntre2Balises(balise, texte, epubType);
    fs.writeFileSync(fichier, rpl);
}

function rechercheTitre(texte, nivT) {
    nivT = nivT || config.get('niveauTitre');
    var exp = '<h[1-' + nivT + '][^>]*>(?:.|\n|\r)*?<\/h[1-' + nivT + ']>?',
        re = new RegExp(exp, 'gi'),
        result = texte.match(re);
    return result;
}


module.exports = {
    recupFichiers,
    fichierLiens,
    pathOEBPS,
    transformePageNoire,
    remplaceDansFichier,
    rechercheTitre,
};