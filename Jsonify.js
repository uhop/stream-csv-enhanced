var Transform = require('stream').Transform
  , util = require('util');

function Jsonify(options) {
  if (!(this instanceof Jsonify))
    return new Jsonify(options);

  options = options || {};
  options.objectMode = true;

  Transform.call(this, options);

  this._inBody = false;
  this._header = [];
  this._obj = {};
}

util.inherits(Jsonify, Transform);

Jsonify.prototype._transform = function(chunk, encoding, done) {

  if(!this._inBody){

    if(chunk.name === 'value'){
      this._header[chunk.col-1] = chunk.value; //parser uses 1-based index
    } else if(chunk.name === 'endRow'){
      this._inBody = true;
    }
    
  } else {
    
    if(chunk.name === 'value'){
      this._obj[this._header[chunk.col-1]] = chunk.value;
    } else if(chunk.name === 'endRow'){
      this.push(this._obj);
    }
  }

  done();
};

module.exports = Jsonify;
