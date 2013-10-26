# stream-csv-enhanced [![Build Status](https://secure.travis-ci.org/uhop/stream-csv-enhanced.png?branch=master)](http://travis-ci.org/uhop/stream-csv-enhanced)

`stream-csv-enhanced` is a collection of node.js 0.10 stream components for creating custom standard-compliant CSV processors, which requires a minimal memory footprint. It can parse CSV files far exceeding available memory. Even individual data items are streamed piece-wise. Streaming SAX-inspired event-based API is included as well.

The CSV parser is conformant to [RFC 4180: Common Format and MIME Type for Comma-Separated Values (CSV) Files](http://tools.ietf.org/html/rfc4180). It uses a relaxed row separation (CR, LF, or CRLF are allowed), and a user-specified field separator (a comma by default). It implements all standard features including quoted values with CRLF and field separators inside.

Available components:

* Streaming JSON `Parser` based on [parser-toolkit](http://github.com/uhop/parser-toolkit).
* `Streamer`, which converts tokens into SAX-like event stream.
* `Packer`, which can assemble values from individual chunks. It is useful, when user knows that individual data items can fit the available memory. Overall, it makes the API simpler.
* `Filter`, which is a flexible tool to select only important rows, or columns, using a function.
* `Emitter`, which converts an event stream into events by bridging `stream.Writable` with `EventEmitter`.
* `Source`, which is a helper that connects streams using `pipe()` and converts an event stream on the end of pipe into events, similar to `Emitter`.

Additionally a helper function is available in the main file, which creates a `Source` object with a default set of stream components.

This toolkit is distributed under New BSD license.

See the full documentation below.

## Introduction

The simplest example (streaming from a file):

```js
var createSource = require("stream-csv-enhanced");

var fs = require("fs");

var source = createSource();

var rows = 0;

source.on("startRow", function(){ ++rows; });

source.on("end", function(){
    console.log("Found ", rows, " rows.");
});

fs.createReadStream("sample.csv").pipe(source.input);

```

## Installation

```
npm install stream-csv-enhanced
```

## Documentation

### Parser

This is the workhorse of the package. It is a transform stream, which consumes text, and produces a stream of tokens. It is always the first in a pipe chain being directly fed with a text from a file, a socket, the standard input, or any other text stream.

Its `Writeable` part operates in a buffer mode, while its `Readable` part operates in an [objectMode](http://nodejs.org/api/stream.html#stream_object_mode).

```js
var Parser = require("stream-csv-enhanced/Parser");
var parser = new Parser(options);

// Example of use:
var next = fs.createReadStream(fname).pipe(parser);
```

`options` can contain some technical parameters, and it rarely needs to be specified. You can find it thoroughly documented in [node.js' Stream documentation](http://nodejs.org/api/stream.html). Additionally it recognizes following properties:

* `separator` is a one-character string, which is used to separate values in a row. By default it is `,` (a comma).

The test file for `Parser` can be found in `tests/test_parser.js`. Actually all test files in `tests/` use `Parser`.

### Streamer

`Streamer` is a transform stream, which consumes a stream of tokens, and produces a stream of events. It is always the second in a pipe chain after the `Parser`. It knows CSV semantics and produces actionable events.

It operates in an [objectMode](http://nodejs.org/api/stream.html#stream_object_mode).

```js
var Streamer = require("stream-csv-enhanced/Streamer");
var streamer = new Streamer(options);

// Example of use:
var next = fs.createReadStream(fname).
                pipe(parser).pipe(streamer);
```

`options` can contain some technical parameters, and it rarely needs to be specified. You can find it thoroughly documented in [node.js' Stream documentation](http://nodejs.org/api/stream.html).

Following is a list of all event objects produced by `Streamer`:

```js
{name: "startRow", row: aRowNumber};
{name: "endRow", row: aRowNumber};

{name: "startValue", row: aRowNumber, col: aColumnNumber};
{name: "chunk", value: "actual string value",
    row: aRowNumber, col: aColumnNumber};
{name: "endValue", row: aRowNumber, col: aColumnNumber};

```

`aRowNumber` is a 1-based row number. `aColumnNumber` is a 1-based column number within a row.

The event stream is well-formed:

* All `startXXX` are balanced with `endXXX`.
* Between `startValue` and `endValue` can be zero or more `chunk` events. No other event are allowed.

The test file for `Streamer` can be found in `tests/test_streamer.js`.

### Packer

`Packer` is a transform stream, which passes through a stream of events, assembles values from chunks, and adds new events with assembled values. It is a companion  for `Streamer`, which frees users from implementing the assembling logic, when it is known that values will fit in the available memory.

It operates in an [objectMode](http://nodejs.org/api/stream.html#stream_object_mode).

```js
var Packer = require("stream-csv-enhanced/Packer");
var packer = new Packer(options);

// Example of use:
var next = fs.createReadStream(fname).
                pipe(parser).pipe(streamer).pipe(packer);
```

`options` can contain some technical parameters, and it rarely needs to be specified. You can find it thoroughly documented in [node.js' Stream documentation](http://nodejs.org/api/stream.html).

`Packer` generates a new event, which passes an assembled value:

```js
{name: "value", value: "assembled string value",
    row: aRowNumber, col: aColumnNumber}
```

`value` event always follows `endValue`.

### AsObject

`AsObject` is a transform stream (operating in [objectMode](http://nodejs.org/api/stream.html#stream_object_mode)) that can be used after `Packer` to transform a row data into an object key-value bag.

This helper assumes that the very first row is a header row, which values are used as names of corresponding columns. The header values are not emitted.

```js
var AsObject = require("stream-csv-enhanced/AsObject")

var asObject = new AsObject(options);

var next = fs.createReadStream(fname).
                pipe(parser).pipe(streamer).
                pipe(packer).pipe(asObject);
```

Emitted objects correspond to CSV rows and are of the form:

```js
{"header1": "value1", "header2": "value2", "header3": "value3"}
```

### AsArray

`AsArray` is a transform stream (operating in [objectMode](http://nodejs.org/api/stream.html#stream_object_mode)) that can be used after `Packer` to transform a row data into an array.

```js
var AsArray = require("stream-csv-enhanced/AsArray")

var asArray = new AsArray(options);

var next = fs.createReadStream(fname).
                pipe(parser).pipe(streamer).
                pipe(packer).pipe(asArray);
```

Emitted objects correspond to CSV rows and are of the form:

```js
["value1", "value2", "value3"]
```

### Emitter

`Emitter` is a writeable stream, which consumes a stream of events, and emits them on itself.

It operates in an [objectMode](http://nodejs.org/api/stream.html#stream_object_mode).

```js
var Emitter = require("stream-csv-enhanced/Emitter");
var emitter = new Emitter(options);

// Example of use:

emitter.on("startRow", function(){
    console.log("row!");
});
emitter.on("value", function(value){
    console.log("value:", value);
});

fs.createReadStream(fname).
    pipe(parser).pipe(streamer).pipe(packer).pipe(emitter);
```

`options` can contain some technical parameters, and it rarely needs to be specified. You can find it thoroughly documented in [node.js' Stream documentation](http://nodejs.org/api/stream.html).

`startRow` and `endRow` receive one paramer: `row`. `startValue` and `endValue` receive two parameters: `row` and `col`. `chunk` and `value` receive three parameters: `value`, `row`, and `col`.

### Filter

`Filter` is an advance selector for rows and columns from a stream of events.

It operates in an [objectMode](http://nodejs.org/api/stream.html#stream_object_mode).

```js
var Filter = require("stream-csv-enhanced/Filter");
var filter = new Filter(options);

// Example of use:
var next = fs.createReadStream(fname).
                pipe(parser).pipe(streamer).pipe(filter);
```

`options` contains some important parameters, and should be specified. It can contain some technical properties thoroughly documented in [node.js' Stream documentation](http://nodejs.org/api/stream.html). Additionally it recognizes following properties:

* `filter` should be a function. By default it allows all events.
  * This function is called in a context of a `Filter` object with one parameter:
    * `event` is an event object described above.
  The function should return a Boolean value, with `true` indicating that we are interested in this object (row or value), and it should be passed through.

`Filter` produces a well-formed event stream.

The test file for `Filter` can be found in `tests/test_filter.js`.

### Source

`Source` is a convenience object. It connects individual streams with pipes, and attaches itself to the end emitting all events on itself (just like `Emitter`).

```js
var Source = require("stream-csv-enhanced/Source");
var source = new Source([parser, streamer, packer]);

// Example of use:

source.on("startRow", function(){
    console.log("row!");
});
source.on("value", function(value){
    console.log("value:", value);
});

fs.createReadStream(fname).pipe(source.input);
```

The constructor of `Source` accepts one mandatory parameter:

* `streams` should be a non-empty array of pipeable streams. At the end the last stream should produce a stream of events.

`Source` uses the same event arguments as `Emitter` (see above). When a stream ends, `Source` produces an event `end` without parameters.

The test file for `Source` can be found in `tests/test_source.js`.

### main: createSource()

The main file contains a helper function, which creates a commonly used configuration of streams, and returns a `Source` object.

```js
var createSource = require("stream-json");
var source = createSource(options);

// Example of use:

source.on("startRow", function(){
    console.log("row!");
});
source.on("value", function(value){
    console.log("value:", value);
});

fs.createReadStream(fname).pipe(source.input);
```

`options` can contain some technical parameters, and it is completely optional. You can find it thoroughly documented in [node.js' Stream documentation](http://nodejs.org/api/stream.html), and here. It is passed to `Parser`, `Streamer`, and `Packer`, so user can specify `options` documented for those objects.

Algorithm:

1. `createSource()` creates instances of `Parser` and `Streamer`, and pipes them one after another.
2. Then it checks if `packValues` is specified in options.
   1. If it is `true`, a `Packer` instance is created with `options`, and added to the pipe.
   2. If it is unspecified, a `Packer` is created and added.
   3. If it is specified, yet it is `false`, `Packer` is not added.

The most common use case is to call `createSource()` without parametrs. In this case instances of `Parser`, `Streamer`, and `Packer` are piped together. This scenario assumes that all values can be kept in memory, so user can use simplified event `value`.

The test files for `Source` are `tests/test_main.js`, and `tests/test_chunk.js`.

## Advanced use

The whole library is organized as set of small components, which can be combined to produce the most effective pipeline. All components are based on node.js 0.10 [streams](http://nodejs.org/api/stream.html), and [events](http://nodejs.org/api/events.html). It is easy to add your own components to solve your unique tasks.

The code of all components are compact and simple. Please take a look at their source code to see how things are implemented, so you can produce your own components in no time.

Obviously, if a bug is found, or a way to simplify existing components, or new generic components are created, which can be reused in a variety of projects, don't hesitate to open a ticket, and/or create a pull request.

## Credits

The test file `tests/sample.csv.gz` is `Master.csv` from [Lahman’s Baseball Database 2012](http://seanlahman.com/baseball-archive/statistics/). The file is copyrighted by Sean Lahman. It is used here under a Creative Commons Attribution-ShareAlike 3.0 Unported License. In order to test all features of the CSV parser, the file was minimally modified: row #1000 has a CRLF inserted in a value, row #1001 has a double quote inserted in a value, then the file was compressed by gzip.

## Apendix A: tokens

`Parser` produces a stream of tokens cortesy of [parser-toolkit](http://github.com/uhop/parser-toolkit). While normally user should use `Streamer` to convert them to a much simpler CSV-aware event stream, in some cases it can be advantageous to deal with raw tokens.

Each token is an object with following properties:

* `id` is a string, which uniquely identifies a token.
* `value` is a string, which corresponds to this token, and was actually matched.
* `line` is a line number, where this token was found. All lines are counted from 1.
* `pos` is a position number inside a line (in characters, so `\t` is one character). Position is counted from 1.

CSV grammar is defined in `Grammar.js`. It is taken almost verbatim from [RFC 4180: Common Format and MIME Type for Comma-Separated Values (CSV) Files](http://tools.ietf.org/html/rfc4180).

Following tokens are produced (listed by `id`):

* `sep`: a user-specified field separator, or a part of a quoted value.
* `crlf`: CR, LF, or CRLF sequence of characters used to separate rows, or inside of a quoted value.
* `text`: a string of non-escaped characters, used inside a value.
* `"`: a double quote, used to open and close a quoted value.
* `""`: a doubled double quote, used to encode a single double quote in a quoted value.
