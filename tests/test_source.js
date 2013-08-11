var Source   = require("../Source");
var Parser   = require("../Parser");
var Streamer = require("../Streamer");

var fs = require("fs"), path = require("path"), zlib = require("zlib");


var source = new Source([new Parser(), new Streamer()]);

var rows = 0, values = 0;

source.on("startRow", function(){ ++rows; });
source.on("startValue", function(){ ++values; });

source.on("end", function(){
	console.log("rows:",   rows);
	console.log("values:", values);
});

fs.createReadStream(path.resolve(__dirname, "sample.csv.gz")).
	pipe(zlib.createGunzip()).pipe(source.input);
