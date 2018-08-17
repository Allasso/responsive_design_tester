var rspdsg___styleSheet;
var rspdsg___currentURL;
var rspdsg___scrollbarsData = {};
var supportPageOffset;
var isCSS1Compat;

function rspdsg___init() {
  document.body.addEventListener("mouseenter", rspdsg___onMouseEvent);

  rspdsg___styleSheet = document.createElement("style");
  document.body.appendChild(rspdsg___styleSheet);

  rspdsg___setOverflowStyle(true);
  rspdsg___currentURL = window.parent.testprotocol.href;

  supportPageOffset = window.pageXOffset !== undefined;
  isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

  // If href is placeholder, we are on the start page, or if simpleload: don't
  // do anything more.
  if (rspdsg___currentURL.indexOf("testprotocolplaceholderhref") > -1 ||
      window.parent.simpleLoad) {
    return;
  }

  rspdsg___fixLinks(window);
}

function rspdsg___fixLinks(win) {
  var elems = win.document.querySelectorAll("[href], [src]");
  for (var i = 0; i < elems.length; i++) {
    var elem = elems[i];
    var isLink = elem.hasAttribute("href");
    var href = isLink ? elem.getAttribute("href") : elem.getAttribute("src");
    if (href.indexOf("http") != 0) {
      var newHref = rspdsg___absolutizeHref(href);
//console.log("ADDED HREF : " + elem.localName + "    " + href + "    " + newHref);
      elem.setAttribute(isLink ? "href" : "src", newHref);
    }
  }
}

function rspdsg___absolutizeHref(href) {
  href = href.trim();

  if (href.indexOf("http") == 0) {
    return href;
  }

  var currentURL = rspdsg___currentURL;

  if (href.indexOf("//") == 0) {
    var protocol = currentURL.replace(/(https?:)\/\/.*/, "$1");
    return protocol + href;
  }

  if (href.indexOf("/") == 0) {
    var site = currentURL.replace(/(https?:\/\/[^\/]*).*/, "$1");
    return site + href;
  }

  // href is relative...
  var baseParts = currentURL.split("/");
  var hrefParts = href.split("/");

  var lastSeg = baseParts.pop();
  if (lastSeg.length) {
    if (baseParts.length == 2 || !/\./.test(lastSeg)) {
      // Ooops, looks like either this is the root (count($baseParts) == 2),
      // or it probably was a directory, put it back on...
      // (note, testing for a dot to determine if file or directory is very
      // naive/buggy, since directory names can have a dot, and filenames
      // may not have one.)
      baseParts.push(lastSeg);
    }
  }

  for (var i=0; i<hrefParts.length; i++) {
    if (hrefParts[i] == ".") {
      continue;
    }
    if (hrefParts[i] == "..") {
      baseParts.pop();
    } else {
      baseParts.push(hrefParts[i]);
    }
  }

  return baseParts.join("/");
}

/*
console.log("STUFF : " + document.body.scrollHeight + "  " + document.body.offsetHeight + "  "  + document.body.clientHeight + "  " + document.documentElement.scrollHeight + "  " + document.documentElement.offsetHeight + "  " + document.documentElement.clientHeight);
*/

function rspdsg___setOverflowStyle(hide) {
  hide = !!hide;
  if (hide === rspdsg___scrollbarsData.hide) {
    return;
  }

  if (hide) {
    // Since we made it here, this means it is not currently hidden.
    rspdsg___scrollbarsData.scrollHeight = document.body.scrollHeight;
  } else {
    rspdsg___scrollbarsData.scrollHeightHidden = document.body.scrollHeight;
  }

  var scrollYInitial = supportPageOffset ? window.pageYOffset :
                       isCSS1Compat ? document.documentElement.scrollTop :
                       document.body.scrollTop;

  rspdsg___styleSheet.innerHTML = "html { overflow: " + (hide ? "hidden" : "auto") + "; }";

  if (rspdsg___scrollbarsData.scrollHeight && rspdsg___scrollbarsData.scrollHeightHidden) {
    var ratio = (rspdsg___scrollbarsData.scrollHeight - window.innerHeight) /
                (rspdsg___scrollbarsData.scrollHeightHidden - window.innerHeight);
    if (hide) {
      ratio = 1 / ratio;
    }

    //window.scrollTo({ top: Math.round(scrollYInitial * ratio) });
    window.scrollTo(0, Math.round(scrollYInitial * ratio));
  }

  rspdsg___scrollbarsData.hide = hide;
}

function rspdsg___onMouseEvent(evt) {
  if (evt.type == "click") {
    if (evt.target.hasAttribute("welcomepagelink")) {
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    if (evt.target.hasAttribute("href") && evt.target.localName == "a") {
      if (window.parent != window) {
        window.parent.loadUrl(evt.target.getAttribute("href") );
      }
    }
    return;
  }

  if (evt.type == "mouseenter") {
    rspdsg___setOverflowStyle();
    return;
  }

  if (evt.altKey) {
    if (evt.type == "mousedown") {
      rspdsg___styleSheet.innerHTML += "body { cursor: grabbing; }\n";
      return;
    }
    if (evt.type == "mouseup") {
      rspdsg___styleSheet.innerHTML += "body { cursor: grab; }\n";
      return;
    }
    evt.preventDefault();
  }
}

function rspdsg___onKeyEvent(evt) {
  if (evt.keyCode == 18) {
    if (evt.type == "keydown") {
      rspdsg___styleSheet.innerHTML += "body { cursor: grab; }\n";
      return;
    }
    if (evt.type == "keyup") {
      rspdsg___styleSheet.innerHTML += "body { cursor: auto; }\n";
      return;
    }
  }
}

window.addEventListener("click", rspdsg___onMouseEvent, true);
window.addEventListener("keydown", rspdsg___onKeyEvent);

rspdsg___init();
