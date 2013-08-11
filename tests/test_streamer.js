var ReadString = require("./ReadString");
var Parser = require("../Parser");
var Streamer = require("../Streamer");
var StreamPrinter = require("./StreamPrinter")


var input = '1||""|"""|"\r\n2|three|"four\r\n"|five\r\n';


var stream   = new ReadString(input);
var parser   = new Parser({separator: "|"});
var streamer = new Streamer();
var printer  = new StreamPrinter();

console.log(input);
stream.pipe(parser).pipe(streamer).pipe(printer);
