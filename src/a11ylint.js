'use strict';
const vscode = require('vscode');
const config = vscode.workspace.getConfiguration('epub');
let styleEmphase = config.get('emphaseStyleAChercher');
let styleAEviter = config.get('emphaseStyleAEviter');
const maLangue = vscode.env.language;

const localTexte = {
    "fr": {
        "a11yLintTxtImgSansAlt.description": "image / sans \"alt\"",
        "a11yLintTxtImgAltVide.description": "image / \"alt\" vide",
        "a11yLintTxtEmphase.italique": "remplacer par i ou em ?",
        "a11yLintTxtEmphase.gras": "remplacer par b, strong ou em ?",
        "a11yLintTxtEmphase.emphase": "remplacer par em ?",
        "a11yLintNoteRef": "pas de <sup> avec noteref",
        "a11yLintAudioVideoTxt": "manque",
        "a11yLintAudioVideoEt": "et",
    },
    "en": {
        "a11yLintTxtImgSansAlt.description": "image / without \"alt\"",
        "a11yLintTxtImgAltVide.description": "image / \"alt\" empty",
        "a11yLintTxtEmphase.italique": "replace with i or em?",
        "a11yLintTxtEmphase.gras": "replace with b, strong or em?",
        "a11yLintTxtEmphase.emphase": "replace with em?",
        "a11yLintNoteRef": "no <sup> with noteref",
        "a11yLintAudioVideoTxt": "missing",
        "a11yLintAudioVideoEt": "and",
    }
}

const txtLangue = localTexte[maLangue] && localTexte[maLangue] || localTexte["en"];

let styleEmphaseTous = Object.values(styleEmphase).map(val => val.join('|')).join('|');
const txtImg = {
    'sansAlt': txtLangue["a11yLintTxtImgSansAlt.description"],
    'altVide': txtLangue["a11yLintTxtImgAltVide.description"],
};
const txtEmphase = {
    italique: txtLangue["a11yLintTxtEmphase.italique"],
    gras: txtLangue["a11yLintTxtEmphase.gras"],
    emphase: txtLangue["a11yLintTxtEmphase.emphase"]
};
const txtNoteref = txtLangue["a11yLintNoteRef"];
const txtAudioVideo = {
    txt: txtLangue["a11yLintAudioVideoTxt"] + ' ',
    aria: 'aria-label',
    controls: 'controls',
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
        _removeDoc(elt);
    });
}

function diagnosticDoc(doc) {
    if (doc.languageId !== 'html') return;
    let diagnostics = [];
    let docTxt = doc.getText();
    let mesImgA11y = _imageA11y(docTxt);
    let mesEmphaseA11y = _grasItalicEtc(docTxt);
    // let mesTableA11Y = _tableA11y(docTxt);
    let mesNotesA11y = _noteRef(docTxt);
    let mesAudioVideo = _audioVideo(docTxt);
    let mesA11y = mesImgA11y;
    mesA11y = mesA11y.concat(mesEmphaseA11y, mesNotesA11y, mesAudioVideo);
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

function _grasItalicEtc(docTxt) {
    let mesRanges = [];
    let re_itabold = new RegExp('<span [^>]*class=(?:"|\')([^>]*(?:' + styleEmphaseTous + ')[^>]*)(?:"|\')[^>]*>(?:.|\n|\r)*?<\/span>', 'g');
    let result;
    boucle1:
    while ((result = re_itabold.exec(docTxt)) !== null) {
        let textePB = "";
        let i=styleAEviter.length;
        while(i--){
            if (result[1].indexOf(styleAEviter[i]) !== -1) {
                break boucle1;
            }
        }
       
        Object.keys(styleEmphase).forEach(k => {
            styleEmphase[k].forEach(elt => {
                if (result[1].indexOf(elt) !== -1) {
                    textePB = txtEmphase[k];
                }
            });
        });

        mesRanges.push({
            pstart: result.index,
            pend: re_itabold.lastIndex,
            message: textePB,
            erreur: vscode.DiagnosticSeverity.Information
        });
    }
    return mesRanges;
}

function _noteRef(docTxt) {
    let mesRanges = [];
    let re_noteref = new RegExp('(<sup>|<sup [^>]*>)(.|\n|\r)*?<\/sup>', 'g');
    let result;
    while ((result = re_noteref.exec(docTxt)) !== null) {
        if (result[0].indexOf('role="doc-noteref"') !== -1 || result[0].indexOf('epub:type="noteref"') !== -1) {
            mesRanges.push({
                pstart: result.index,
                pend: re_noteref.lastIndex,
                message: txtNoteref,
                erreur: vscode.DiagnosticSeverity.Error,
            });
        }
    }
    return mesRanges;
}

function _audioVideo(docTxt) {
    let mesRanges = [];
    let re_audiovideo = new RegExp('<video [^>]*>|<audio [^>]*>', 'g');
    let result;
    while ((result = re_audiovideo.exec(docTxt)) !== null) {
        let aria = result[0].getAttr('aria-label');
        let controls = result[0].getAttr('controls');

        if (!aria && !controls) {
            mesRanges.push({
                pstart: result.index,
                pend: re_audiovideo.lastIndex,
                message: txtAudioVideo.txt + txtAudioVideo.aria + ' ' + txtLangue["a11yLintAudioVideoEt"] + ' ' + txtAudioVideo.controls,
                erreur: vscode.DiagnosticSeverity.Warning,
            });
        } else if (!aria) {
            mesRanges.push({
                pstart: result.index,
                pend: re_audiovideo.lastIndex,
                message: txtAudioVideo.txt + txtAudioVideo.aria,
                erreur: vscode.DiagnosticSeverity.Warning,
            });
        } else if (!controls) {
            mesRanges.push({
                pstart: result.index,
                pend: re_audiovideo.lastIndex,
                message: txtAudioVideo.txt + txtAudioVideo.controls,
                erreur: vscode.DiagnosticSeverity.Warning,
            });
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