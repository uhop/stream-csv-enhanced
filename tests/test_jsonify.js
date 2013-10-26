var Jsonify = require('../Jsonify')
  , Parser = require('../Parser')
  , Streamer = require('../Streamer')
  , Packer = require('../Packer')
  , Readable = require('stream').Readable
  , assert = require('assert');

var csvdata = [
  ['a', 'b', 'c'],
  [1, 2, 3],
  [4, 5, 6],
  [null, 8, 9]
].map(function(x){return x.join(',')}).join('\n');

var expected = [
  { a: '1', b: '2', c: '3' },
  { a: '4', b: '5', c: '6' },
  { a: '', b: '8', c: '9' }
];

var parser = new Parser();
var streamer = new Streamer();
var packer = new Packer();
var jsonify = new Jsonify();

var rs = new Readable;
rs.push(csvdata);
rs.push(null);

var stream =  rs.pipe(parser)
  .pipe(streamer)
  .pipe(packer)
  .pipe(jsonify);

var cnt = 0;
stream.on('data', function(row){
  assert.deepEqual(row, expected[cnt++]);
});
stream.on('end', function(){
  console.log('test Jsonify ok.')
});
