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

  controlsRight = document.getElementById("controls_right");
  checkboxSimple = document.getElementById("checkbox_simple");

  inputRulerAdjust = document.getElementById("input_ruler_adjust");
  ruler = document.getElementById("ruler");
  rulerTips = document.getElementById("ruler_tips_container");

  simpleTips = document.getElementById("simple_tips_container");

  var rectVP = viewport.getBoundingClientRect();
  inputWidth.value = rectVP.width;
  inputHeight.value = rectVP.height;
  widToPxWorkstation = 3 /initialRulerSetting;

  var lastUrl = readCookie("lastUrl");
  var lastRulerSetting = readCookie("lastRulerSetting");

  inputUrl.value = lastUrl || "";
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
  document.body.addEventListener("click", onMouseEvent);
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

  //Send the proper header information along with the request
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
  xhr.send("fetch_url=" + url);
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
  //styleElem.innerHTML = "html { overflow: hidden; }\nhtml:hover { overflow: auto; }";
  //styleElem.innerHTML = "html { overflow: hidden; }";
  contentDocument.body.appendChild(styleElem);

  var scriptElem = contentDocument.createElement("script");
  scriptElem.src = "../javascript/remote.js?" + Date.now();
  contentDocument.body.appendChild(scriptElem);
}

function onWheel(evt) {
  if (evt.currentTarget != viewport.contentWindow) {
    return;
  }
  //viewport.contentWindow.scrollBy(evt.deltaX, evt.deltaY);
  //window.scrollBy(0, -10);
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
  writeCookie("lastRulerSetting", inputRulerAdjust.value);
}

function onMouseEvent(evt) {
  if ((evt.type == "mouseenter" || evt.type == "mouseleave")
       && viewport.contentWindow
       && viewport.contentWindow.rspdsg___setOverflowStyle
       ) {
    viewport.contentWindow.rspdsg___setOverflowStyle(true);
  }
}

window.addEventListener("load", init);
window.addEventListener("beforeunload", onBeforeunload);
