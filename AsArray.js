var util = require("util");
var Transform = require("stream").Transform;


function AsArray(options) {
	Transform.call(this, options);
	this._writableState.objectMode = true;
	this._readableState.objectMode = true;

	this._obj = [];
}
util.inherits(AsArray, Transform);

AsArray.prototype._transform = function(chunk, encoding, callback){
	if(chunk.name === "value"){
		this._obj.push(chunk.value);
	}else if(chunk.name === "endRow"){
		this.push(this._obj);
		this._obj = [];
	}
	callback();
};


module.exports = AsArray;
