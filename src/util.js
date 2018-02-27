'use strict';
const vscode = require('vscode');
const Window = vscode.window;
const fs = require('fs');
const path = require('path');



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
    // supprime doublons
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
    //supprime doublons
    mesClass = mesClass.filter((item, pos, self) => {
        return self.indexOf(item) === pos;
    });
    mesClass = mesClass.map(x => '.' + x);
    mesId = mesId.filter((item, pos, self) => {
        return self.indexOf(item) === pos;
    });
    mesId = mesId.map(x => '#' + x);

    mesStyles.forEach(style => {
        (mesClass.indexOf(style) === -1 && mesId.indexOf(style) === -1) && suppStyle(style, fichiersCSS);
    });

    // console.log(mesClass);
    // console.log(mesId);
}

function suppStyle(style, fichiersCSS) {
    style = '\\' + style;

    Object.values(fichiersCSS).forEach(el => {
        let data = fs.readFileSync(el, 'utf8'),
            exp = '[^,}]*(?:' + style + ')[^,{]*',
            re = new RegExp(exp, 'gi');

        data = data.replace(re, '');
        data = data.replace(/,{2,}/g, ',');
        data = data.replace(/[}][\W]*(?:{)[^}]*}/g, '}');
        data = data.replace(/[,][\W]*{/g, '{');
        data = data.replace(/}[\W]*[,]/g, '}');

        fs.writeFileSync(el, data);
    });


}


function recupClass(fichier) {
    var classes = [];
    var result;
    var re = new RegExp('class="([^"]*)"', 'gi');
    // var result = re.exec(fichier);
    while ((result = re.exec(fichier)) !== null) {
        classes = classes.concat(result[1].split(' '));
        // re.lastIndex;
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
        // re.lastIndex;
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


module.exports = {
    recupFichiers,
    fichierLiens,
    epureCSS,
    pathOEBPS,
};