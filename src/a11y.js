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
        var data = fs.readFileSync(fichier, 'utf8');
        var regex = RegExp('<[^<>]* ?epub:type=(\'|")(.*?)(?:\'|")[^>]*>', 'g');
        var array1;
        while ((array1 = regex.exec(data)) !== null) {
            // console.log(array1);
            var balise = array1[0];
            var epubType = array1[2];
            var role = balise.getAttr('role');
            if (!role) {
                var roles = epubType.split(' ').map(inflection => mappings[inflection]).filter(el => !!el);
                data = (roles.length !== 0) && data.replace(balise, balise.setAttr('role', roles.shift())) || data;
                // console.log(balise + ' - ' + balise.getAttr('role'));
                // console.log(epubType);
            }
        }
        fs.writeFileSync(fichier, data);

    });

}

module.exports = {
    roleDoc,
}