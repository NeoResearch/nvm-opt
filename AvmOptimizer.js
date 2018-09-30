// Neon AVM Post-Optimization (minimization of opcodes in Neo AVM)
// NeoResearch team
// Copyleft 2018 - MIT License

// Notice: this project is experimental is probably quite inefficient, it must
// be considered as an inspiration for future developers to follow this path of
// reducing avm size by removing useless opcodes.

// Project will start with a simple algorithm for removing NOP opcodes.

// class NeoOpcode stores single opcode with parameters (in hex)
(function(exports) {
"use strict";

// NeoOpcode supports hexcode (e.g. '00'), opname (e.g. 'ADD'), byteline (0..65k, 2 bytes),
//    comment, args (could be any object, for example, to build "structured opcodes")
function NeoOpcode(hexcode, opname, comment="", args="", byteline=0, objargs={}) {
   this.hexcode = hexcode;
   this.opname = opname;
   this.comment = comment;
   this.args = args; // hexbyte args
	 this.objargs = objargs; // object args
   this.size = 1+(args.length/2);
	 this.byteline = byteline;
   this.jumpsFrom = [];
   this.callsFrom = [];
};

NeoOpcode._construct = function(hexcode, opname, comment="", args="", byteline=0, objargs={}) {
	return new NeoOpcode(hexcode, opname, comment, args, byteline, objargs);
};

NeoOpcode.prototype.toString = function() {
    return "("+this.byteline+":"+this.opname+":"+this.args+")";
}

NeoOpcode.printList = function(ops) {
  var str = "[";
  for(var i=0; i<ops.length; i++) {
    str+= ops[i];
    if(i != ops.length-1)
      str += ",";
  }
  str += "]";
  return str;
}


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

// return avm from oplist
AvmOptimizer.getAVMFromList = function(oplist) {
	 var avm = "";
	 var i = 0;
	 for(i = 0; i<oplist.length; i++)
			avm += oplist[i].hexcode + oplist[i].args;
	 return avm;
}

// parse opcode 'hexavm' and inserts on oplist (also increments opcounter)
AvmOptimizer.parseOpcodeList = function(hexavm, oplist, opcounter=0) {
	if (hexavm.length == 0)
			return; // string is empty
	if (hexavm.length % 2 == 1)
			return; // must be even pairs
	var firstOpcode = "" + hexavm[0] + hexavm[1];
  var countSize = hexavm.length;
	hexavm = hexavm.substr(2, hexavm.length);
	//console.log("code ("+code+")");
	hexavm = AvmOptimizer.parseOpcode(firstOpcode, hexavm, oplist, opcounter);
	AvmOptimizer.parseOpcodeList(hexavm, oplist, opcounter + (countSize-hexavm.length)/2);
};

// parsing opcodes
AvmOptimizer.parseOpcode = function(opcode, hexavm, oplist=[], opcounter=0) {
		var pvalue = parseInt(opcode, 16);

		if (opcode == "00")
				oplist.push(new NeoOpcode(opcode, "PUSH0", "#An empty array of bytes is pushed onto the stack", "", opcounter));
		else if ((pvalue >= 1) && (pvalue <= 75)) {
				var strcomment = "# ";
				var i = 0;
				var cpush = "";
				var sfunc = "";
				for (i = 0; i < pvalue; i++) {
						var hexchar = "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
						cpush += hexchar;

						var cval = parseInt(hexchar, 16);
						if((cval >= 32) && (cval <= 126)) // from char 20 (SPACE) to 126 (TILDE)
							 sfunc += String.fromCharCode(cval);
				}
				//strcomment = " \"" + spush + "\" ";
				strcomment += sfunc;
				oplist.push(new NeoOpcode(opcode, "PUSHBYTES" + pvalue, strcomment, cpush, opcounter));
		}
		//else if(opcode == "01")
		// target.val(target.val() + opcode + "\tPUSHBYTES1\t#0x01-0x4B The next opcode bytes is data to be pushed onto the stack\n");
		//else if(opcode == "4b")
		//  target.val(target.val() + opcode + "\tPUSHBYTES75\t#\n");
		else if (opcode == "4c") { // PUSHDATA1
				var bsize = 0;
				var sizepush = "" + hexavm[0] + hexavm[1];
				hexavm = hexavm.substr(2, hexavm.length);
				bsize = parseInt(sizepush, 16);
				strcomment = "#"+bsize+" bytes: ";
				var cpush = "";
				for (i = 0; i < bsize; i++) {
						cpush += "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
				}
				strcomment += "# " + bsize + " bytes pushed onto the stack";
				oplist.push(new NeoOpcode(opcode, "PUSHDATA1", strcomment, cpush, opcounter));
		}
		else if (opcode == "4d") { // PUSHDATA2
				var bsize = 0;
				var sizepush = "" + hexavm[0] + hexavm[1];
				hexavm = hexavm.substr(2, hexavm.length);
				bsize = parseInt(sizepush, 16);
				sizepush = "" + hexavm[0] + hexavm[1];
				hexavm = hexavm.substr(2, hexavm.length);
				bsize += 256*parseInt(sizepush, 16);
				strcomment = "#"+bsize+" bytes: ";
				var cpush = "";
				for (i = 0; i < bsize; i++) {
						cpush += "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
				}
				strcomment += "# " + bsize + " bytes pushed onto the stack";
				oplist.push(new NeoOpcode(opcode, "PUSHDATA2", strcomment, cpush, opcounter));
		}
		else if (opcode == "4e") { // PUSHDATA4
				var bsize = 0;
				var sizepush = "" + hexavm[0] + hexavm[1];
				hexavm = hexavm.substr(2, hexavm.length);
				bsize = parseInt(sizepush, 16);
				sizepush = "" + hexavm[0] + hexavm[1];
				hexavm = hexavm.substr(2, hexavm.length);
				bsize += 256*parseInt(sizepush, 16);
				sizepush = "" + hexavm[0] + hexavm[1];
				hexavm = hexavm.substr(2, hexavm.length);
				bsize += 256*256*parseInt(sizepush, 16);
				sizepush = "" + hexavm[0] + hexavm[1];
				hexavm = hexavm.substr(2, hexavm.length);
				bsize += 256*256*256*parseInt(sizepush, 16);
				strcomment = "#"+bsize+" bytes: ";
				var cpush = "";
				for (i = 0; i < bsize; i++) {
						cpush += "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
				}
				strcomment += "# " + bsize + " bytes pushed onto the stack";
				oplist.push(new NeoOpcode(opcode, "PUSHDATA4", strcomment, cpush, opcounter));
		}
		else if (opcode == "4f")
				oplist.push(new NeoOpcode(opcode, "PUSHM1","#The number -1 is pushed onto the stack.", "", opcounter));
		else if (opcode == "51")
				oplist.push(new NeoOpcode(opcode, "PUSH1", "# The number 1 is pushed onto the stack.", "", opcounter));
		else if (opcode == "52")
				oplist.push(new NeoOpcode(opcode, "PUSH2", "# The number 2 is pushed onto the stack.", "", opcounter));
		else if (opcode == "53")
				oplist.push(new NeoOpcode(opcode, "PUSH3", "# The number 3 is pushed onto the stack.", "", opcounter));
		else if (opcode == "54")
				oplist.push(new NeoOpcode(opcode, "PUSH4", "# The number 4 is pushed onto the stack.", "", opcounter));
		else if (opcode == "55")
				oplist.push(new NeoOpcode(opcode, "PUSH5", "# The number 5 is pushed onto the stack.", "", opcounter));
		else if (opcode == "56")
				oplist.push(new NeoOpcode(opcode, "PUSH6", "# The number 6 is pushed onto the stack.", "", opcounter));
		else if (opcode == "57")
				oplist.push(new NeoOpcode(opcode, "PUSH7", "# The number 7 is pushed onto the stack.", "", opcounter));
		else if (opcode == "58")
				oplist.push(new NeoOpcode(opcode, "PUSH8", "# The number 8 is pushed onto the stack.", "", opcounter));
		else if (opcode == "59")
				oplist.push(new NeoOpcode(opcode, "PUSH9", "# The number 9 is pushed onto the stack.", "", opcounter));
		else if (opcode == "5a")
				oplist.push(new NeoOpcode(opcode, "PUSH10", "# The number 10 is pushed onto the stack.", "", opcounter));
		else if (opcode == "5b")
				oplist.push(new NeoOpcode(opcode, "PUSH11", "# The number 11 is pushed onto the stack.", "", opcounter));
		else if (opcode == "5c")
				oplist.push(new NeoOpcode(opcode, "PUSH12", "# The number 12 is pushed onto the stack.", "", opcounter));
		else if (opcode == "5d")
				oplist.push(new NeoOpcode(opcode, "PUSH13", "# The number 13 is pushed onto the stack.", "", opcounter));
		else if (opcode == "5e")
				oplist.push(new NeoOpcode(opcode, "PUSH14", "# The number 14 is pushed onto the stack.", "", opcounter));
		else if (opcode == "5f")
				oplist.push(new NeoOpcode(opcode, "PUSH15", "# The number 15 is pushed onto the stack.", "", opcounter));
		else if (opcode == "60")
				oplist.push(new NeoOpcode(opcode, "PUSH16", "# The number 16 is pushed onto the stack.", "", opcounter));
		else if (opcode == "61")
				oplist.push(new NeoOpcode(opcode, "NOP", "# Does nothing.", "", opcounter));
		else if (opcode == "62") {
				strcomment = "# ";
				var nparfunc = "" + hexavm[0] + hexavm[1] + hexavm[2] + hexavm[3];
				hexavm = hexavm.substr(4, hexavm.length);
				strcomment += ""+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
				oplist.push(new NeoOpcode(opcode, "JMP", strcomment, nparfunc, opcounter));
		}
		else if (opcode == "63") {
				strcomment = "# ";
				var nparfunc = "" + hexavm[0] + hexavm[1] + hexavm[2] + hexavm[3];
				hexavm = hexavm.substr(4, hexavm.length);
				strcomment += ""+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
				oplist.push(new NeoOpcode(opcode, "JMPIF", strcomment, nparfunc, opcounter));
		}
		else if (opcode == "64") {
				strcomment = "# ";
				var nparfunc = "" + hexavm[0] + hexavm[1] + hexavm[2] + hexavm[3];
				hexavm = hexavm.substr(4, hexavm.length);
				strcomment += ""+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
				oplist.push(new NeoOpcode(opcode, "JMPIFNOT", strcomment, nparfunc, opcounter));
		}
		else if (opcode == "65") {
			 strcomment = "# ";
			 var nparfunc = "" + hexavm[0] + hexavm[1] + hexavm[2] + hexavm[3];
			 hexavm = hexavm.substr(4, hexavm.length);
			 strcomment += ""+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
			 oplist.push(new NeoOpcode(opcode, "CALL", strcomment, nparfunc, opcounter));
			 //oplist.push(new NeoOpcode(opcode, "CALL", "#", "", opcounter));
		}
		else if (opcode == "66")
				oplist.push(new NeoOpcode(opcode, "RET", "#", "", opcounter));
		else if (opcode == "68") {
				strcomment = "# ";
				var nparfunc = "" + hexavm[0] + hexavm[1];
				cpush = nparfunc;
				hexavm = hexavm.substr(2, hexavm.length);
				var fvalue = parseInt(nparfunc, 16);
				var sfunc = ""; // hexcode in string char format
				var i = 0;
				for (i = 0; i < fvalue; i++) {
						var hexchar = "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
						cpush += hexchar;
						var cval = parseInt(hexchar, 16);

						if((cval >= 32) && (cval <= 126)) // from char 20 (SPACE) to 126 (TILDE)
							 sfunc += String.fromCharCode(cval);
						//var cvalue = String.fromCharCode(parseInt(codepush, 16));
						//sfunc += cvalue;
						//if (sfunc == "Neo.Storage")
						//    $("#cbx_storage")[0].checked = true;
						//target.val(target.val() + cvalue);
				}
				//target.val(target.val() + "\n");
				strcomment += sfunc;
				oplist.push(new NeoOpcode(opcode, "SYSCALL", strcomment, cpush, opcounter));
		}
		else if ((opcode == "67") ||  (opcode == "69")) {  // read 20 bytes in reverse order
				var opname = "";
				if (opcode == "69")
						opname = "TAILCALL";
				if (opcode == "67")
						opname = "APPCALL";
				var codecall = "";
				for (i = 0; i < 20; i++) {
						var codepush = "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
						//codecall = codepush + codecall;
						codecall += codepush;
				}
				//target.val(target.val() + codecall + "\n");
				oplist.push(new NeoOpcode(opcode, opname, strcomment, codecall, opcounter));
		}
		else if (opcode == "6a")
				oplist.push(new NeoOpcode(opcode, "DUPFROMALTSTACK", "#", "", opcounter));
		else if (opcode == "6b")
				oplist.push(new NeoOpcode(opcode, "TOALTSTACK", "# Puts the input onto the top of the alt stack. Removes it from the main stack.", "", opcounter));
		else if (opcode == "6c")
				oplist.push(new NeoOpcode(opcode, "FROMALTSTACK", "# Puts the input onto the top of the main stack. Removes it from the alt stack.", "", opcounter));
		else if (opcode == "6d")
				oplist.push(new NeoOpcode(opcode, "XDROP", "#", "", opcounter));
		else if (opcode == "72")
				oplist.push(new NeoOpcode(opcode, "XSWAP", "#", "", opcounter));
		else if (opcode == "73")
				oplist.push(new NeoOpcode(opcode, "XTUCK", "#", "", opcounter));
		else if (opcode == "74")
				oplist.push(new NeoOpcode(opcode, "DEPTH", "# Puts the number of stack items onto the stack.", "", opcounter));
		else if (opcode == "75")
				oplist.push(new NeoOpcode(opcode, "DROP", "# Removes the top stack item.", "", opcounter));
		else if (opcode == "76")
				oplist.push(new NeoOpcode(opcode, "DUP", "# Duplicates the top stack item.", "", opcounter));
		else if (opcode == "77")
				oplist.push(new NeoOpcode(opcode, "NIP", "# Removes the second-to-top stack item.", "", opcounter));
		else if (opcode == "78")
				oplist.push(new NeoOpcode(opcode, "OVER", "# Copies the second-to-top stack item to the top.", "", opcounter));
		else if (opcode == "79")
				oplist.push(new NeoOpcode(opcode, "PICK", "# The item n back in the stack is copied to the top.", "", opcounter));
		else if (opcode == "7a")
				oplist.push(new NeoOpcode(opcode, "ROLL", "# The item n back in the stack is moved to the top.", "", opcounter));
		else if (opcode == "7b")
				oplist.push(new NeoOpcode(opcode, "ROT", "# The top three items on the stack are rotated to the left.", "", opcounter));
		else if (opcode == "7c")
				oplist.push(new NeoOpcode(opcode, "SWAP", "# The top two items on the stack are swapped.", "", opcounter));
		else if (opcode == "7d")
				oplist.push(new NeoOpcode(opcode, "TUCK", "# The item at the top of the stack is copied and inserted before the second-to-top item.", "", opcounter));
		else if (opcode == "7e")
				oplist.push(new NeoOpcode(opcode, "CAT", "# Concatenates two strings.", "", opcounter));
		else if (opcode == "7f")
				oplist.push(new NeoOpcode(opcode, "SUBSTR", "# Returns a section of a string.", "", opcounter));
		else if (opcode == "80")
				oplist.push(new NeoOpcode(opcode, "LEFT", "# Keeps only characters left of the specified point in a string.", "", opcounter));
		else if (opcode == "81")
				oplist.push(new NeoOpcode(opcode, "RIGHT", "# Keeps only characters right of the specified point in a string.", "", opcounter));
		else if (opcode == "82")
				oplist.push(new NeoOpcode(opcode, "SIZE", "# Returns the length of the input string.", "", opcounter));
		else if (opcode == "83")
				oplist.push(new NeoOpcode(opcode, "INVERT", "# Flips all of the bits in the input.", "", opcounter));
		else if (opcode == "84")
				oplist.push(new NeoOpcode(opcode, "AND", "# Boolean and between each bit in the inputs.", "", opcounter));
		else if (opcode == "85")
				oplist.push(new NeoOpcode(opcode, "OR", "# Boolean or between each bit in the inputs.", "", opcounter));
		else if (opcode == "86")
				oplist.push(new NeoOpcode(opcode, "XOR", "# Boolean exclusive or between each bit in the inputs.", "", opcounter));
		else if (opcode == "87")
				oplist.push(new NeoOpcode(opcode, "EQUAL", "# Returns 1 if the inputs are exactly equal, 0 otherwise.", "", opcounter));
		else if (opcode == "8b")
				oplist.push(new NeoOpcode(opcode, "INC", "# 1 is added to the input.", "", opcounter));
		else if (opcode == "8c")
				oplist.push(new NeoOpcode(opcode, "DEC", "# 1 is subtracted from the input.", "", opcounter));
		else if (opcode == "8d")
				oplist.push(new NeoOpcode(opcode, "SIGN", "#", "", opcounter));
		else if (opcode == "8f")
				oplist.push(new NeoOpcode(opcode, "NEGATE", "# The sign of the input is flipped.", "", opcounter));
		else if (opcode == "90")
				oplist.push(new NeoOpcode(opcode, "ABS", "# The input is made positive.", "", opcounter));
		else if (opcode == "91")
				oplist.push(new NeoOpcode(opcode, "NOT", "# If the input is 0 or 1, it is flipped. Otherwise the output will be 0.", "", opcounter));
		else if (opcode == "92")
				oplist.push(new NeoOpcode(opcode, "NZ", "# Returns 0 if the input is 0. 1 otherwise.", "", opcounter));
		else if (opcode == "93")
				oplist.push(new NeoOpcode(opcode, "ADD", "# a is added to b.", "", opcounter));
		else if (opcode == "94")
				oplist.push(new NeoOpcode(opcode, "SUB", "# b is subtracted from a.", "", opcounter));
		else if (opcode == "95")
				oplist.push(new NeoOpcode(opcode, "MUL", "# a is multiplied by b.", "", opcounter));
		else if (opcode == "96")
				oplist.push(new NeoOpcode(opcode, "DIV", "# a is divided by b.", "", opcounter));
		else if (opcode == "97")
				oplist.push(new NeoOpcode(opcode, "MOD", "# Returns the remainder after dividing a by b.", "", opcounter));
		else if (opcode == "98")
				oplist.push(new NeoOpcode(opcode, "SHL", "# Shifts a left b bits, preserving sign.", "", opcounter));
		else if (opcode == "99")
				oplist.push(new NeoOpcode(opcode, "SHR", "# Shifts a right b bits, preserving sign.", "", opcounter));
		else if (opcode == "9a")
				oplist.push(new NeoOpcode(opcode, "BOOLAND", "# If both a and b are not 0, the output is 1. Otherwise 0.", "", opcounter));
		else if (opcode == "9b")
				oplist.push(new NeoOpcode(opcode, "BOOLOR", "# If a or b is not 0, the output is 1. Otherwise 0.", "", opcounter));
		else if (opcode == "9c")
				oplist.push(new NeoOpcode(opcode, "NUMEQUAL", "# Returns 1 if the numbers are equal, 0 otherwise.", "", opcounter));
		else if (opcode == "9e")
				oplist.push(new NeoOpcode(opcode, "NUMNOTEQUAL", "# Returns 1 if the numbers are not equal, 0 otherwise.", "", opcounter));
		else if (opcode == "9f")
				oplist.push(new NeoOpcode(opcode, "LT", "# Returns 1 if a is less than b, 0 otherwise.", "", opcounter));
		else if (opcode == "a0")
				oplist.push(new NeoOpcode(opcode, "GT", "# Returns 1 if a is greater than b, 0 otherwise.", "", opcounter));
		else if (opcode == "a1")
				oplist.push(new NeoOpcode(opcode, "LTE", "# Returns 1 if a is less than or equal to b, 0 otherwise.", "", opcounter));
		else if (opcode == "a2")
				oplist.push(new NeoOpcode(opcode, "GTE", "# Returns 1 if a is greater than or equal to b, 0 otherwise.", "", opcounter));
		else if (opcode == "a3")
				oplist.push(new NeoOpcode(opcode, "MIN", "# Returns the smaller of a and b.", "", opcounter));
		else if (opcode == "a4")
				oplist.push(new NeoOpcode(opcode, "MAX", "# Returns the larger of a and b.", "", opcounter));
		else if (opcode == "a5")
				oplist.push(new NeoOpcode(opcode, "WITHIN", "# Returns 1 if x is within the specified range (left-inclusive), 0 otherwise.", "", opcounter));
		else if (opcode == "a7")
				oplist.push(new NeoOpcode(opcode, "SHA1", "# The input is hashed using SHA-1.", "", opcounter));
		else if (opcode == "a8")
				oplist.push(new NeoOpcode(opcode, "SHA256", "# The input is hashed using SHA-256.", "", opcounter));
		else if (opcode == "a9")
				oplist.push(new NeoOpcode(opcode, "HASH160", "# The input is hashed using HASH160.", "", opcounter));
		else if (opcode == "aa")
				oplist.push(new NeoOpcode(opcode, "HASH256", "# The input is hashed using HASH256.", "", opcounter));
		else if (opcode == "ac")
				oplist.push(new NeoOpcode(opcode, "CHECKSIG", "#", "", opcounter));
		else if (opcode == "ae")
				oplist.push(new NeoOpcode(opcode, "CHECKMULTISIG", "#", "", opcounter));
		else if (opcode == "c0")
				oplist.push(new NeoOpcode(opcode, "ARRAYSIZE", "#", "", opcounter));
		else if (opcode == "c1")
				oplist.push(new NeoOpcode(opcode, "PACK", "#", "", opcounter));
		else if (opcode == "c2")
				oplist.push(new NeoOpcode(opcode, "UNPACK", "#", "", opcounter));
		else if (opcode == "c3")
				oplist.push(new NeoOpcode(opcode, "PICKITEM", "#", "", opcounter));
		else if (opcode == "c4")
				oplist.push(new NeoOpcode(opcode, "SETITEM", "#", "", opcounter));
		else if (opcode == "c5")
				oplist.push(new NeoOpcode(opcode, "NEWARRAY", "#", "", opcounter));
		else if (opcode == "c6")
				oplist.push(new NeoOpcode(opcode, "NEWSTRUCT", "#", "", opcounter));
		else if (opcode == "c8")
				oplist.push(new NeoOpcode(opcode, "APPEND", "#", "", opcounter));
		else if (opcode == "c9")
				oplist.push(new NeoOpcode(opcode, "REVERSE", "#", "", opcounter));
		else if (opcode == "ca")
				oplist.push(new NeoOpcode(opcode, "REMOVE", "#", "", opcounter));
		else if (opcode == "f0")
				oplist.push(new NeoOpcode(opcode, "THROW", "#", "", opcounter));
		else if (opcode == "f1")
				oplist.push(new NeoOpcode(opcode, "THROWIFNOT", "#", "", opcounter));
		else {
				oplist.push(new NeoOpcode(opcode, "???", "#", "", opcounter));
		}
		return hexavm;
};

AvmOptimizer.markJumpAt = function(ops, indexLine, indexFrom, isJump=false, isCall=false) {
  for(var j=0; j<ops.length; j++)
    if(ops[j].byteline==indexLine) {
      if(isJump)
        ops[j].jumpsFrom.push(indexFrom);
      if(isCall)
        ops[j].callsFrom.push(indexFrom);
    }
}

AvmOptimizer.computeJumpsFrom = function(ops) {

  for(var i=0; i<ops.length; i++) {

    if((ops[i].opname == "JMP") || (ops[i].opname == "JMPIF") || (ops[i].opname == "JMPIFNOT") || (ops[i].opname == "THROWIFNOT") ) {
      var offset = AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(ops[i].args));
      AvmOptimizer.markJumpAt(ops, ops[i].byteline + offset, ops[i].byteline, true, false);
    } else if(ops[i].opname == "CALL") {
      var offset = AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(ops[i].args));
      AvmOptimizer.markJumpAt(ops, ops[i].byteline + offset, ops[i].byteline, false, true);
    }

  }

};

// jump list marked with: byteline, opname,  "j" (jumpsFrom), "c" (callsFrom), "r" (before is return)
AvmOptimizer.parseJumpList = function(ops) {
  var opsJump = [];
  for(var i=0; i<ops.length; i++) {
    opsJump.push( [ops[i].byteline, ops[i].opname, ops[i].jumpsFrom, ops[i].callsFrom] );
  }
  return opsJump;
}

// breaks receiving jumps in modules
AvmOptimizer.breakJumpModules = function(_opsJumps) {
  var opsJumps = _opsJumps.slice(); // clone
  var opsModules = [];
  var lastCut = 0;
  for(var i=0; i<opsJumps.length; i++) {
    if((opsJumps[i][2].length > 0) || (opsJumps[i][3].length > 0)) {
      opsModules.push(opsJumps.slice(lastCut,i));
      lastCut = i;
    }
  }
  if(lastCut != opsJumps.length)
    opsModules.push(opsJumps.slice(lastCut, opsJumps.length));
  return opsModules;
}

// break all jumps in modules, receiving and departing
AvmOptimizer.breakAllJumpModules = function(_opsJumps) {
  var opsJumps = _opsJumps.slice(); // clone
  var opsModules = [];
  var lastCut = 0;
  for(var i=0; i<opsJumps.length; i++) {
    if((opsJumps[i][2].length > 0) || (opsJumps[i][3].length > 0)) {
      opsModules.push(opsJumps.slice(lastCut,i));
      lastCut = i;
    }
    if((opsJumps[i][1] == "JMP") || (opsJumps[i][1] == "JMPIF") || (opsJumps[i][1] == "JMPIFNOT") ||
          (opsJumps[i][1] == "CALL") || (opsJumps[i][1] == "THROWIFNOT")) {
      // cut before
      if(lastCut != i) {
        opsModules.push(opsJumps.slice(lastCut,i));
        lastCut = i;
      }
      // cut exactly
      opsModules.push(opsJumps.slice(lastCut,i+1));
      lastCut = i+1;
    }
  }
  // cut last
  if(lastCut != opsJumps.length)
    opsModules.push(opsJumps.slice(lastCut, opsJumps.length));
  return opsModules;
}

AvmOptimizer.joinListModules = function(opsModules) {
  var opsJumps = [];
  for(var i=0; i<opsModules.length; i++)
    for(var j=0; j<opsModules[i].length; j++)
      opsJumps.push(opsModules[i][j]);
  return opsJumps;
}

//exports.AvmOptimizer = AvmOptimizer;
module.exports = {
	AvmOptimizer,
	NeoOpcode
}
})(typeof exports !== 'undefined' ? exports : this);
