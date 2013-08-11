var createSource = require("../main");

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

fs.createReadStream(path.resolve(__dirname, "sample.csv")).pipe(source.input);
