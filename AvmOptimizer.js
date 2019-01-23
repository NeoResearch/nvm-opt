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

// ================================================================================================

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

// ================================================================================================

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
AvmOptimizer.parseOpcodeList = function(_hexavm, oplist, opcounter=0) {
  _hexavm = _hexavm.toLowerCase();
  var hexavm = "";
  for(var i=0; i<_hexavm.length; i++) {
    if(
        ((_hexavm[i]>='0') && (_hexavm[i]<='9')) ||
        ((_hexavm[i]>='a') && (_hexavm[i]<='f'))
      )
      hexavm += _hexavm[i];
  }

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
            if(hexavm.length<2)
              break;
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
        var sizepush = "";
        if(hexavm.length>=2) {
          sizepush = "" + hexavm[0] + hexavm[1];
				  hexavm = hexavm.substr(2, hexavm.length);
        }
				bsize = parseInt(sizepush, 16);
				strcomment = "#"+bsize+" bytes: ";
				var cpush = "";
				for (i = 0; i < bsize; i++) {
            if(hexavm.length<2)
              break;
						cpush += "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
				}
				strcomment += "# " + bsize + " bytes pushed onto the stack";
				oplist.push(new NeoOpcode(opcode, "PUSHDATA1", strcomment, cpush, opcounter));
		}
		else if (opcode == "4d") { // PUSHDATA2
				var bsize = 0;
        var sizepush = "";
        if(hexavm.length>=2) {
				   sizepush = "" + hexavm[0] + hexavm[1];
				   hexavm = hexavm.substr(2, hexavm.length);
        }
				bsize = parseInt(sizepush, 16);
        if(hexavm.length>=2) {
					 sizepush = "" + hexavm[0] + hexavm[1];
				   hexavm = hexavm.substr(2, hexavm.length);
        }
				bsize += 256*parseInt(sizepush, 16);
				strcomment = "#"+bsize+" bytes: ";
				var cpush = "";
				for (i = 0; i < bsize; i++) {
            if(hexavm.length<2)
              break;
						cpush += "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
				}
				strcomment += "# " + bsize + " bytes pushed onto the stack";
				oplist.push(new NeoOpcode(opcode, "PUSHDATA2", strcomment, cpush, opcounter));
		}
		else if (opcode == "4e") { // PUSHDATA4
				var bsize = 0;
				var sizepush = "";
        if(hexavm.length>=2) {
          sizepush = "" + hexavm[0] + hexavm[1];
				  hexavm = hexavm.substr(2, hexavm.length);
        }
				bsize = parseInt(sizepush, 16);
        if(hexavm.length>=2) {
          sizepush = "" + hexavm[0] + hexavm[1];
				  hexavm = hexavm.substr(2, hexavm.length);
        }
				bsize += 256*parseInt(sizepush, 16);
        if(hexavm.length>=2) {
          sizepush = "" + hexavm[0] + hexavm[1];
				  hexavm = hexavm.substr(2, hexavm.length);
        }
				bsize += 256*256*parseInt(sizepush, 16);
        if(hexavm.length>=2) {
          sizepush = "" + hexavm[0] + hexavm[1];
				  hexavm = hexavm.substr(2, hexavm.length);
        }
				bsize += 256*256*256*parseInt(sizepush, 16);
				strcomment = "#"+bsize+" bytes: ";
				var cpush = "";
				for (i = 0; i < bsize; i++) {
            if(hexavm.length<2)
              break;
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
    // ======================
    //       Control
    // ======================
		else if (opcode == "61")
				oplist.push(new NeoOpcode(opcode, "NOP", "# Does nothing.", "", opcounter));
		else if (opcode == "62") {
				strcomment = "# ";
				var nparfunc = "";
        if(hexavm.length>=4) {
          nparfunc = "" + hexavm[0] + hexavm[1] + hexavm[2] + hexavm[3];
				  hexavm = hexavm.substr(4, hexavm.length);
        }
				strcomment += ""+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
				oplist.push(new NeoOpcode(opcode, "JMP", strcomment, nparfunc, opcounter));
		}
		else if (opcode == "63") {
				strcomment = "# ";
        var nparfunc = "";
        if(hexavm.length>=4) {
          nparfunc = "" + hexavm[0] + hexavm[1] + hexavm[2] + hexavm[3];
				  hexavm = hexavm.substr(4, hexavm.length);
        }
				strcomment += ""+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
				oplist.push(new NeoOpcode(opcode, "JMPIF", strcomment, nparfunc, opcounter));
		}
		else if (opcode == "64") {
				strcomment = "# ";
        var nparfunc = "";
        if(hexavm.length>=4) {
          nparfunc = "" + hexavm[0] + hexavm[1] + hexavm[2] + hexavm[3];
				  hexavm = hexavm.substr(4, hexavm.length);
        }
				strcomment += ""+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
				oplist.push(new NeoOpcode(opcode, "JMPIFNOT", strcomment, nparfunc, opcounter));
		}
		else if (opcode == "65") {
			 strcomment = "# ";
       var nparfunc = "";
       if(hexavm.length>=4) {
         nparfunc = "" + hexavm[0] + hexavm[1] + hexavm[2] + hexavm[3];
         hexavm = hexavm.substr(4, hexavm.length);
       }
			 strcomment += ""+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
			 oplist.push(new NeoOpcode(opcode, "CALL", strcomment, nparfunc, opcounter));
			 //oplist.push(new NeoOpcode(opcode, "CALL", "#", "", opcounter));
		}
		else if (opcode == "66")
				oplist.push(new NeoOpcode(opcode, "RET", "#", "", opcounter));
		else if (opcode == "68") {
				strcomment = "# ";
				var nparfunc = "";
        var cpush = "";
        if(hexavm.length>=2) {
          nparfunc = "" + hexavm[0] + hexavm[1];
				  cpush = nparfunc;
				  hexavm = hexavm.substr(2, hexavm.length);
        }
				var fvalue = parseInt(nparfunc, 16);
				var sfunc = ""; // hexcode in string char format
				var i = 0;
				for (i = 0; i < fvalue; i++) {
            if(hexavm.length<2)
              break;
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
            if(hexavm.length<2)
              break;
						var codepush = "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
						//codecall = codepush + codecall;
						codecall += codepush;
				}
				//target.val(target.val() + codecall + "\n");
				oplist.push(new NeoOpcode(opcode, opname, strcomment, codecall, opcounter));
		}
    // =============================
    //          Stack ops
    // =============================
		else if (opcode == "6a")
				oplist.push(new NeoOpcode(opcode, "DUPFROMALTSTACK", "# clone top element from altstack to mainstack", "", opcounter));
		else if (opcode == "6b")
				oplist.push(new NeoOpcode(opcode, "TOALTSTACK", "# Puts the input onto the top of the alt stack. Removes it from the main stack.", "", opcounter));
		else if (opcode == "6c")
				oplist.push(new NeoOpcode(opcode, "FROMALTSTACK", "# Puts the input onto the top of the main stack. Removes it from the alt stack.", "", opcounter));
		else if (opcode == "6d")
				oplist.push(new NeoOpcode(opcode, "XDROP", "# The item n back in the main stack is removed.", "", opcounter));
		else if (opcode == "72")
				oplist.push(new NeoOpcode(opcode, "XSWAP", "# The item n back in the main stack in swapped with top stack item.", "", opcounter));
		else if (opcode == "73")
				oplist.push(new NeoOpcode(opcode, "XTUCK", "# The item on top of the main stack is copied and inserted to the position n in the main stack.", "", opcounter));
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

    // ===============================
    //              SPLICE
    // ===============================

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

    // ================================
    //        bitwise logic
    // ================================

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

    // ================================
    //         Numeric
    // ================================

		else if (opcode == "8b")
				oplist.push(new NeoOpcode(opcode, "INC", "# 1 is added to the input.", "", opcounter));
		else if (opcode == "8c")
				oplist.push(new NeoOpcode(opcode, "DEC", "# 1 is subtracted from the input.", "", opcounter));
		else if (opcode == "8d")
				oplist.push(new NeoOpcode(opcode, "SIGN", "# Puts the sign of top stack item on top of the main stack. If value is negative, put -1; if positive, put 1; if value is zero, put 0.", "", opcounter));
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

    // ================================
    //           crypto
    // ================================

		else if (opcode == "a7")
				oplist.push(new NeoOpcode(opcode, "SHA1", "# The input is hashed using SHA-1.", "", opcounter));
		else if (opcode == "a8")
				oplist.push(new NeoOpcode(opcode, "SHA256", "# The input is hashed using SHA-256.", "", opcounter));
		else if (opcode == "a9")
				oplist.push(new NeoOpcode(opcode, "HASH160", "# The input is hashed using HASH160.", "", opcounter));
		else if (opcode == "aa")
				oplist.push(new NeoOpcode(opcode, "HASH256", "# The input is hashed using HASH256.", "", opcounter));
		else if (opcode == "ac")
				oplist.push(new NeoOpcode(opcode, "CHECKSIG", "# The publickey and signature are taken from main stack. Verifies if transaction was signed by given publickey and a boolean output is put on top of the main stack.", "", opcounter));
    else if (opcode == "ad")
        oplist.push(new NeoOpcode(opcode, "VERIFY", "# The publickey, signature and message are taken from main stack. Verifies if given message was signed by given publickey and a boolean output is put on top of the main stack.", "", opcounter));
		else if (opcode == "ae")
				oplist.push(new NeoOpcode(opcode, "CHECKMULTISIG", "# A set of n public keys (an array or value n followed by n pubkeys) is validated against a set of m signatures (an array or value m followed by m signatures).", "", opcounter));

    // ================================
    //           Array
    // ================================

		else if (opcode == "c0")
				oplist.push(new NeoOpcode(opcode, "ARRAYSIZE", "# An array is removed from top of the main stack. Its size is put on top of the main stack.", "", opcounter));
		else if (opcode == "c1")
				oplist.push(new NeoOpcode(opcode, "PACK", "# A value n is taken from top of main stack. The next n items on main stack are removed, put inside n-sized array and this array is put on top of the main stack.", "", opcounter));
		else if (opcode == "c2")
				oplist.push(new NeoOpcode(opcode, "UNPACK", "# An array is removed from top of the main stack. Its elements are put on top of the main stack (in reverse order) and the array size is also put on main stack.", "", opcounter));
		else if (opcode == "c3")
				oplist.push(new NeoOpcode(opcode, "PICKITEM", "# An input index n (or key) and an array (or map) are taken from main stack. Element array[n] (or map[n]) is put on top of the main stack.", "", opcounter));
		else if (opcode == "c4")
				oplist.push(new NeoOpcode(opcode, "SETITEM", "#  A value v, index n (or key) and an array (or map) are taken from main stack. Attribution array[n]=v (or map[n]=v) is performed.", "", opcounter));
		else if (opcode == "c5")
				oplist.push(new NeoOpcode(opcode, "NEWARRAY", "#  A value n is taken from top of main stack. A zero-filled array type with size n is put on top of the main stack.", "", opcounter));
		else if (opcode == "c6")
				oplist.push(new NeoOpcode(opcode, "NEWSTRUCT", "#  A value n is taken from top of main stack. A zero-filled struct type with size n is put on top of the main stack.", "", opcounter));
    else if (opcode == "c7")
				oplist.push(new NeoOpcode(opcode, "NEWMAP", "# A Map is created and put on top of the main stack.", "", opcounter));
		else if (opcode == "c8")
				oplist.push(new NeoOpcode(opcode, "APPEND", "# The item on top of main stack is removed and appended to the second item on top of the main stack.", "", opcounter));
		else if (opcode == "c9")
				oplist.push(new NeoOpcode(opcode, "REVERSE", "# An array is removed from the top of the main stack and its elements are reversed.", "", opcounter));
		else if (opcode == "ca")
				oplist.push(new NeoOpcode(opcode, "REMOVE", "# An input index n (or key) and an array (or map) are removed from the top of the main stack. Element array[n] (or map[n]) is removed.", "", opcounter));
    else if (opcode == "cb")
				oplist.push(new NeoOpcode(opcode, "HASKEY", "# An input index n (or key) and an array (or map) are removed from the top of the main stack. Puts True on top of main stack if array[n] (or map[n]) exist, and False otherwise.", "", opcounter));
    else if (opcode == "cc")
				oplist.push(new NeoOpcode(opcode, "KEYS", "# A map is taken from top of the main stack. The keys of this map are put on top of the main stack.", "", opcounter));
    else if (opcode == "cd")
				oplist.push(new NeoOpcode(opcode, "VALUES", "# A map is taken from top of the main stack. The values of this map are put on top of the main stack.", "", opcounter));

    // ================================
    //        Stack Isolation
    // ================================

    else if (opcode == "e0") {
			 strcomment = "# ";
       var param1 = "";
       var param2 = "";
       var nparfunc = "";
       if(hexavm.length>=8) {
         param1 = "" + hexavm[0] + hexavm[1];
         param2 = "" + hexavm[2] + hexavm[3];
			   nparfunc = "" + hexavm[4] + hexavm[5] + hexavm[6] + hexavm[7];
			   hexavm = hexavm.substr(8, hexavm.length);
       }
       var params = param1+param2;
			 strcomment += ""+params+" "+AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(nparfunc, opcounter));
			 oplist.push(new NeoOpcode(opcode, "CALL_I", strcomment, params+nparfunc, opcounter));
			 //oplist.push(new NeoOpcode(opcode, "CALL", "#", "", opcounter));
		}
    else if ((opcode == "e1") || (opcode == "e2") || (opcode == "e3") || (opcode == "e4")) {  // read 20 bytes in reverse order
        strcomment = "# ";
				var opname = "";
				if (opcode == "e1")
						opname = "CALL_E";
        if (opcode == "e2")
						opname = "CALL_ED";
        if (opcode == "e3")
						opname = "CALL_ET";
        if (opcode == "e4")
						opname = "CALL_EDT";

        var param1 = "";
        var param2 = "";

        if(hexavm.length>=4) {
          param1 = "" + hexavm[0] + hexavm[1];
          param2 = "" + hexavm[1] + hexavm[2];
          strcomment += ""+param1 + param2;
          hexavm = hexavm.substr(4, hexavm.length);
        }
				var codecall = "";
				for (i = 0; i < 20; i++) {
            if(hexavm.length< 2)
              break;
						var codepush = "" + hexavm[0] + hexavm[1];
						hexavm = hexavm.substr(2, hexavm.length);
						//codecall = codepush + codecall;
						codecall += codepush;
				}
				//target.val(target.val() + codecall + "\n");
				oplist.push(new NeoOpcode(opcode, opname, strcomment, codecall, opcounter));
		}

    // ==========================
    //        exceptions
    // ==========================

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

// verify line numbers
AvmOptimizer.verifyLineNumbers = function(ops) {
  if(ops.length == 0)
    return true;
  var currentLine = 0;
  for(var i=0; i<ops.length; i++) {
    if(ops[i].byteline != currentLine)
      return false;
    currentLine += ops[i].size;
  }
  return true;
}

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

// merge the modular list to single list
AvmOptimizer.joinListModules = function(opsModules) {
  var opsJumps = [];
  for(var i=0; i<opsModules.length; i++)
    for(var j=0; j<opsModules[i].length; j++)
      opsJumps.push(opsModules[i][j]);
  return opsJumps;
}

// find index line on array v
AvmOptimizer.findOnArray = function(line, v) {
  for(var i=0; i<v.length; i++)
    if(v[i]==line)
      return true;
  return false;
}

AvmOptimizer.findLineOnOplist = function(line, opsJumps) {
  for(var i=0; i<opsJumps.length; i++)
    if(AvmOptimizer.findOnArray(line, opsJumps[i][2]) || AvmOptimizer.findOnArray(line, opsJumps[i][3]))
      return opsJumps[i][0];
  return -1;
}

// looks for unreachable code in list (true if exists; false, otherwise)
AvmOptimizer.findUnreachableCode = function(opsJumps) {
  for(var i=0; i<opsJumps.length-1; i++)
    if(
        ((opsJumps[i][1]=="RET")||(opsJumps[i][1]=="THROW")) &&
        ((opsJumps[i+1][2].length==0) && (opsJumps[i+1][3].length==0))
      ) {
        console.log("unreachable:"+opsJumps[i]);
        return i+1;
      }
  return -1;
}

// =========================================================================
// generate a flowchart.js based on modular list 'opsModules', merged list 'opsJumps' and raw operation list 'ops'
// =========================================================================
AvmOptimizer.generateFlowChartFromModules = function(opsModules, opsJumps, ops, ellipseContent=false) {
  var fcCode = "";
  fcCode += "input=>start: Start Script|past\n\
ret=>end: RET|approved\n\
throw=>end: THROW|rejected\n\
none=>end: NONE|approved\n";
  // create header
  for(var i=0; i<opsModules.length; i++)
  {
    var lastOp = opsModules[i].length-1;
    fcCode += "Line"+(opsModules[i][0][0])+"=>";
    if((opsModules[i].length==1) && ((opsModules[i][0][1]=="JMP") || (opsModules[i][0][1]=="JMPIF") || (opsModules[i][0][1]=="JMPIFNOT") ||
         (opsModules[i][0][1]=="CALL") || (opsModules[i][0][1]=="THROWIFNOT")))
    {
      fcCode += "condition: ";
    }
    else
      fcCode += "operation: ";
    // put content in operation/condition
    if(ellipseContent) {
      fcCode += opsModules[i][0][0]+":"+opsModules[i][0][1];
      if(lastOp > 0)
        fcCode += "..."+opsModules[i][lastOp][0]+":"+opsModules[i][lastOp][1];
    }
    else
      for(var j=0; j<opsModules[i].length; j++)
        fcCode += opsModules[i][j][0]+":"+opsModules[i][j][1]+"\n";
    fcCode += "|future\n";
  }
  // connections on blocks
  fcCode += "input->Line0\n";
  for(var i=0; i<opsModules.length; i++)
  {
    var lastOp = opsModules[i].length-1;

    if( (opsModules[i].length==1) && ((opsModules[i][0][1]=="JMP") || (opsModules[i][0][1]=="JMPIF") || (opsModules[i][0][1]=="JMPIFNOT") ||
         (opsModules[i][0][1]=="CALL") || (opsModules[i][0][1]=="THROWIFNOT"))
      )
    {
      fcCode += "Line"+(opsModules[i][0][0])+"(no)->";

      // compute "no": check if last is RET, THROW or just next Line
      if(opsModules[i][lastOp][1]=="RET")
        fcCode += "ret\n";
      else if (opsModules[i][lastOp][1]=="THROW")
        fcCode += "throw\n";
      else if (i == opsModules.length-1) // last line already
        fcCode += "none\n";
      else
        fcCode += "Line"+opsModules[i+1][0][0]+"\n";

      // compute "yes": find operation that references this one
      fcCode += "Line"+(opsModules[i][0][0])+"(yes)->";
      var idxLine = AvmOptimizer.findLineOnOplist(opsModules[i][0][0], opsJumps);
      if(idxLine < 0)
        fcCode += "ERROR_Line_Not_Found\n";
      else
        fcCode += "Line"+idxLine+"\n";
    }
    else  // basic operation (not condition)
    {
      fcCode += "Line"+(opsModules[i][0][0])+"->";
      if(opsModules[i][lastOp][1]=="RET")
        fcCode += "ret\n";
      else if (opsModules[i][lastOp][1]=="THROW")
        fcCode += "throw\n";
      else if (i == opsModules.length-1) // last line already
        fcCode += "none\n";
      else
        fcCode += "Line"+opsModules[i+1][0][0]+"\n";
    }
  }

  return fcCode;
}

// =========================================================================
//                         Optimization
// =========================================================================

// remove operation index 'i' at operation list 'oplist' (and adjust JMP/CALL)
AvmOptimizer.removeOP = function(oplist, i)
{
   //console.log("removeOP("+i+")");
   //console.log("oplist: "+oplist);

   // remove operation i
   oplist.splice(i, 1);

   for(var j=i; j<oplist.length; j++)
      oplist[j].byteline -= 1;

   var count_jmp_fwd_adjust = 0; // forward jumps
   var count_jmp_bwd_adjust = 0; // backward jumps

   // Step 1: update forward jumps
   var j = i - 1;
   var count_dist = 1; // 1 byte
   while(j > 0) {
      if((oplist[j].opname[0] == 'J') ||(oplist[j].hexcode == "65")) { // JUMP or CALL(0x65)
         var jmp = AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(oplist[j].args));
         if(count_dist <= jmp-2) // jump (-3 bytes) after or equals to NOP position
         {
            //console.log("Forward: Jumping "+jmp+" positions forward at j="+j+" (nop at i="+i+") count_dist:"+count_dist);
            //console.log("count_dist "+count_dist+"<= jmp="+jmp);
            count_jmp_fwd_adjust++;
            jmp -= 1;
            var ba_jmp = AvmOptimizer.bigByteArray2TolittleHexString(AvmOptimizer.int16ToByteArray2(jmp));
            //console.log("next jump value="+jmp+" ba="+ba_jmp);
            oplist[j].args = ba_jmp;
            oplist[j].comment = "# "+jmp;
         }
      }
      count_dist += oplist[j].size; // add size of current opcode
      //console.log("sum="+count_dist+" op:"+oplist[j].opname);
      j--;
   } // end while step 1

   // Step 2: update backward jumps
   var j = i;
   var count_dist = 1; // 1 byte
   while(j < oplist.length) {
      // if jump! check if nop removal the jump (must add 1).
      if((oplist[j].opname[0] == 'J') ||(oplist[j].hexcode == "65")) { // JUMP or CALL(0x65)
         //console.log("FOUND JUMP AT j="+j+" count_dist="+count_dist);
         var jmp = AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray(oplist[j].args));
         //console.log("initial jump value="+jmp+" ba="+oplist[j].args);
         if(jmp <= -count_dist) // jump (-3 bytes) before or equals to NOP position
         {
           //console.log("Backwards: Jumping "+jmp+"positions forward at j="+j+ " (nop at i="+i+")");
            // adjust jump value (+1)
            count_jmp_bwd_adjust++;
            jmp += 1;
            var ba_jmp = AvmOptimizer.bigByteArray2TolittleHexString(AvmOptimizer.int16ToByteArray2(jmp));
            //console.log("next jump value="+jmp+" ba="+ba_jmp);
            oplist[j].args = ba_jmp;
            oplist[j].comment = "# "+jmp;
         }
      }
      count_dist += oplist[j].size; // add size of current opcode
      j++;
   } // finish step 2 jump search

   return count_jmp_bwd_adjust + count_jmp_fwd_adjust;
}

AvmOptimizer.removeNOP = function(oplist)
{
   //console.log("Removing NOP from oplist(size="+oplist.length+")");
   var countnop = 0;
   var count_jmp_adjust = 0;
   var i = 0;
   while(i < oplist.length)
   {
      //console.log("scanning "+oplist[i].hexcode+" i="+i+"/"+oplist.length);
      //console.log("checking opcode at i="+i+" opcode="+oplist[i].hexcode);
      if(oplist[i].hexcode == "61")
      {
         //console.log("found NOP at i="+i+"/"+oplist.length+"\n");
         countnop++;
         // found NOP!
         // Step 0: remove NOP
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
         //console.log("adjusted "+jmps+" jumps/calls");
      }
      else // if NOP not found
         i++;
   }

   //console.log("removed NOPs: "+countnop+" Adjusted "+count_jmp_adjust+" jumps/calls.");
   return countnop;
} // removeNOP

// detect the sequence: 6c FROMALTSTACK -> 76 DUP -> 6b TOALTSTACK and convert to 6a DUPFROMALTSTACK
AvmOptimizer.detectDUPFROMALTSTACK = function(oplist)
{
   var count_change = 0;
   var count_jmp_adjust = 0;
   var i = 0;
   while(i < oplist.length-2)
   {
      if((oplist[i].hexcode == "6c") && (oplist[i+1].hexcode == "76") && (oplist[i+2].hexcode == "6b"))
      {
         console.log("will add DUPFROMALTSTACK at i="+i+" oplist="+oplist.length+"\n");
         count_change++;

         // Step 1: remove 6c
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
         // Step 2: remove 76
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
         // Step 3: rename 6b to 6a
         oplist[i].hexcode = "6a"; oplist[i].opname="DUPFROMALTSTACK"; oplist[i].comment = "#";
      }
      else // if NOP not found
         i++;
   }

   console.log("added DUPFROMALTSTACK: "+count_change+" Adjusted "+count_jmp_adjust+" jumps/calls.");
   return count_change;
} // detectDUPFROMALTSTACK

// detect the pattern: 51 PUSH1, c1 PACK, 00 PUSH0, c3 PICKITEM
AvmOptimizer.detect_51c100c3 = function(oplist)
{
   var count_change = 0;
   var count_jmp_adjust = 0;
   var i = 0;
   while(i < oplist.length-3)
   {
      if((oplist[i].hexcode == "51") &&
         (oplist[i+1].hexcode == "c1") &&
         (oplist[i+2].hexcode == "00") &&
         (oplist[i+3].hexcode == "c3"))
      {
         console.log("detect_51c100c3 at i="+i+" oplist="+oplist.length+"\n");
         count_change++;

         // Step 1: remove four operations at i
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
      }
      else // if NOP not found
         i++;
   }

   console.log("detect_51c100c3: "+count_change+" Adjusted "+count_jmp_adjust+" jumps/calls.");
   return count_change;
} // detect pattern 51c100c3

// detect the sequence: PUSH1 PACK TOALTSTACK
AvmOptimizer.detect_PUSH1_PACK_TOALTSTACK = function(oplist)
{
   var count_change = 0;
   var count_jmp_adjust = 0;
   var i = 0;
   //console.log(oplist);
   while(i < oplist.length-7) // requires 8 opcodes at least
   {
       //51 PUSH1
       //c5 NEWARRAY   (create array)
       //6b TOALTSTACK  (move it to altstack)
       //6a DUPFROMALTSTACK  (clone it to main stack)
       //00 PUSH0  (prepare to set 0)
       //52 PUSH2  (take element previous to array)
       //7a ROLL  (roll two)
       //c4 SETITEM  (set element before array to position 0)

      if( (oplist[i].hexcode == "51") &&
          (oplist[i+1].hexcode == "c5") &&
          (oplist[i+2].hexcode == "6b") &&
          (oplist[i+3].hexcode == "6a") &&
          (oplist[i+4].hexcode == "00") &&
          (oplist[i+5].hexcode == "52") &&
          (oplist[i+6].hexcode == "7a") &&
          (oplist[i+7].hexcode == "c4")
        )
      {
         console.log("found pattern PUSH1 PACK TOALTSTACK at i="+i+" oplist="+oplist.length+"\n");
         count_change++;

         // Step 1: remove 5 ops (at i+1), to keep PUSH1
         for(var j=0; j<5; j++)
            count_jmp_adjust += AvmOptimizer.removeOP(oplist, i+1); // automatically adjust jumps
         // Step 2: update opcodes (i+1) and (i+2)
         oplist[i+1].hexcode = "c1"; oplist[i+1].opname="PACK"; oplist[i+1].comment = "#";
         oplist[i+2].hexcode = "6b"; oplist[i+2].opname="TOALTSTACK"; oplist[i+2].comment = "#";
      }
      else // if pattern not found
         i++;
   }

   console.log("patterns found: "+count_change+" Adjusted "+count_jmp_adjust+" jumps/calls.");
   return count_change;
} // detect_PUSH1_PACK_TOALTSTACK

// detect the sequence: TOALTSTACK DUPFROMALTSTACK => DUP TOALTSTACK
AvmOptimizer.detect_TOALTSTACK_DUPFROMALTSTACK = function(oplist)
{
   var count_change = 0;
   var count_jmp_adjust = 0;
   var i = 0;
   //console.log(oplist);
   while(i < oplist.length-1) // requires 2 opcodes at least
   {
       //6b TOALTSTACK  (move it to altstack)
       //6a DUPFROMALTSTACK  (clone it to main stack)

      if( (oplist[i].hexcode == "6b") &&
          (oplist[i+1].hexcode == "6a")
        )
      {
         console.log("found pattern TOALTSTACK_DUPFROMALTSTACK at i="+i+" oplist="+oplist.length+"\n");
         count_change++;

         // Step 1: update opcodes (i+0) and (i+1)
         oplist[i].hexcode = "76"; oplist[i].opname="DUP"; oplist[i].comment = "#";
         oplist[i+1].hexcode = "6b"; oplist[i+1].opname="TOALTSTACK"; oplist[i+1].comment = "#";
      }
      else // if pattern not found
         i++;
   }

   console.log("patterns found: "+count_change+" Adjusted "+count_jmp_adjust+" jumps/calls.");
   return count_change;
} // detect_TOALTSTACK_DUPFROMALTSTACK


// detect the sequence: DUP/TOALTSTACK (mainstack) FROMALTSTACK/DROP.
AvmOptimizer.detect_DUP_TOALT_FROM_ALT_DROP = function(oplist)
{
   var count_change = 0;
   var count_jmp_adjust = 0;
   var i = 0;
   //console.log(oplist);
   var found = -1;
   while(i < oplist.length-3) // requires 4 opcodes at least
   {
       //76 DUP
       //6b TOALTSTACK
      found = -1;
      if( (oplist[i].hexcode == "76") &&
          (oplist[i+1].hexcode == "6b")
        )
      {
         for(var j=i+2; j<oplist.length; j++)
         {
            if( (oplist[j].hexcode == "6c") &&
               (oplist[j+1].hexcode == "75")
              )
            {
              found = j;
              break;
            }
            if(j - i > 5) // max limit of opcodes to explore
              break;
         }

         // verify if some not basic main stack operation is performed
         // for now allowing: 00 PUSH0, c3 pickitem, 21 pushbytes33, ac checksig
         if(found > 0)
         {
            for(var j=i+2; j<found; j++)
              if( !( (oplist[j].hexcode == "00") ||
                      (oplist[j].hexcode == "c3") ||
                      (oplist[j].hexcode == "21") ||
                      (oplist[j].hexcode == "ac")
                   )
                )
                {
                    // operation not allowed (should only consider main stack "simple" ops)
                    found = -1;
                    break;
                }
         }
       }

       // really found optimization!
       if(found > 0)
       {
         console.log("found pattern DUP_ALTSTACK_DROP at i="+i+" oplist="+oplist.length+"\n");
         count_change++;

         // Step 1: remove DUP and TOALTSTACK
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i); // automatically adjust jumps
         // Step 2: remove FROMALTSTACK and DROP
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, found-2); // automatically adjust jumps
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, found-2); // automatically adjust jumps
       }
       else // if pattern not found
         i++;
   }

   console.log("patterns found: "+count_change+" Adjusted "+count_jmp_adjust+" jumps/calls.");
   return count_change;
} // detect_TOALTSTACK_DUPFROMALTSTACK

// inline swap: PUSH_X, PUSH_Y, SWAP => PUSH_Y,PUSH_X
AvmOptimizer.inlineSWAP = function(oplist)
{
   var count_change = 0;
   var count_jmp_adjust = 0;
   var i = 0;
   while(i < oplist.length-2)
   {
      var opvalue1 = parseInt(oplist[i].hexcode, 16);
      var ispush1 = (opvalue1==0) || ((opvalue1>=79) && (opvalue1<=96)); // PUSH1..16
      var opvalue2 = parseInt(oplist[i+1].hexcode, 16);
      var ispush2 = (opvalue2==0) || ((opvalue2>=79) && (opvalue2<=96)); // PUSH1..16

      if(ispush1 && ispush2 && (oplist[i+2].hexcode == "7c"))
      {
         console.log("will inline SWAP i="+(i+2)+" oplist="+oplist.length+"\n");
         count_change++;

         // Step 1: remove SWAP
         count_jmp_adjust += AvmOptimizer.removeOP(oplist, i+2); // automatically adjust jumps
         // Step 2: swap two push operations
         var op_tmp = oplist[i];
         oplist[i] = oplist[i+1];
         oplist[i+1] = op_tmp;
      }
      else // if NOP not found
         i++;
   }

   console.log("inlined SWAP: "+count_change+" Adjusted "+count_jmp_adjust+" jumps/calls.");
   return count_change;
} // inline SWAP


AvmOptimizer.optimizeAVM = function(oplist) {
   console.log("starting optimizer");
   var nop_rem = AvmOptimizer.removeNOP(oplist);
   //console.log("will detectDUPFROMALTSTACK");
   var op_dup = AvmOptimizer.detectDUPFROMALTSTACK(oplist);
   //console.log("will inline SWAP");
   var op_inlineswap = AvmOptimizer.inlineSWAP(oplist);
   var op_pattern1 = AvmOptimizer.detect_PUSH1_PACK_TOALTSTACK(oplist);
   var op_pattern2 = AvmOptimizer.detect_TOALTSTACK_DUPFROMALTSTACK(oplist);
   var op_pattern3 = AvmOptimizer.detect_DUP_TOALT_FROM_ALT_DROP(oplist);
   var op_pattern4 = AvmOptimizer.detect_51c100c3(oplist);

   return nop_rem + op_dup + op_inlineswap + op_pattern1 + op_pattern2 + op_pattern3 + op_pattern4;
}

AvmOptimizer.getAVMFromList = function(oplist) {
   var avm = "";
   var i = 0;
   for(i = 0; i<oplist.length; i++)
      avm += oplist[i].hexcode + oplist[i].args;
   return avm;
}

//exports.AvmOptimizer = AvmOptimizer;
module.exports = {
	AvmOptimizer,
	NeoOpcode
}
})(typeof exports !== 'undefined' ? exports : this);
