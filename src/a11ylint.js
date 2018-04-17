'use strict';
const fs = require('fs');
const vscode = require('vscode');
const path = require('path');
const txtImg = {
    'sansAlt': 'image / sans "alt"',
    'altVide': 'image / "alt" vide',
};
// const txtTable = {
//     'scopeHeader': 'table / sans scope ou headers',
//     'th': 'table / sans th',
// };
const diagSource = 'a11ylint'
let diagnosticCollection = null;

diagnosticCollection = vscode.languages.createDiagnosticCollection('epubTools');

function _removeDoc(doc) {
    diagnosticCollection.delete(vscode.Uri.file(doc.fsPath));
}

function diagRemove(rep) {
    diagnosticCollection.forEach(elt => {
        (elt.fsPath.indexOf(rep) !== -1) && diagnosticCollection.delete(vscode.Uri.file(elt.fsPath));
    });
}

function remiseAzero() {
    diagnosticCollection.clear();
}

function epubToolsDiagnostic(workFolder) {
    vscode.workspace.findFiles(new vscode.RelativePattern(workFolder, '**/*.xhtml')).then(liens => {
        liens.forEach(el => {
            vscode.workspace.openTextDocument(el).then(doc => {
                diagnosticDoc(doc)
            });
        });
    });
}


function epubToolsWatcher(workFolder) {
    let watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workFolder, '**/*.xhtml'));
    watcher.onDidDelete(elt => {
        console.log('delete');
        _removeDoc(elt);
    });
}



function diagnosticDoc(doc) {
    if (path.extname(doc.fileName) !== '.xhtml') return;
    let diagnostics = [];
    let docTxt = doc.getText();
    let mesImgA11y = _imageA11y(docTxt);
    // let mesTableA11Y = _tableA11y(docTxt);

    let mesA11y = mesImgA11y;
    mesA11y.forEach(elt => {
        let pos1 = doc.positionAt(elt.pstart),
            pos2 = doc.positionAt(elt.pend),
            rg = new vscode.Range(pos1, pos2);
        const diagnostic = new vscode.Diagnostic(rg, elt.message, elt.erreur);
        diagnostic.source = diagSource;
        diagnostics.push(diagnostic);
    });

    diagnosticCollection.set(doc.uri, diagnostics);


}

function _imageA11y(docTxt) {
    let mesRanges = [];
    let regex1 = new RegExp('<img[^>]*?>', 'g');
    let regex2 = new RegExp('alt=', 'i');
    let regex3 = new RegExp('alt=""|alt=\'\'', 'g');

    let array1, array2;

    while ((array1 = regex1.exec(docTxt)) !== null) {
        if (!regex2.test(array1[0])) {
            mesRanges.push({
                pstart: array1.index,
                pend: regex1.lastIndex,
                message: txtImg.sansAlt,
                erreur: vscode.DiagnosticSeverity.Error
            });
        } else {
            while ((array2 = regex3.exec(array1[0])) !== null) {
                mesRanges.push({
                    pstart: array1.index + array2.index,
                    pend: array1.index + regex3.lastIndex,
                    message: txtImg.altVide,
                    erreur: vscode.DiagnosticSeverity.Warning
                });
            }
        }
    }


    return mesRanges;
}

// function _tableA11y(docTxt) {
//     let mesRanges = [];
//     // /<table[^>]*>((?:.|\n|\r)*?)<\/table>/
//     // /<table[^>]*>(?:.|\n|\r)*?<\/table>/g
//     let regTable = new RegExp('<table[^>]*>(?:.|\n|\r)*?<\/table>', 'g');
//     let regScopHead = new RegExp('scope=|headers=', 'gi');
//     let regTH = new RegExp('<th', 'gi');

//     let array1;

//     while ((array1 = regTable.exec(docTxt)) !== null) {
//         let result = array1[0].match(regScopHead);
//         if (!result) {
//             mesRanges.push({
//                 pstart: array1.index,
//                 pend: regTable.lastIndex,
//                 message: txtTable.scopeHeader,
//                 erreur: vscode.DiagnosticSeverity.Information
//             });
//         }
//         result = array1[0].match(regTH);
//         if (!result) {
//             mesRanges.push({
//                 pstart: array1.index,
//                 pend: regTable.lastIndex,
//                 message: txtTable.th,
//                 erreur: vscode.DiagnosticSeverity.Warning
//             });
//         }

//     }
//     return mesRanges;
// }

module.exports = {
    epubToolsDiagnostic,
    diagRemove,
    remiseAzero,
    epubToolsWatcher,
    diagnosticDoc,
}