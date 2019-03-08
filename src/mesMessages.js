'use strict';
const vscode = require('vscode');

const maLangue = vscode.env.language;

const util = require('./util');
const localTexte = {
    "fr": {
        navInsertTdm:{
            label:"TDM",
            description:"Insérer la table des matières"
        },
        "erreurPathEPUB": "Vous devez être dans un EPUB.",
        "erreurPathOEBPS": "Vous devez être dans un dossier %OEBPS.",
        "a11y.placeHolder": "Choisissez dans la liste ci-dessous.",
        "a11y.aria.description": "Ajoute role=\"doc-...\" si epub:type",
        "erreurFichierOPF": "Vous devez être dans un fichier opf",
        "outputChannelPbSpine": "Problème de spine :",
        "erreurFichierTOC": "Vous devez être dans un fichier toc",
        "outputChannelTableauTh": "Tableaux sans th",
        "outputChannelTableauScope": "Tableaux sans scope et/ou headers",
        "outputChannelPbSpine2": "Problème de spine [opf]",
        "erreurPageBreak": "Vous n'avez aucun \"epub:type=pagebreak\" dans votre EPUB.",
        "erreurMessageSpine": "Vous avez une erreur avec votre spine dans le fichier \"opf\".",

    },
    "en": {
        navInsertTdm:{
            label:"TOC",
            description:"Insert table of content"
        },
        "erreurPathEPUB": "You must be in an EPUB.",
        "erreurPathOEBPS": "You must be in an %OEBPS folder.",
        "a11y.placeHolder": "Choose from the list below.",
        "a11y.aria.description": "Add role=\"doc-...\" if epub:type",
        "erreurFichierOPF": "You must be in an opf file",
        "outputChannelPbSpine": "Spine problem:",
        "erreurFichierTOC": "You must be in a toc file",
        "outputChannelTableauTh": "Tables without th",
        "outputChannelTableauScope": "Tables without scope and/or headers",
        "outputChannelPbSpine2": "Spine problem [opf]",
        "erreurPageBreak": "You don't have any \"epub:type=pagebreak\" in your EPUB.",
        "erreurMessageSpine": "You have an error with your spine in the \"opf\" file."
    }
}

const txtLangue = localTexte[maLangue] && localTexte[maLangue] || localTexte["en"];
let mesErreurs = {
    erreurPathOEBPS: function () {
        let nomOEBPS = util.pathOEBPS();
        let txt = '';
        if (!nomOEBPS.filename) {
            txt = txtLangue["erreurPathEPUB"];
        } else {
            txt = txtLangue["erreurPathOEBPS"].replace('%OEBPS', nomOEBPS.filename);
        }
        vscode.window.showInformationMessage(txt);
    },
    erreurFichierOPF: function () {
        vscode.window.showInformationMessage(txtLangue["erreurFichierOPF"]);

    },
    erreurPageBreak: function () {
        vscode.window.showInformationMessage(txtLangue["erreurPageBreak"]);
    },
    erreurMessageSpine: function () {
        vscode.window.showErrorMessage(txtLangue["erreurMessageSpine"]);
    },
    erreurFichierTOC:function(){
        vscode.window.showInformationMessage(txtLangue["erreurFichierTOC"]);
    }
}

module.exports = {
    mesErreurs,
    txtLangue
}