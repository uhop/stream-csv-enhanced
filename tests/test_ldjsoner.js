var Ldjsoner = require('../Ldjsoner')
  , Parser = require('../Parser')
  , Streamer = require('../Streamer')
  , Packer = require('../Packer')
  , fs = require('fs')
  , assert = require('assert')
  , path = require('path');

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

var tpath = path.join(path.dirname(__filename), 'data_test_ldjsoner.csv');

fs.writeFileSync(tpath, csvdata);

var parser = new Parser();
var streamer = new Streamer();
var packer = new Packer();
var ldjsoner = new Ldjsoner();

var stream =  fs.createReadStream(tpath)
  .pipe(parser)
  .pipe(streamer)
  .pipe(packer)
  .pipe(ldjsoner);

var cnt = 0;
stream.on('data', function(row){
  assert.deepEqual(row, expected[cnt++]);
});
stream.on('end', function(){
  fs.unlinkSync(tpath);
  console.log('test Ldjsoner ok.')
});
