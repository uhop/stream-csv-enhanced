var ReadString = require("./ReadString");
var Parser     = require("../Parser");
var Streamer   = require("../Streamer");
var Packer     = require("../Packer");
var AsObject   = require("../AsObject");
var assert     = require("assert");


var csvdata = [
	["a", "b", "c"],
	[1, 2, 3],
	[4, 5, 6],
	[null, 8, 9]
].map(function(x){ return x.join(","); }).join("\n");

var expected = [
	{a: "1", b: "2", c: "3"},
	{a: "4", b: "5", c: "6"},
	{a: "",  b: "8", c: "9"}
];


var stream   = new ReadString(csvdata);
var parser   = new Parser();
var streamer = new Streamer();
var packer   = new Packer();
var asObject  = new AsObject();

var output = stream.pipe(parser).pipe(streamer).
				pipe(packer).pipe(asObject);

var counter = 0;
output.on("data", function(row){
	assert.deepEqual(row, expected[counter++]);
});
output.on("end", function(){
	console.log("test AsObject ok.")
});
