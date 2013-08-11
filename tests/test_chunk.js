var createSource = require("../main");
var ReadString = require("./ReadString");

var fs = require("fs"), path = require("path");


var source = createSource();

var rows = 0, emptyValues = 0, valuesWithCrLf = 0, valuesWithDoubleQuote = 0;

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
		++emptyValues;
	}
});

source.on("end", function(){
	console.log("rows:",             rows);
	console.log("empty values:",     emptyValues);
	console.log("values with CRLF:", valuesWithCrLf);
	console.log("values with '\"':", valuesWithDoubleQuote);
});

fs.readFile(path.resolve(__dirname, "sample.csv"), "utf8", function(err, data){
	if(err){
		throw err;
	}
	new ReadString(data).pipe(source.input);
});
