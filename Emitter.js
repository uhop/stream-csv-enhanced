var util = require("util");
var Writable = require("stream").Writable;


function Emitter(options){
	Writable.call(this, options);
	this._writableState.objectMode = true;
}
util.inherits(Emitter, Writable);

Emitter.prototype._write = function write(chunk, encoding, callback){
	if("value" in chunk){
		this.emit(chunk.name, chunk.value, chunk.row, chunk.col);
	}else{
		this.emit(chunk.name, chunk.row, chunk.col);
	}
	callback();
};


module.exports = Emitter;
