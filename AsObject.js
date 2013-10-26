var util = require("util");
var Transform = require("stream").Transform;


function AsObject(options) {
	Transform.call(this, options);
	this._writableState.objectMode = true;
	this._readableState.objectMode = true;

	this._inBody = false;
	this._header = [];
	this._obj = {};
}
util.inherits(AsObject, Transform);

AsObject.prototype._transform = function(chunk, encoding, callback){
	if(this._inBody){
		if(chunk.name === "value"){
			this._obj[this._header[chunk.col]] = chunk.value;
		}else if(chunk.name === "endRow"){
			this.push(this._obj);
			this._obj = {};
		}
	} else {
		if(chunk.name === "value"){
			this._header[chunk.col] = chunk.value;
		}else if(chunk.name === "endRow"){
			this._inBody = true;
		}
	}
	callback();
};


module.exports = AsObject;
