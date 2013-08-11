var util = require("util");
var Transform = require("stream").Transform;


function Filter(options){
	Transform.call(this, options);
	this._writableState.objectMode = true;
	this._readableState.objectMode = true;

	var f = options.filter;
	if(typeof f == "function"){
		this._func = f;
	}else{
		this._func = this._allowAll;
	}

	this._skipRow   = false;
	this._skipValue = false;
}
util.inherits(Filter, Transform);

Filter.prototype._transform = function transform(chunk, encoding, callback){
	out: {
		if(this._skipRow){
			if(chunk.name === "endRow"){
				this._skipRow = false;
			}
			break out;
		}
		if(this._skipValue){
			if(chunk.name === "endValue"){
				this._skipValue = false;
			}
			break out;
		}
		switch(chunk.name){
			case "startRow":
				if(this._func(chunk)){
					break;
				}
				this._skipRow = true;
				break out;
			case "startValue":
				if(this._func(chunk)){
					break;
				}
				this._skipValue = true;
				break out;
			case "value":
				if(this._func(chunk)){
					break;
				}
				break out;
		}
		this.push(chunk);
	}
	callback();
};

Filter.prototype._flush = function flush(callback){
	callback();
}

Filter.prototype._allowAll = function allowAll(){
	return true;
};


module.exports = Filter;
