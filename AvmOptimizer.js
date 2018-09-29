// Neon AVM Post-Optimization (minimization of opcodes in Neo AVM)
// NeoResearch team
// Copyleft 2018 - MIT License

// Notice: this project is experimental is probably quite inefficient, it must
// be considered as an inspiration for future developers to follow this path of
// reducing avm size by removing useless opcodes.

// Project will start with a simple algorithm for removing NOP opcodes.

// class NeonOpcode stores single opcode with parameters (in hex)
(function(exports) {
"use strict";

// NeoOpcode supports hexcode (e.g. '00'), opname (e.g. 'ADD'), byteline (0..65k, 2 bytes),
//    comment, args (could be any object, for example, to build "structured opcodes")
function NeoOpcode(hexcode, opname, byteline, comment="", args="") {
   this.hexcode = hexcode;
   this.opname = opname;
   this.comment = comment;
   this.args = args;
   this.size = 1+(args.length/2);
	 this.byteline = byteline;
};

NeoOpcode._construct = function(hexcode, opname, byteline, comment="", args="") {
	return new NeoOpcode(hexcode, opname, byteline, comment, args);
};

// AvmOptimizer class only groups important operations (all static)
// immutable object
function AvmOptimizer() {
};

AvmOptimizer._construct = function() {
	return new AvmOptimizer();
};

// expects big endian byte array and converts to signed int16
AvmOptimizer.byteArray2ToInt16 = function(v) {
  if(v.length != 2)
     return 0;
  return  (((v[0] << 8) | v[1]) << 16) >> 16;
}

// parse opcode 'hexavm' and inserts on oplist (also increments opcounter)
AvmOptimizer.parseOpcodeList = function(hexavm, oplist, opcounter=0) {
	if (hexavm.length == 0)
			return; // string is empty
	if (hexavm.length % 2 == 1)
			return; // must be even pairs
	var firstOpcode = "" + hexavm[0] + hexavm[1];
	hexavm = hexavm.substr(2, hexavm.length);
	//console.log("code ("+code+")");
	var countSize = hexavm.length;
	hexavm = AvmOptimizer.parseOpcode(firstOpcode, hexavm, oplist, opcounter);
	AvmOptimizer.parseOpcodeList(hexavm, oplist, opcounter + (countSize-hexavm.length)/2);
};

AvmOptimizer.parseOpcode = function(opcode, hexavm, oplist=[], opcounter=0) {

};

exports.AvmOptimizer = AvmOptimizer;
})(typeof exports !== 'undefined' ? exports : this);
