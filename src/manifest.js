'use strict';
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const isNumeric = require('../mes_modules/str-isnum');
const config = vscode.workspace.getConfiguration('epub');
const util = require('./util');


function epubManifest(fichierOPF) {
    var mesFichiers = util.fichierLiens();
    var montexte = "";
    var opf = path.basename(fichierOPF);
    for (var fich in mesFichiers) {
        if (fich !== opf) {
            montexte += _ecritureLigne(mesFichiers[fich], fichierOPF);
        }
    }
    util.remplaceDansFichier(fichierOPF, montexte, 'manifest');
}

function _ecritureLigne(fichier, fichierOPF) {
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
    var boolCover = nom.split('.')[0] === config.get('coverImage');
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
            mediaType = "application/x-dtbncx+xml";
            _nomSpine(nom, fichierOPF);
            break;
            //  Text Types
        case ".css":
            mediaType = "text/css"
            break;
        case ".vtt":
            mediaType = "text/vtt"
            break;
        case ".srt":
            mediaType = "text/srt"
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
            mediaType = "image/gif";
            properties = boolCover && ' properties="cover-image"' || '';
            break;
        case ".jpeg":
        case ".jpg":
            mediaType = "image/jpeg";
            properties = boolCover && ' properties="cover-image"' || '';

            break;
        case ".png":
            mediaType = "image/png";
            properties = boolCover && ' properties="cover-image"' || '';

            break;
        case ".svg":
            mediaType = "image/svg+xml";
            properties = boolCover && ' properties="cover-image"' || '';

            break;
            // Audio types
        case ".mpg":
        case ".mp3":
            mediaType = "audio/mpeg"
            break;
        case ".smil":
            mediaType = "application/smil+xml"
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

function _nomSpine(ncx, fichierOPF) {
    var texte = fs.readFileSync(fichierOPF, 'utf8');
    texte = texte.replace(/<spine[^>]*>/, '<spine toc="' + ncx + '">');
    fs.writeFileSync(fichierOPF, texte, 'utf8');
}

function testSpine(fichierOPF) {
    let data = fs.readFileSync(fichierOPF, 'utf8');
    // var monDom = new dom(data);
    let mesIdref = data.match(/idref=((?:\'|").*?(?:\'|"))/gi);
    mesIdref = mesIdref.map(el => el.replace(/idref=(\'|")(.*?)(?:\'|")/, '$2'));
    let mesID = data.match(/id=(?:\'|").*?(?:\'|")/gi);
    mesID = mesID.map(el => el.replace(/id=(\'|")(.*?)(?:\'|")/, '$2'));
    let mesErreurs = [];
    mesIdref.forEach(element => {
        if (mesID.indexOf(element) === -1) {
            //    erreur
            mesErreurs.push('itemref -> ' + element)
        }
    });
    if (mesErreurs.length !== 0) {
        return mesErreurs;
    } else {
        return false;
    }
}


module.exports = {
    epubManifest,
    testSpine,
};