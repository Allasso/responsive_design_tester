var ruler;

function init() {
console.log("init");
  ruler = document.getElementById("ruler_svg");

}

function scaleRuler({ value }) {
  var str = "";

  value = Math.round(value * 100) / 100;
  ruler.setAttribute("width", value);

  var widthnom = ruler.getAttribute("widthnom");
  var scaleValue = value / parseInt(widthnom);
console.log("value " + value + "    scaleValue " + scaleValue);
  scaleValue = Math.round(scaleValue * 100) / 100;
  str += widthnom + " " + scaleValue + ", ";

  var lines = ruler.getElementsByTagName("line");

  for (var line of lines) {
    var xnom = line.getAttribute("xnom");
    var newVal = parseInt(xnom) * scaleValue;
    newVal = Math.round(newVal * 100) / 100;
    str += xnom + " " + newVal + ", ";
    line.setAttribute("x1", newVal);
    line.setAttribute("x2", newVal);
  }

  var texts = ruler.getElementsByTagName("text");

  for (var text of texts) {
    var xnom = text.getAttribute("xnom");
    var newVal = parseInt(xnom) * scaleValue;
    newVal = Math.round(newVal * 100) / 100;
    str += xnom + " " + newVal + ", ";
    text.setAttribute("x1", newVal);
    text.setAttribute("x2", newVal);
  }
console.log("scaleRuler " + str);
}

window.addEventListener("load", init);
