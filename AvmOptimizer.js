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
function NeoOpcode(hexcode, opname, byteline, comment="", args="", objargs={}) {
   this.hexcode = hexcode;
   this.opname = opname;
   this.comment = comment;
   this.args = args; // hexbyte args
	 this.objargs = objargs; // object args
   this.size = 1+(args.length/2);
	 this.byteline = byteline;
};

NeoOpcode._construct = function(hexcode, opname, byteline, comment="", args="", objargs={}) {
	return new NeoOpcode(hexcode, opname, byteline, comment, args, objargs);
};

// AvmOptimizer class only groups important operations (all static)
// immutable object
function AvmOptimizer() {
};

AvmOptimizer._construct = function() {
	return new AvmOptimizer();
};

// expects little endian byte array and converts to signed int16
AvmOptimizer.byteArray2ToInt16 = function(v) {
  if(v.length != 2)
     return 0;
  return  (((v[0] << 8) | v[1]) << 16) >> 16;
}

// expects signed int16 -> returns byte array with length 2
AvmOptimizer.int16ToByteArray2 = function(i16)
{
	 var vhex = (i16 >>> 0).toString(16);
	 while(vhex.length < 4)
			vhex = '0'+vhex;
	 while(vhex.length > 4)
			vhex = vhex.substr(1, vhex.length);
	 var v = [];
	 while(v.length < 2)
	 {
			v.push(Number('0x'+vhex[0]+vhex[1]));
			vhex = vhex.substr(2, vhex.length);
	 }
	 return v;
}

// convert little endian hexstring (4 chars) to big endian bytearray (2 bytes)
AvmOptimizer.littleHexStringToBigByteArray = function(lhs4)
{
	 if(lhs4.length != 4)
			return [];

	 var bba = [];
	 while(lhs4.length > 0)
	 {
			bba.push(Number('0x'+lhs4[0]+lhs4[1]));
			lhs4 = lhs4.substr(2, lhs4.length);
	 }
	 bba.reverse(); // little endian to big endian // TODO: Why not needed?
	 return bba;
}

AvmOptimizer.bigByteArray2TolittleHexString = function(bba2)
{
	 if(bba2.length != 2)
			return "";

	 var lhs4 = "";
	 var i = 0;
	 for(i=0; i<bba2.length; i++)
	 {
			var sbyte = bba2[i].toString(16);
			if(sbyte.length == 1)
				 sbyte = '0'+sbyte; // ensure 2 char byte
			lhs4 = sbyte + lhs4; // back to little endian
	 }
	 return lhs4;
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
