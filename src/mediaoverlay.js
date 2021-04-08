"use strict";
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const config = vscode.workspace.getConfiguration("epub");
const util = require("./util");

function epubMetadataMediaOverlay(fichierOPF) {
  let data = fs.readFileSync(fichierOPF, "utf8");
  // on récupére les metadata media Overlay
  const reg_narrator = /<meta [^>]*?property="media:narrator"[^>]*?>((?:.|\n|\r)*?)<\/meta>/;
  const reg_activeClass = /<meta [^>]*?property="media:active-class"[^>]*?>((?:.|\n|\r)*?)<\/meta>/;
  const reg_playbackActiveClass = /<meta [^>]*?property="media:playback-active-class"[^>]*?>((?:.|\n|\r)*?)<\/meta>/;
  const reg_metaDur = /<meta [^>]*?property="media:duration"[^>]*?>((?:.|\n|\r)*?)<\/meta>/g;

  data = data.replace(reg_metaDur, "");
  //   metadata media-overlay
  //  const création métadata
  const re_clip = new RegExp("[0-9]+:[0-9]+:[0-9]+.[0-9]+", "g");
  let metaDataOverlay = [];
  let narrator = data.match(reg_narrator);
  !narrator
    ? metaDataOverlay.push('<!--<meta property="media:narrator">nomAuteur</meta>-->')
    : metaDataOverlay.push(narrator[0]);
  let activClass = data.match(reg_activeClass);
  !activClass
    ? metaDataOverlay.push(
        '<meta property="media:active-class">-epub-media-overlay-active</meta>'
      )
    : metaDataOverlay.push(activClass[0]);
  let playback = data.match(reg_playbackActiveClass);
  !playback
    ? metaDataOverlay.push(
        '<meta property="media:playback-active-class">-epub-media-overlay-playing</meta>'
      )
    : metaDataOverlay.push(playback[0]);

  console.log(metaDataOverlay);

  let mesSmil = util.recupFichiers(".smil");
  let total = new Date(2011, 4, 20);
  let H, M, S, mS;
  mesSmil.forEach((smil) => {
    console.log(smil);
    let datasmil = fs.readFileSync(smil, "utf8");
    let temps = datasmil.match(re_clip);
    let max = temps.pop();
    let varTemps = max.split(":");
    H = Number(varTemps[0]);
    M = Number(varTemps[1]);
    S = Number(varTemps[2].split(".")[0]);
    mS = Number(varTemps[2].split(".")[1]);

    total.setHours(total.getHours() + H);
    total.setMinutes(total.getMinutes() + M);
    total.setSeconds(total.getSeconds() + S);
    total.setMilliseconds(total.getMilliseconds() + mS);

    metaDataOverlay.push(
      '<meta property="media:duration" refines="#' +
        lien.split("\\").pop() +
        '">' +
        max +
        "</meta>\n"
    );
  });
  H = total.getHours();
  H = (H < 10 && "0" + H) || H;
  M = total.getMinutes();
  M = (M < 10 && "0" + M) || M;
  S = total.getSeconds();
  S = (S < 10 && "0" + S) || S;

  mS = total.getMilliseconds();
  mS = "00" + mS;
  mS = mS.substring(mS.length - 3, mS.length);

  let tpsTotal = H + ":" + M + ":" + S + "." + mS;
  metaDataOverlay.push('<meta property="media:duration">' + tpsTotal + "</meta>");
}

function _idSmil(data,smil){
    let nomSmil=path.basename(smil);
    const reg_href="<item [^>]*?href=(\"|\')[^\"\']*"+nomSmil+"[^>]*>";
    
}


module.exports = {
  epubMetadataMediaOverlay,
};