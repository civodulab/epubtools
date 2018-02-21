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

function pathOEBPS() {
    let e = Window.activeTextEditor;
    let d = e.document;
    if (d.fileName.indexOf('OEBPS') !== -1) {
        var chemin = d.fileName.substring(0, d.fileName.indexOf('OEBPS'));
    }
    return path.join(chemin, 'OEBPS');
}

function epureCSS(fichiersCSS, fichiersXHTML) {
    var mesStyles = [],
        mesClass = [],
        mesId = [];
    Object.values(fichiersCSS).forEach(function (el) {
        var data = fs.readFileSync(el, 'utf8');
        var tab = recupStyleCss(data);
        mesStyles = tab && mesStyles.concat(tab) || mesStyles;
    });
    mesStyles = mesStyles.filter(function (item, pos, self) {
        return self.indexOf(item) === pos;
    });

    Object.values(fichiersXHTML).forEach(function (el) {
        var data = fs.readFileSync(el, 'utf8');
        var tabClass = recupClass(data);
        var tabId = recupId(data);
        mesId = tabId && mesId.concat(tabId) || mesId;
        mesClass = tabClass && mesClass.concat(tabClass) || mesClass;
    });
    mesClass = mesClass.filter(function (item, pos, self) {
        return self.indexOf(item) === pos;
    });
    mesId = mesId.filter(function (item, pos, self) {
        return self.indexOf(item) === pos;
    });

    console.log(mesId);
}

function recupClass(fichier) {
    var classes = [];
    var result;
    var re = new RegExp('class="([^"]*)"', 'gi');
    // var result = re.exec(fichier);
    while ((result = re.exec(fichier)) !== null) {
        classes = classes.concat(result[1].split(' '));
        re.lastIndex;
    }
    return classes;
}

function recupId(fichier) {
    var classes = [];
    var result;
    var re = new RegExp('id="([^"]*)"', 'gi');
    // var result = re.exec(fichier);
    while ((result = re.exec(fichier)) !== null) {
        classes = classes.concat(result[1].split(' '));
        re.lastIndex;
    }
    return classes;
}

function recupStyleCss(txtFichierCSS) {

    // var newTxt = txtFichierCSS.replace(/{(?:.|\n|\r)*?}/gi, ';');
    // newTxt = newTxt.replace(/@(?:.|\n|\r)*?;/g, "");
    var newTxt = txtFichierCSS.match(/[\.#][\w-_]*(?=,|\s{|{)/g);
    return newTxt;

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
    epureCSS
};