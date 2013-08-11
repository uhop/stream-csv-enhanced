var createSource = require("../main");
var ReadString = require("./ReadString");

var fs = require("fs"), path = require("path"), zlib = require("zlib");


var source = createSource();

var rows = 0, empties = 0, valuesWithCrLf = 0, valuesWithDoubleQuote = 0;

source.on("startRow", function(){ ++rows; });
source.on("value", function(value){
	if(value){
		if(/[\u000A\u000D]/.test(value)){
			++valuesWithCrLf;
		}
		if(/"/.test(value)){
			++valuesWithDoubleQuote;
		}
	}else{
		++empties;
	}
});

source.on("end", function(){
	console.log("rows:",             rows);
	console.log("empty values:",     empties);
	console.log("values with CRLF:", valuesWithCrLf);
	console.log("values with '\"':", valuesWithDoubleQuote);
});

fs.readFile(path.resolve(__dirname, "sample.csv.gz"), function(err, data){
	if(err){
		throw err;
	}
	zlib.gunzip(data, function(err, data){
		if(err){
			throw err;
		}
		new ReadString(data).pipe(source.input);
	});
});
