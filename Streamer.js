var util = require("util");
var Transform = require("stream").Transform;


function Streamer(options){
	Transform.call(this, options);
	this._writableState.objectMode = true;
	this._readableState.objectMode = true;

	this._newRowExpected = true;
	this._newValueExpected = true;
	this._row = 1;
	this._col = 1;
	this._escapedValue = false;
}
util.inherits(Streamer, Transform);

var dquote = {id: "\"\"", value: "\""};

Streamer.prototype._transform = function transform(chunk, encoding, callback){
	if(this._newRowExpected){
		this.push({name: "startRow", row: this._row});
		this._newRowExpected = false;
		this._newValueExpected = true;
	}
	out: {
		switch(chunk.id){
			case "crlf":
				if(this._escapedValue){
					break;
				}
				if(this._newValueExpected){
					this.push({name: "startValue", row: this._row, col: this._col});
				}
				this.push({name: "endValue", row: this._row, col: this._col++});
				this.push({name: "endRow", row: this._row++});
				this._newRowExpected = this._newValueExpected = true;
				this._col = 1;
				break out;
			case "\"":
				this._escapedValue = !this._escapedValue;
				break out;
			case "text":
				break;
			case "\"\"":
				chunk = dquote;
				break;
			case "sep":
				if(this._escapedValue){
					break;
				}
				if(this._newValueExpected){
					this.push({name: "startValue", row: this._row, col: this._col});
				}
				this.push({name: "endValue", row: this._row, col: this._col++});
				this._newValueExpected = true;
				break out;
		}
		if(this._newValueExpected){
			this.push({name: "startValue", row: this._row, col: this._col});
			this._newValueExpected = false;
		}
		this.push({name: "chunk", value: chunk.value, row: this._row, col: this._col});
	}
	callback();
};

Streamer.prototype._flush = function flush(callback){
	if(!this._newValueExpected){
		this.push({name: "endValue", row: this._row, col: this._col});
	}
	if(!this._newRowExpected){
		this.push({name: "endRow", row: this._row});
	}
	callback();
};


module.exports = Streamer;
