var ReadString = require("./ReadString");
var Parser     = require("../Parser");
var Streamer   = require("../Streamer");
var Packer     = require("../Packer");
var AsArray   = require("../AsArray");
var assert     = require("assert");


var csvdata = [
	["a", "b", "c"],
	[1, 2, 3],
	[4, 5, 6],
	[null, 8, 9]
].map(function(x){ return x.join(","); }).join("\n");

var expected = [
	["a", "b", "c"],
	["1", "2", "3"],
	["4", "5", "6"],
	["",  "8", "9"]
];


var stream   = new ReadString(csvdata);
var parser   = new Parser();
var streamer = new Streamer();
var packer   = new Packer();
var asArray  = new AsArray();

var output = stream.pipe(parser).pipe(streamer).
				pipe(packer).pipe(asArray);

var counter = 0;
output.on("data", function(row){
	assert.deepEqual(row, expected[counter++]);
});
output.on("end", function(){
	console.log("test AsArray ok.")
});
