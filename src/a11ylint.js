'use strict';
const fs = require('fs');
const vscode = require('vscode');
const txtImg = {
    'sansAlt': 'image / sans "alt"',
    'altVide': 'image / "alt" vide',
};
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
            vscode.workspace.openTextDocument(vscode.Uri.file(el.fsPath)).then(doc => {
                _diagnosticDoc(doc)
            });
        });
    });
}


function epubToolsWatcher(workFolder) {
    let watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workFolder, '**/*.xhtml'));
    watcher.onDidChange(() => {
        _diagnosticDoc();
    });
    watcher.onDidCreate(elt => {
        vscode.workspace.openTextDocument(vscode.Uri.file(elt.fsPath)).then(doc => {
            _diagnosticDoc(doc);
        });
    });
    watcher.onDidDelete(elt => {
        _removeDoc(elt);
    });


}

function _diagnosticDoc(doc) {
    doc = doc && doc || vscode.window.activeTextEditor.document;
    let diagnostics = [];
    let lline = doc.lineCount,
        i = 0;
    for (; i < lline; i++) {
        let txt = doc.getText(doc.lineAt(i).range);
        let mesA11Y = _imageA11y(txt, i);
        mesA11Y.forEach(elt => {
            const diagnostic = new vscode.Diagnostic(elt.range, elt.message, vscode.DiagnosticSeverity.Warning);
            diagnostic.source = diagSource;
            diagnostics.push(diagnostic);
        });
        diagnosticCollection.set(doc.uri, diagnostics);
    }
}


function _imageA11y(line, nl) {
    let mesRanges = [];
    let regex1 = new RegExp('<img[^>]*?>', 'g');
    let regex2 = new RegExp('alt=', 'i');
    let regex3 = new RegExp('alt=""|alt=\'\'', 'g');

    let array1, array2;

    while ((array1 = regex1.exec(line)) !== null) {
        if (!regex2.test(array1[0])) {
            var rg = new vscode.Range(nl, array1.index, nl, regex1.lastIndex);
            mesRanges.push({
                range: rg,
                message: txtImg.sansAlt,
            });
        } else {
            while ((array2 = regex3.exec(array1[0])) !== null) {
                var rg2 = new vscode.Range(nl, array1.index + array2.index, nl, array1.index + regex3.lastIndex);
                mesRanges.push({
                    range: rg2,
                    message: txtImg.altVide,
                });
            }
        }
    }
    return mesRanges;
}


module.exports = {
    epubToolsDiagnostic,
    diagRemove,
    remiseAzero,
    epubToolsWatcher,
}