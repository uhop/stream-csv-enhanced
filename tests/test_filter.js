var ReadString = require("./ReadString");
var Parser = require("../Parser");
var Streamer = require("../Streamer");
var Filter = require("../Filter");
var StreamPrinter = require("./StreamPrinter")


var input = '1,,"",""""\r\n2,three,"four",five\r\n';


var stream   = new ReadString(input);
var parser   = new Parser();
var streamer = new Streamer();
var filter   = new Filter({filter: filterFunc});
var printer  = new StreamPrinter();

console.log(input);
stream.pipe(parser).pipe(streamer).pipe(filter).pipe(printer);

function filterFunc(event){
	return event.name === "startRow" && event.row % 2 === 0 ||
			event.name === "startValue" && event.col % 2;
}
