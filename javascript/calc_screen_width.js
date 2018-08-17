var hyp = process.argv[2];
var l1 = process.argv[3];
var l2 = process.argv[4];

var ratio = l2 / l1;
var factor = Math.sqrt(Math.pow(ratio, 2) + 1);
var a = hyp / factor;
var b = a * ratio;

console.log(a + " " + b);
