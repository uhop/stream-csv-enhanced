/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["parser-toolkit/topDown/Grammar"], function(Grammar){
	"use strict";

	var rule = Grammar.rule, any = Grammar.any, maybe = Grammar.maybe, repeat = Grammar.repeat;

	var crlf = {id: "crlf", pattern: /\u000A|\u000D\u000A|\u000D/};

	function createCsvGrammar(separator){
		separator = separator || ",";

		var sanitizedSeparator = separator instanceof RegExp ?
				separator.source : separator.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");

		var sep  = {id: "sep",  pattern: new RegExp(sanitizedSeparator)},
			text = {id: "text", pattern:
				new RegExp("[^" + sanitizedSeparator + "\\\"\\u000A\\u000D]{1,256}")};

		var csv = new Grammar();

		csv.addRule("main",    [rule("record"), maybe(crlf, maybe(rule("main")))]);
		csv.addRule("record",  [rule("field"), repeat(sep, rule("field"))]);
		csv.addRule("field",   maybe(any(rule("escaped"), rule("value"))));
		csv.addRule("escaped", ["\"", repeat(any(text, sep, crlf, "\"\"")), "\""]);
		csv.addRule("value",   [text, repeat(text)]);

		csv.generate();

		return csv;
	}

	return createCsvGrammar;
});
