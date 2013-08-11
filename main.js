var Parser   = require("./Parser");
var Streamer = require("./Streamer");
var Packer   = require("./Packer");
var Source   = require("./Source");


function createSource(options){
	var streams = [new Parser(options), new Streamer(options)];
	if(options && ("packValues" in options)){
		if(options.packValues){
			streams.push(new Packer(options));
		}
	}else{
		var o = options ? Object.create(options) : {};
		o.packValues = true;
		streams.push(new Packer(o));
	}
	return new Source(streams);
}


module.exports = createSource;
