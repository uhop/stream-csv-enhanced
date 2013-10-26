var Transform = require('stream').Transform
  , util = require('util');

function Ldjsoner(options) {
  if (!(this instanceof Ldjsoner))
    return new Ldjsoner(options);

  options = options || {};
  options.objectMode = true;

  Transform.call(this, options);

  this._inBody = false;
  this._header = [];
  this._obj = {};
}

util.inherits(Ldjsoner, Transform);

Ldjsoner.prototype._transform = function(chunk, encoding, done) {

  if(!this._inBody){

    if(chunk.name === 'value'){
      this._header[chunk.col-1] = chunk.value; //why index (chunk.col) are 1-based instead of 0-based ???
    } else if(chunk.name === 'endRow'){
      this._inBody = true;
    }
    
  } else {
    
    if(chunk.name === 'value'){
      this._obj[this._header[chunk.col-1]] = chunk.value; //why index (chunk.col) are 1-based instead of 0-based ???
    } else if(chunk.name === 'endRow'){
      this.push(this._obj);
    }
  }

  done();
};

module.exports = Ldjsoner;
