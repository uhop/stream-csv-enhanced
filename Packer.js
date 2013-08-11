var util = require("util");
var Transform = require("stream").Transform;


function Packer(options){
	Transform.call(this, options);
	this._writableState.objectMode = true;
	this._readableState.objectMode = true;

	this._eventMap = {};
	this._buffer   = "";

	this._eventMap.startValue = "_collectValue";
	this._eventMap.endValue   = "_sendValue";
}
util.inherits(Packer, Transform);

Packer.prototype._transform = function transform(chunk, encoding, callback){
	this.push(chunk);
	if(this._eventMap[chunk.name]){
		this[this._eventMap[chunk.name]](chunk);
	}
	callback();
};

Packer.prototype._addToBuffer = function addToBuffer(chunk){
	this._buffer += chunk.value;
};

Packer.prototype._collectValue = function collectValue(){
	this._eventMap.chunk = "_addToBuffer";
};

Packer.prototype._sendValue = function sendValue(chunk){
	this.push({name: "value", value: this._buffer, row: chunk.row, col: chunk.col});
	this._buffer = "";
	this._eventMap.chunk = null;
};


module.exports = Packer;
