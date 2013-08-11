var ReadString = require("./ReadString");
var Parser = require("../Parser");
var Streamer = require("../Streamer");
var Packer = require("../Packer");
var StreamPrinter = require("./StreamPrinter")


var input = '1\t\t""\t"""\t"\r\n2\tthree\t"four"\tfive\r\n';


var stream   = new ReadString(input);
var parser   = new Parser({separator: "\t"});
var streamer = new Streamer();
var packer   = new Packer();
var printer  = new StreamPrinter();

console.log(input);
stream.pipe(parser).pipe(streamer).pipe(packer).pipe(printer);
