var ReadString = require("./ReadString");
var Parser = require("../Parser");
var TokenPrinter = require("./TokenPrinter")


var input = '1,,"",""""\r\n2,three,"four",five\r\n';


var stream = new ReadString(input);
var parser = new Parser();
var tokens = new TokenPrinter();

console.log(input);
stream.pipe(parser).pipe(tokens);
