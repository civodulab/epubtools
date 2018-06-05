'use strict';
const fs = require('fs');
const vscode = require('vscode');
const path = require('path');
const util = require('./util');
const txtTable = {
    'scopeHeader': '- Tableaux sans scope et/ou headers',
    'th': '- Tableaux sans th',
};

function problemesTitres(liens) {

    var sansTitre = [],
        pbHierarchie = [];
    var text = "";
    Object.values(liens).forEach(function (el) {
        var fd = vscode.Uri.file(el);
        var data = fs.readFileSync(el, 'utf8'),
            rtitre = util.rechercheTitre(data);
        if (!rtitre) {
            sansTitre.push(fd);
        } else {
            if (!_hierarchieTitre(data)) {
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
        text += (sansTitre.length !== 0) && '\n';
        text += '- Problème de hiérarchie dans les titres sur les fichiers suivants :\n';
        pbHierarchie.forEach(function (el, i) {
            text += '\t' + (i + 1) + ' -\t' + el.toString() + '\n';
        });
    }
    return text;
}

function _hierarchieTitre(texte) {
    var mesTitres = util.rechercheTitre(texte, 9);
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

function problemesTable(liens) {
    let erreursScope = [];
    let erreursTH = [];
    liens.forEach(lien => {
        vscode.workspace.openTextDocument(vscode.Uri.file(lien)).then(doc => {
            let docTxt = doc.getText();
            let erreurs = _tableA11y(docTxt, doc);
            erreursScope = erreursScope.concat(erreurs.scope);
            erreursTH = erreursTH.concat(erreurs.th);
        });
    })
    return [erreursScope, erreursTH];
}



function _tableA11y(docTxt, doc) {
    let mesScopes = [];
    let mesTH = [];

    let regTable = new RegExp('<table[^>]*>(?:.|\n|\r)*?<\/table>', 'g');
    let regScopHead = new RegExp('scope=|headers=', 'gi');
    let regTH = new RegExp('<th', 'gi');

    let array1;

    while ((array1 = regTable.exec(docTxt)) !== null) {
        let result = array1[0].match(regScopHead);
        if (!result) {
            mesScopes.push(doc.uri + '#' + (doc.positionAt(array1.index).line + 1));
        }
        result = array1[0].match(regTH);
        if (!result) {
            mesTH.push(doc.uri + '#' + (doc.positionAt(array1.index).line + 1));
        }
    }

    return {
        scope: mesScopes,
        th: mesTH,
    };
}

module.exports = {
    problemesTable,
    problemesTitres
}