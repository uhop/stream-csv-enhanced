var util = require("util");
var EventEmitter = require("events").EventEmitter;


function Source(streams){
	EventEmitter.call(this);

	if(!(streams instanceof Array) || !streams.length){
		throw Error("Source's argument should be a non-empty array.");
	}

	// connect pipes
	var input = this.input = streams[0], output = input;
	streams.forEach(function(stream, index){
		if(index){
			output = output.pipe(stream);
		}
	});
	this.output = output;

	// connect events
	var self = this;
	output.on("data", function(item){
		if("value" in item){
			self.emit(item.name, item.value, item.row, item.col);
		}else{
			self.emit(item.name, item.row, item.col);
		}
	});
	output.on("end", function(){
		self.emit("end");
	});
}
util.inherits(Source, EventEmitter);


module.exports = Source;
