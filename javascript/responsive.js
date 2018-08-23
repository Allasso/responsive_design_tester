var vpContainer;
var viewport;

var phoneTemplateContainer
var deviceTop;
var deviceSides;
var deviceBot;
var deviceLed;
var deviceMic;
var deviceBut;

var inputUrl;
var inputWidth;
var inputHeight;
var inputSizePhys;
var inputWidthPhys;
var dimsTips;

var inputRulerAdjust;
var ruler;
var rulerTips;

var controls_right;

var checkboxSimple;
var simpleTips;

var checkboxSpoofMobile;
var textareaUserAgent;
var checkboxOverwriteUA;
var injectUserAgentUI;

var inputFontSize;
var fontSizeTips;
var checkboxFontSizeAncestor;

var inputImageSize;
var imageSizeTips;

var messageUserAgent;

var footer;
var testprotocol;

var scaleStyleSheet;
var scaleDeviceStyleSheet;

var loadedDocuments = { local: false, remote: false };
var currentURL;
var simpleLoad;

var widToPxWorkstation;
var crntWidToPxDevice;
var initialPhysSize = 4.5;
var initialRulerSetting = 360;
var cookieId = "rdt_"

var _isNaN = Number.isNaN || isNaN;

function init() {
  vpContainer = document.getElementById("vp_container");
  viewport = document.getElementById("viewport_iframe");

  phoneTemplateContainer = document.getElementById("phone_template_container");
  inputUrl = document.getElementById("input_url");
  inputWidth = document.getElementById("input_width");
  inputHeight = document.getElementById("input_height");
  inputSizePhys = document.getElementById("input_size_phys");
  inputWidthPhys = document.getElementById("input_width_phys");
  dimsTips = document.getElementById("dims_tips_container");

  deviceTop = document.getElementById("device_top");
  deviceSides = document.getElementById("device_sides");
  deviceBot = document.getElementById("device_bot");
  deviceLed = document.getElementById("device_led");
  deviceMic = document.getElementById("device_mic");
  deviceBut = document.getElementById("device_but");

  footer = document.getElementById("footer");

  inputRulerAdjust = document.getElementById("input_ruler_adjust");
  ruler = document.getElementById("ruler");
  rulerTips = document.getElementById("ruler_tips_container");

  controlsRight = document.getElementById("controls_right");

  checkboxSimple = document.getElementById("checkbox_simple");
  simpleTips = document.getElementById("simple_tips_container");

  injectUserAgentUI = document.getElementById("inject_user_agent_ui_container");
  checkboxSpoofMobile = document.getElementById("checkbox_spoof_mobile");
  textareaUserAgent = document.getElementById("textarea_user_agent");
  checkboxOverwriteUA = document.getElementById("checkbox_overwrite_ua");

  inputFontSize = document.getElementById("input_font_size");
  checkboxFontSizeAncestor = document.getElementById("checkbox_font_size_ancestor");
  fontSizeTips = document.getElementById("font_size_tips_container");

  inputImageSize = document.getElementById("input_image_size");
  imageSizeTips = document.getElementById("image_size_tips_container");

  messageUserAgent = document.getElementById("message_user_agent");

  var rectVP = viewport.getBoundingClientRect();
  inputWidth.value = rectVP.width;
  inputHeight.value = rectVP.height;
  widToPxWorkstation = 3 /initialRulerSetting;

  var lastUrl = readCookie("lastUrl");

  var lastCheckboxSpoofMobileSetting = readCookie("lastCheckboxSpoofMobileSetting");
  var lastCheckboxOverwriteUASetting = readCookie("lastCheckboxOverwriteUASetting");
  var lastTextareaUserAgentSetting = readCookie("lastTextareaUserAgentSetting");

  var lastInputFontSizeSetting = readCookie("lastInputFontSizeSetting");
  var lastCheckboxFontSizeAncestorSetting = readCookie("lastCheckboxFontSizeAncestorSetting");
  var lastInputImageSizeSetting = readCookie("lastInputImageSizeSetting");

  var lastRulerSetting = readCookie("lastRulerSetting");

  inputUrl.value = lastUrl || "";

  checkboxSpoofMobile.checked = lastCheckboxSpoofMobileSetting == "checked" || false;
  checkboxOverwriteUA.checked = lastCheckboxOverwriteUASetting == "checked" || false;
  textareaUserAgent.value = lastTextareaUserAgentSetting || "";

  inputFontSize.value = lastInputFontSizeSetting || "";
  checkboxFontSizeAncestor.checked = lastCheckboxFontSizeAncestorSetting == "checked" || false;
  inputImageSize.value = lastInputImageSizeSetting || "";

  inputRulerAdjust.value = lastRulerSetting || initialRulerSetting;

  setRuler();

  scaleStyleSheet = document.createElement('style');
  document.body.appendChild(scaleStyleSheet);

  scaleDeviceStyleSheet = document.createElement('style');
  document.body.appendChild(scaleDeviceStyleSheet);

  testprotocol = document.getElementById("testprotocol");

  inputSizePhys.value = initialPhysSize;
  onInputDims({ id: "input_size_phys", value: initialPhysSize });

  document.body.addEventListener("mouseenter", onMouseEvent);
  document.body.addEventListener("mouseleave", onMouseEvent);
  vpContainer.addEventListener("mouseenter", onMouseEvent);
  vpContainer.addEventListener("mouseleave", onMouseEvent);

  loadedDocuments.local = true;

  setDynamicPositioning();

  onLoadAll();
}

function scaleViewport() {
  if (typeof(crntWidToPxDevice) != "number") {
    return;
  }

  var factor = crntWidToPxDevice / widToPxWorkstation;

  scaleStyleSheet.innerHTML = "#phone_template_container { -moz-transform: scale(" + factor + "); -moz-transform-origin: 0 0; -o-transform: scale(" + factor + "); -o-transform-origin: 0 0; -webkit-transform: scale(" + factor + "); -webkit-transform-origin: 0 0; transform: scale(" + factor + "); transform-origin: 0 0; }";

  var heightTop = deviceTop.getBoundingClientRect().height;
  // heightTop
  var vpTop = Math.round(heightTop * 130 / 140);

  var widthSides = deviceSides.getBoundingClientRect().width;
  // widthSides * side-width-nom / full-width-nom
  vpLeft = Math.round(widthSides * (30 / 500));

  scaleStyleSheet.innerHTML += "#vp_container { top: " + vpTop + "px !important; left: " + vpLeft + "px !important; }";

  scaleStyleSheet.innerHTML += "#vp_container { -moz-transform: scale(" + factor + "); -moz-transform-origin: 0 0; -o-transform: scale(" + factor + "); -o-transform-origin: 0 0; -webkit-transform: scale(" + factor + "); -webkit-transform-origin: 0 0; transform: scale(" + factor + "); transform-origin: 0 0; }";
}

function setViewportDims(noscale) {
  var validated = validateDims();
  var width = validated.width;
  var height = validated.height;

  if (width) {
    viewport.style.width = width + "px";
    vpContainer.style.width = width + "px";
  }
  if (height) {
    viewport.style.height = height + "px";
    vpContainer.style.height = height + "px";
  }

  if (width && height) {
    setDeviceDims(width, height);

    if (!noscale) {
      var size = parseFloat(inputSizePhys.value);

      if (size && !_isNaN(size) && size > 1) {
        var phDims = getPhysicalWidHt(size, width, height);
        crntWidToPxDevice = phDims.width / width;
        scaleViewport();
      }
    }
  } else {
    alert("You have entered invalid parameters\n\nOnly numbers are allowed");
  }

  setDynamicPositioning();
}

function setDeviceDims(width, height) {
  var arViewTop = 130 / 500;
  var arActualTop = 140 / 500;
  var arViewBot = 134 / 500;
  var arActualBot = 144 / 500;
  var diffActualLessView = 144 - 134;
  var widthSide = 30;
  var vpWidRatio = width / 440;

  // css params:

  var widthDevice = vpWidRatio * 500;
  var cssWidthDevice = Math.floor(widthDevice);

  var heightTop = Math.round(arActualTop * widthDevice);
  var heightBot = Math.round(arActualBot * widthDevice);
  var heightSides = height;

  var viewportX = Math.round(widthSide * vpWidRatio);
  var viewportY = Math.round(arViewTop * widthDevice);

  var botY = Math.round(viewportY + height - (diffActualLessView * vpWidRatio));

  scaleDeviceStyleSheet.innerHTML += "#device_top { width: " + cssWidthDevice + "px !important; height: " + heightTop + "px !important; }";
  scaleDeviceStyleSheet.innerHTML += "#device_sides { width: " + cssWidthDevice + "px !important; height: " + heightSides + "px !important; top: " + viewportY + "px !important; }";
  scaleDeviceStyleSheet.innerHTML += "#device_bot { width: " + cssWidthDevice + "px !important; height: " + heightBot + "px !important; top: " + botY + "px !important; }";
}

function validateDims() {
  var width = parseInt(inputWidth.value);
  var height = parseInt(inputHeight.value);

  if (!width || _isNaN(width) || width < 100) {
    width = 0;
  }
  if (!height || _isNaN(height) || height < 100) {
    height = 0;
  }
  return { width: width, height: height };
}

function getPhysicalWidHt(hyp, wid, ht) {
  var ratio = ht / wid;
  var factor = Math.sqrt(Math.pow(ratio, 2) + 1);
  var width = hyp / factor;
  var height = width * ratio;

  return { width: width, height: height };
}

function getPhysicalSize(widPh, wid, ht) {
  var ratio = ht / wid;
  var htPh = (ht / wid) * widPh;
  var size = Math.sqrt(Math.pow(widPh, 2) + Math.pow(htPh, 2));
  return size;
}

function setRuler(thumbwheel) {
  var rulerValue = parseInt(inputRulerAdjust.value);

  if (thumbwheel) {
    rulerValue = rulerValue + thumbwheel;
    inputRulerAdjust.value = rulerValue;
  }

  ruler.style.width = rulerValue + "px";
  scaleRuler(rulerValue);
  widToPxWorkstation = 3 / inputRulerAdjust.value;
  scaleViewport();

  setDynamicPositioning();
}

function scaleRuler(value) {
  value = Math.round(value * 100) / 100;
  ruler.setAttribute("width", value);

  var widthnom = ruler.getAttribute("widthnom");
  var scaleValue = value / parseInt(widthnom);
  scaleValue = Math.round(scaleValue * 100) / 100;

  var lines = ruler.getElementsByTagName("line");

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var xnom = line.getAttribute("xnom");
    var newVal = parseInt(xnom) * scaleValue;
    newVal = Math.round(newVal * 100) / 100;
    line.setAttribute("x1", newVal);
    line.setAttribute("x2", newVal);
  }

  var texts = ruler.getElementsByTagName("text");

  for (var i = 0; i < texts.length; i++) {
    var text = texts[i];
    var xnom = text.getAttribute("xnom");
    var newVal = parseInt(xnom) * scaleValue;
    newVal = Math.round(newVal);
    text.setAttribute("x", newVal);
  }
}

function loadUrl(url) {
  // Mainly for first time loadUrl after viewing welcome page, in the event that
  // the user has not yet called this.
  setViewportDims();

  if (url) {
    inputUrl.value = url
  } else {
    url = inputUrl.value;
  }

  if (url.indexOf("http") != 0) {
    testprotocol.href = "//" + url;
    url = testprotocol.href;
  }

  if (checkboxSimple.checked) {
    viewport.src = url;
    simpleLoad = true;
    return;
  }

  simpleLoad = false;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://kevinallasso.org/responsive/php/fetch_url.php?" + Date.now(), true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() {
    if(this.readyState == XMLHttpRequest.DONE) {
      if (this.status == 200) {
//console.log("success : " + this.responseText);
        viewport.src = "http://kevinallasso.org/responsive/files/fetched_url.html?" + Date.now();
        currentURL = url.trim();
      } else {
//console.log("failure : " + this.responseText);
      }
    }
  }

  var params = "fetch_url=" + url;
  if (checkboxSpoofMobile.checked) {
    params += "&spoof_mobile=true";
  }
  if (checkboxOverwriteUA.checked) {
    params += "&overwrite=true";
  }
  if (textareaUserAgent.value.trim()) {
    params += "&ua_string=" + textareaUserAgent.value.trim() + "";
  }

  xhr.send(params);
}

function shadeFieldWithInvalidValues(elem) {
  var isLogicalVal = elem.id == "input_width" || elem.id == "input_height";
  var val = isLogicalVal ? parseFloat(elem.value) : parseInt(elem.value);
  if (!val || _isNaN(val) || val < (isLogicalVal ? 100 : 1)) {
    elem.style.backgroundColor = "#ddd";
  } else {
    elem.style.backgroundColor = "#fff";
  }
}

function onInputDims(elem) {
  if (elem.localName) {
    shadeFieldWithInvalidValues(elem);
  }

  // If aspect ratio data is available and valid, sync physical size and
  // physical width.

  var setPhysWidth = elem.id == "input_size_phys";
  var setPhysSize = elem.id == "input_width_phys";

  var valPh;
  if (setPhysWidth || setPhysSize) {
    // We're changing a physical dimension, if it validates, set valPh to it.
    valPh = parseFloat(elem.value);
    if (!valPh || _isNaN(valPh) || valPh < 1) {
      return;
    }
  } else {
    // We're changing a logical dimension, see if either physical size or
    // physical width has a valid value in it (in that order), if so, set
    // valPh to that.  Set the flags appropriately.
    valPh = parseFloat(inputSizePhys.value);

    if (valPh && !_isNaN(valPh) && valPh > 0) {
      setPhysWidth = true;
    } else {
      valPh = parseFloat(inputWidthPhys.value);
      if (valPh && !_isNaN(valPh) && valPh > 0) {
        setPhysSize = true;
      } else {
        return;
      }
    }
  }

  // Get one or both remaining logical dimensions, and validate.
  var validated = validateDims();
  var width = validated.width;
  var height = validated.height;
  if (!width || !height) {
    return;
  }

  // We have everything we need now, synchronize physical dimension values.
  if (setPhysWidth) {
    var value = getPhysicalWidHt(valPh, width, height).width;
    inputWidthPhys.value = Math.round(value * 100) / 100;
    inputWidthPhys.style.backgroundColor = "#fff";
  } else if (setPhysSize) {
    var value = getPhysicalSize(valPh, width, height);
    inputSizePhys.value = Math.round(value * 100) / 100;
    inputSizePhys.style.backgroundColor = "#fff";
  }

  // Optional: set viewport dims as you type, but never on initialization
  // (when "elem" does not have a local name property.)
  if (elem.localName) {
    setViewportDims();
  }
}

function onLoadIframe() {
  loadedDocuments.remote = true;
  onLoadAll();
}

function onLoadAll() {
  var local = loadedDocuments.local;
  var remote = loadedDocuments.remote;
  if (!local || !remote) {
    return;
  }

  contentDocument = viewport.contentWindow.document;

  var styleElem = contentDocument.createElement("style");
  contentDocument.body.appendChild(styleElem);

  var scriptElem = contentDocument.createElement("script");
  scriptElem.src = "../javascript/remote.js?" + Date.now();
  contentDocument.body.appendChild(scriptElem);

  if (testprotocol.href.indexOf("rspdsgtestprotocolplaceholderhref") == -1) {
    messageUserAgent.innerHTML = "navigator.userAgent:<br />" +
      viewport.contentWindow.navigator.userAgent;
  }
}

function onWheel(evt) {
  if (evt.currentTarget != viewport.contentWindow) {
    return;
  }
}

function onDeviceSelect(select) {
  var screendims = select.options[select.selectedIndex].getAttribute("screendims");
  screendims = screendims.split("x");
  inputWidth.value = screendims[0];
  inputHeight.value = screendims[1];
  inputSizePhys.value = screendims[2];

  onInputDims(inputSizePhys);
}

function setDynamicPositioning() {
  var rect = vpContainer.getBoundingClientRect();

  var top = rect.height + 30;
  footer.style.top = top + "px";
  footer.style.display = "block";

  var left = rect.width + 15;
  controlsRight.style.left = left + "px";
  controlsRight.style.display = "block";
}

function setFontSize() {
  if (!viewport.contentWindow) {
    return;
  }

  var fontSize = parseFloat(inputFontSize.value);
  fontSize = Math.round(inputFontSize.value * 10) / 10;

  var selection = viewport.contentWindow.getSelection();

  // Probably nothing is selected.
  if (!selection.rangeCount) {
    return;
  }

  var range = selection.getRangeAt(0);
  selection.removeAllRanges();

  // Clean up any standing font modification.
  var changedNodes =
    viewport.contentWindow.document.getElementsByClassName("rspdsg___font_shift");
  var len = changedNodes.length;
  for (var i = 0; i < len; i++) {
    var node = changedNodes[0];
    var textNode = node.firstChild;
    var parent = node.parentNode;
    parent.insertBefore(textNode, node);
    parent.removeChild(node);
  }

  if (checkboxFontSizeAncestor.checked) {
    var node = range.commonAncestorContainer;
    if (node.nodeType != node.ELEMENT_NODE) {
      node = node.parentNode;
    }
    var nodeILStyle = node.getAttribute("style");
    var addedStyle = "font-size: " + fontSize + "px !important";
    var newILStyle = nodeILStyle ? nodeILStyle + "; " + addedStyle : addedStyle;
    node.setAttribute("style", newILStyle);
  } else {
    setFontSizeSelectedText(range, fontSize);
  }
}

function setFontSizeSelectedText(range, fontSize) {
  // Get the offset counting from the end backwards.
  var endEndset = range.endContainer.textContent.length - range.endOffset;

  var filter = { acceptNode: function() {
    return NodeFilter.FILTER_ACCEPT;
  }};

  // Ugly IE hack.  A true W3C-compliant nodeFilter object isn't passed,
  // and instead a "safe" one _based_ off of the real one.
  // Taken from SO.
  var safeFilter = filter.acceptNode;
  safeFilter.acceptNode = filter.acceptNode;

  var treeWalker = document.createTreeWalker(
    viewport.contentWindow.document.body,
    NodeFilter.SHOW_ALL,
    safeFilter,
    false
  );

  /*
  // This is how it should be...
  var treeWalker = document.createTreeWalker(
    viewport.contentWindow.document.body,
    NodeFilter.SHOW_ALL,
    { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } },
    false
  );
  */

  var nodeList = [];
  var recordNodes = false;

  while(treeWalker.nextNode()) {
    var node = treeWalker.currentNode;

    if (node == range.startContainer) {
      recordNodes = true;
    }
    if (recordNodes && node.nodeType == node.TEXT_NODE) {
      nodeList.push(node);
    }
    if (node == range.endContainer) {
      recordNodes = false;
      break;
    }
  }

  if (!nodeList.length) {
    return;
  }

  var startEndDiffer = nodeList.length > 1;
  if (range.startOffset > 0) {
    var firstNode = nodeList.shift();
    var seg2 = firstNode.splitText(range.startOffset);
    nodeList.unshift(seg2);
  }
  if (endEndset > 0) {
    var lastNode = nodeList.pop();
    var offset = lastNode.textContent.length - endEndset;
    lastNode.splitText(offset);
    nodeList.push(lastNode);
  }
  for (var i = 0; i < nodeList.length; i++) {
    var node = nodeList[i];
    var span = document.createElement("span");
    span.className = "rspdsg___font_shift";
    span.style.fontSize = fontSize + "px";
    node.parentNode.insertBefore(span, node);
    span.appendChild(node);
  }
}

function setImageSize() {
  if (!viewport.contentWindow) {
    return;
  }

  var imageSizeArr = inputImageSize.value.split(/[^0-9]+/);

  var selection = viewport.contentWindow.getSelection();

  // Probably nothing is selected.
  if (!selection.rangeCount) {
    return;
  }

  var range = selection.getRangeAt(0);

  var node = range.commonAncestorContainer;
  if (node.localName != "img") {
    var node = node.getElementsByTagName("img")[0];
  }

  var nodeILStyle = node.getAttribute("style");
  var addedStyle = "width: " + imageSizeArr[0] + "px !important; height: " + imageSizeArr[1] + "px !important";
  var newILStyle = nodeILStyle ? nodeILStyle + "; " + addedStyle : addedStyle;
  node.setAttribute("style", newILStyle);
}

function readCookie(name) {
  var cookieValue = 0
  var nameEQ = cookieId + name+"=";
  var cookieArray = document.cookie.split(';');
  for (var i = 0; i < cookieArray.length; i++){
    var cookieString = cookieArray[i];
    var cookieString = cookieString.replace(/^ +/, '');
    if (cookieString.indexOf(nameEQ) == 0){
      cookieValue = cookieString.substring(nameEQ.length, cookieString.length);
    }
  }
  return cookieValue;
}

function writeCookie(topic, value) {
  var date = new Date();
  date.setDate(date.getDate()+(90));
  var expires = date.toGMTString();

  document.cookie = cookieId + topic + "=" + value + "; expires="+expires+"; path=/";
}

function onBeforeunload(evt) {
  writeCookie("lastUrl", inputUrl.value);

  writeCookie("lastCheckboxSpoofMobileSetting", checkboxSpoofMobile.checked ? "checked" : "");
  writeCookie("lastCheckboxOverwriteUASetting", checkboxOverwriteUA.checked ? "checked" : "");
  writeCookie("lastTextareaUserAgentSetting", textareaUserAgent.value);

  writeCookie("lastRulerSetting", inputRulerAdjust.value);
  writeCookie("lastInputFontSizeSetting", inputFontSize.value);
  writeCookie("lastCheckboxFontSizeAncestorSetting", checkboxFontSizeAncestor.checked ? "checked" : "");
  writeCookie("lastInputImageSizeSetting", inputImageSize.value);
}

function onMouseEvent(evt) {
  if ((evt.type == "mouseenter" || evt.type == "mouseleave")
       && viewport.contentWindow
       && viewport.contentWindow.rspdsg___setOverflowStyle
       ) {
    viewport.contentWindow.rspdsg___setOverflowStyle(true);
  }
}

function onKeydown(evt, elem) {
  if (evt.keyCode == 13) {
    if (elem.id == "input_width" || elem.id == "input_height" || elem.id == "input_size_phys") {
      onInputDims(elem);
      return;
    }
    if (elem.id == "input_url") {
      loadUrl();
      return;
    }
    if (elem.id == "input_ruler_adjust") {
      setRuler();
      return;
    }
    if (elem.id == "input_font_size") {
      setFontSize();
      return;
    }
    if (elem.id == "input_image_size") {
      setImageSize();
      return;
    }
  }
}

window.addEventListener("load", init);
window.addEventListener("beforeunload", onBeforeunload);
window.addEventListener("click", onMouseEvent, true);
