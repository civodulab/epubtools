'use strict';
const fs = require('fs');

function roleDoc(mesFichiers) {
    var mappings = {
        "abstract": "doc-abstract",
        "acknowledgments": "doc-acknowledgments",
        "afterword": "doc-afterword",
        "appendix": "doc-appendix",
        "biblioentry": "doc-biblioentry",
        "bibliography": "doc-bibliography",
        "biblioref": "doc-biblioref",
        "chapter": "doc-chapter",
        "colophon": "doc-colophon",
        "conclusion": "doc-conclusion",
        "cover": "doc-cover",
        "credit": "doc-credit",
        "credits": "doc-credits",
        "dedication": "doc-dedication",
        "endnote": "doc-endnote",
        "endnotes": "doc-endnotes",
        "epigraph": "doc-epigraph",
        "epilogue": "doc-epilogue",
        "errata": "doc-errata",
        "footnote": "doc-footnote",
        "foreword": "doc-foreword",
        "glossary": "doc-glossary",
        "glossdef": "definition",
        "glossref": "doc-glossref",
        "index": "doc-index",
        "introduction": "doc-introduction",
        "noteref": "doc-noteref",
        "notice": "doc-notice",
        "pagebreak": "doc-pagebreak",
        "page-list": "doc-pagelist",
        "part": "doc-part",
        "preface": "doc-preface",
        "prologue": "doc-prologue",
        "pullquote": "doc-pullquote",
        "qna": "doc-qna",
        "referrer": "doc-backlink",
        "subtitle": "doc-subtitle",
        "tip": "doc-tip",
        "toc": "doc-toc",
    };
    Object.values(mesFichiers).forEach(fichier => {
        var re_epubType = RegExp('<[^<>]* ?epub:type=(\'|")(.*?)(?:\'|")[^>]*>', 'g');
        var re_role = RegExp('<[^<>]* ?role=(\'|")(.*?)(?:\'|")[^>]*>', 'g');
        var array1;
        fs.readFile(fichier, 'utf8', (err, data) => {
            if (err) {
                console.log("ERROR !! " + err);
            } else {

                // role
                while ((array1 = re_epubType.exec(data)) !== null) {
                    var balise = array1[0];
                    var epubType = array1[2];
                    var role = balise.getAttr('role');
                    if (!role) {
                        var roles = epubType.split(' ').map(inflection => mappings[inflection]).filter(el => !!el);
                        data = (roles.length !== 0) && data.replace(balise, balise.setAttr('role', roles.shift())) || data;
                    }
                }

                fs.writeFile(fichier, data, (err) => {
                    if (err) console.log("ERROR !! " + err);
                    // console.log(data);
                });
            }
        });

    });

}

module.exports = {
    roleDoc,
}