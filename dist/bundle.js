!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.avmoptimizer=t():e.avmoptimizer=t()}(window,function(){return function(e){var t={};function n(s){if(t[s])return t[s].exports;var i=t[s]={i:s,l:!1,exports:{}};return e[s].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(s,i,function(t){return e[t]}.bind(null,i));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){const s=n(1).AvmOptimizer;e.exports={AvmOptimizer:s}},function(e,t,n){!function(t){"use strict";function n(e,t,n="",s="",i=0,o={}){this.hexcode=e,this.opname=t,this.comment=n,this.args=s,this.objargs=o,this.size=1+s.length/2,this.byteline=i,this.jumpsFrom=[],this.callsFrom=[]}function s(){}n._construct=function(e,t,s="",i="",o=0,r={}){return new n(e,t,s,i,o,r)},n.prototype.toString=function(){return"("+this.byteline+":"+this.opname+":"+this.args+")"},n.printList=function(e){for(var t="[",n=0;n<e.length;n++)t+=e[n],n!=e.length-1&&(t+=",");return t+="]"},s._construct=function(){return new s},s.byteArray2ToInt16=function(e){return 2!=e.length?0:(e[0]<<8|e[1])<<16>>16},s.int16ToByteArray2=function(e){for(var t=(e>>>0).toString(16);t.length<4;)t="0"+t;for(;t.length>4;)t=t.substr(1,t.length);for(var n=[];n.length<2;)n.push(Number("0x"+t[0]+t[1])),t=t.substr(2,t.length);return n},s.littleHexStringToBigByteArray=function(e){if(4!=e.length)return[];for(var t=[];e.length>0;)t.push(Number("0x"+e[0]+e[1])),e=e.substr(2,e.length);return t.reverse(),t},s.bigByteArray2TolittleHexString=function(e){if(2!=e.length)return"";var t="",n=0;for(n=0;n<e.length;n++){var s=e[n].toString(16);1==s.length&&(s="0"+s),t=s+t}return t},s.getAVMFromList=function(e){var t="",n=0;for(n=0;n<e.length;n++)t+=e[n].hexcode+e[n].args;return t},s.parseOpcodeList=function(e,t,n=0){e=e.toLowerCase();for(var i="",o=0;o<e.length;o++)(e[o]>="0"&&e[o]<="9"||e[o]>="a"&&e[o]<="f")&&(i+=e[o]);if(0!=i.length&&i.length%2!=1){var r=""+i[0]+i[1],a=i.length;i=i.substr(2,i.length),i=s.parseOpcode(r,i,t,n),s.parseOpcodeList(i,t,n+(a-i.length)/2)}},s.parseOpcode=function(e,t,i=[],o=0){var r=parseInt(e,16);if("00"==e)i.push(new n(e,"PUSH0","#An empty array of bytes is pushed onto the stack","",o));else if(r>=1&&r<=75){var a="# ",h=0,u="",l="";for(h=0;h<r&&!(t.length<2);h++){var p=""+t[0]+t[1];t=t.substr(2,t.length),u+=p,(g=parseInt(p,16))>=32&&g<=126&&(l+=String.fromCharCode(g))}a+=l,i.push(new n(e,"PUSHBYTES"+r,a,u,o))}else if("4c"==e){var f=0,c="";t.length>=2&&(c=""+t[0]+t[1],t=t.substr(2,t.length)),a="#"+(f=parseInt(c,16))+" bytes: ";u="";for(h=0;h<f&&!(t.length<2);h++)u+=""+t[0]+t[1],t=t.substr(2,t.length);a+="# "+f+" bytes pushed onto the stack",i.push(new n(e,"PUSHDATA1",a,u,o))}else if("4d"==e){f=0,c="";t.length>=2&&(c=""+t[0]+t[1],t=t.substr(2,t.length)),f=parseInt(c,16),t.length>=2&&(c=""+t[0]+t[1],t=t.substr(2,t.length)),a="#"+(f+=256*parseInt(c,16))+" bytes: ";u="";for(h=0;h<f&&!(t.length<2);h++)u+=""+t[0]+t[1],t=t.substr(2,t.length);a+="# "+f+" bytes pushed onto the stack",i.push(new n(e,"PUSHDATA2",a,u,o))}else if("4e"==e){f=0,c="";t.length>=2&&(c=""+t[0]+t[1],t=t.substr(2,t.length)),f=parseInt(c,16),t.length>=2&&(c=""+t[0]+t[1],t=t.substr(2,t.length)),f+=256*parseInt(c,16),t.length>=2&&(c=""+t[0]+t[1],t=t.substr(2,t.length)),f+=65536*parseInt(c,16),t.length>=2&&(c=""+t[0]+t[1],t=t.substr(2,t.length)),a="#"+(f+=16777216*parseInt(c,16))+" bytes: ";u="";for(h=0;h<f&&!(t.length<2);h++)u+=""+t[0]+t[1],t=t.substr(2,t.length);a+="# "+f+" bytes pushed onto the stack",i.push(new n(e,"PUSHDATA4",a,u,o))}else if("4f"==e)i.push(new n(e,"PUSHM1","#The number -1 is pushed onto the stack.","",o));else if("51"==e)i.push(new n(e,"PUSH1","# The number 1 is pushed onto the stack.","",o));else if("52"==e)i.push(new n(e,"PUSH2","# The number 2 is pushed onto the stack.","",o));else if("53"==e)i.push(new n(e,"PUSH3","# The number 3 is pushed onto the stack.","",o));else if("54"==e)i.push(new n(e,"PUSH4","# The number 4 is pushed onto the stack.","",o));else if("55"==e)i.push(new n(e,"PUSH5","# The number 5 is pushed onto the stack.","",o));else if("56"==e)i.push(new n(e,"PUSH6","# The number 6 is pushed onto the stack.","",o));else if("57"==e)i.push(new n(e,"PUSH7","# The number 7 is pushed onto the stack.","",o));else if("58"==e)i.push(new n(e,"PUSH8","# The number 8 is pushed onto the stack.","",o));else if("59"==e)i.push(new n(e,"PUSH9","# The number 9 is pushed onto the stack.","",o));else if("5a"==e)i.push(new n(e,"PUSH10","# The number 10 is pushed onto the stack.","",o));else if("5b"==e)i.push(new n(e,"PUSH11","# The number 11 is pushed onto the stack.","",o));else if("5c"==e)i.push(new n(e,"PUSH12","# The number 12 is pushed onto the stack.","",o));else if("5d"==e)i.push(new n(e,"PUSH13","# The number 13 is pushed onto the stack.","",o));else if("5e"==e)i.push(new n(e,"PUSH14","# The number 14 is pushed onto the stack.","",o));else if("5f"==e)i.push(new n(e,"PUSH15","# The number 15 is pushed onto the stack.","",o));else if("60"==e)i.push(new n(e,"PUSH16","# The number 16 is pushed onto the stack.","",o));else if("61"==e)i.push(new n(e,"NOP","# Does nothing.","",o));else if("62"==e){a="# ";var m="";t.length>=4&&(m=""+t[0]+t[1]+t[2]+t[3],t=t.substr(4,t.length)),a+=""+s.byteArray2ToInt16(s.littleHexStringToBigByteArray(m,o)),i.push(new n(e,"JMP",a,m,o))}else if("63"==e){a="# ";m="";t.length>=4&&(m=""+t[0]+t[1]+t[2]+t[3],t=t.substr(4,t.length)),a+=""+s.byteArray2ToInt16(s.littleHexStringToBigByteArray(m,o)),i.push(new n(e,"JMPIF",a,m,o))}else if("64"==e){a="# ";m="";t.length>=4&&(m=""+t[0]+t[1]+t[2]+t[3],t=t.substr(4,t.length)),a+=""+s.byteArray2ToInt16(s.littleHexStringToBigByteArray(m,o)),i.push(new n(e,"JMPIFNOT",a,m,o))}else if("65"==e){a="# ";m="";t.length>=4&&(m=""+t[0]+t[1]+t[2]+t[3],t=t.substr(4,t.length)),a+=""+s.byteArray2ToInt16(s.littleHexStringToBigByteArray(m,o)),i.push(new n(e,"CALL",a,m,o))}else if("66"==e)i.push(new n(e,"RET","#","",o));else if("68"==e){a="# ";m="",u="";t.length>=2&&(u=m=""+t[0]+t[1],t=t.substr(2,t.length));var d=parseInt(m,16);l="",h=0;for(h=0;h<d&&!(t.length<2);h++){var g;p=""+t[0]+t[1];t=t.substr(2,t.length),u+=p,(g=parseInt(p,16))>=32&&g<=126&&(l+=String.fromCharCode(g))}a+=l,i.push(new n(e,"SYSCALL",a,u,o))}else if("67"==e||"69"==e){var T="";"69"==e&&(T="TAILCALL"),"67"==e&&(T="APPCALL");var A="";for(h=0;h<20&&!(t.length<2);h++){var b=""+t[0]+t[1];t=t.substr(2,t.length),A+=b}i.push(new n(e,T,a,A,o))}else if("6a"==e)i.push(new n(e,"DUPFROMALTSTACK","# clone top element from altstack to mainstack","",o));else if("6b"==e)i.push(new n(e,"TOALTSTACK","# Puts the input onto the top of the alt stack. Removes it from the main stack.","",o));else if("6c"==e)i.push(new n(e,"FROMALTSTACK","# Puts the input onto the top of the main stack. Removes it from the alt stack.","",o));else if("6d"==e)i.push(new n(e,"XDROP","# The item n back in the main stack is removed.","",o));else if("72"==e)i.push(new n(e,"XSWAP","# The item n back in the main stack in swapped with top stack item.","",o));else if("73"==e)i.push(new n(e,"XTUCK","# The item on top of the main stack is copied and inserted to the position n in the main stack.","",o));else if("74"==e)i.push(new n(e,"DEPTH","# Puts the number of stack items onto the stack.","",o));else if("75"==e)i.push(new n(e,"DROP","# Removes the top stack item.","",o));else if("76"==e)i.push(new n(e,"DUP","# Duplicates the top stack item.","",o));else if("77"==e)i.push(new n(e,"NIP","# Removes the second-to-top stack item.","",o));else if("78"==e)i.push(new n(e,"OVER","# Copies the second-to-top stack item to the top.","",o));else if("79"==e)i.push(new n(e,"PICK","# The item n back in the stack is copied to the top.","",o));else if("7a"==e)i.push(new n(e,"ROLL","# The item n back in the stack is moved to the top.","",o));else if("7b"==e)i.push(new n(e,"ROT","# The top three items on the stack are rotated to the left.","",o));else if("7c"==e)i.push(new n(e,"SWAP","# The top two items on the stack are swapped.","",o));else if("7d"==e)i.push(new n(e,"TUCK","# The item at the top of the stack is copied and inserted before the second-to-top item.","",o));else if("7e"==e)i.push(new n(e,"CAT","# Concatenates two strings.","",o));else if("7f"==e)i.push(new n(e,"SUBSTR","# Returns a section of a string.","",o));else if("80"==e)i.push(new n(e,"LEFT","# Keeps only characters left of the specified point in a string.","",o));else if("81"==e)i.push(new n(e,"RIGHT","# Keeps only characters right of the specified point in a string.","",o));else if("82"==e)i.push(new n(e,"SIZE","# Returns the length of the input string.","",o));else if("83"==e)i.push(new n(e,"INVERT","# Flips all of the bits in the input.","",o));else if("84"==e)i.push(new n(e,"AND","# Boolean and between each bit in the inputs.","",o));else if("85"==e)i.push(new n(e,"OR","# Boolean or between each bit in the inputs.","",o));else if("86"==e)i.push(new n(e,"XOR","# Boolean exclusive or between each bit in the inputs.","",o));else if("87"==e)i.push(new n(e,"EQUAL","# Returns 1 if the inputs are exactly equal, 0 otherwise.","",o));else if("8b"==e)i.push(new n(e,"INC","# 1 is added to the input.","",o));else if("8c"==e)i.push(new n(e,"DEC","# 1 is subtracted from the input.","",o));else if("8d"==e)i.push(new n(e,"SIGN","# Puts the sign of top stack item on top of the main stack. If value is negative, put -1; if positive, put 1; if value is zero, put 0.","",o));else if("8f"==e)i.push(new n(e,"NEGATE","# The sign of the input is flipped.","",o));else if("90"==e)i.push(new n(e,"ABS","# The input is made positive.","",o));else if("91"==e)i.push(new n(e,"NOT","# If the input is 0 or 1, it is flipped. Otherwise the output will be 0.","",o));else if("92"==e)i.push(new n(e,"NZ","# Returns 0 if the input is 0. 1 otherwise.","",o));else if("93"==e)i.push(new n(e,"ADD","# a is added to b.","",o));else if("94"==e)i.push(new n(e,"SUB","# b is subtracted from a.","",o));else if("95"==e)i.push(new n(e,"MUL","# a is multiplied by b.","",o));else if("96"==e)i.push(new n(e,"DIV","# a is divided by b.","",o));else if("97"==e)i.push(new n(e,"MOD","# Returns the remainder after dividing a by b.","",o));else if("98"==e)i.push(new n(e,"SHL","# Shifts a left b bits, preserving sign.","",o));else if("99"==e)i.push(new n(e,"SHR","# Shifts a right b bits, preserving sign.","",o));else if("9a"==e)i.push(new n(e,"BOOLAND","# If both a and b are not 0, the output is 1. Otherwise 0.","",o));else if("9b"==e)i.push(new n(e,"BOOLOR","# If a or b is not 0, the output is 1. Otherwise 0.","",o));else if("9c"==e)i.push(new n(e,"NUMEQUAL","# Returns 1 if the numbers are equal, 0 otherwise.","",o));else if("9e"==e)i.push(new n(e,"NUMNOTEQUAL","# Returns 1 if the numbers are not equal, 0 otherwise.","",o));else if("9f"==e)i.push(new n(e,"LT","# Returns 1 if a is less than b, 0 otherwise.","",o));else if("a0"==e)i.push(new n(e,"GT","# Returns 1 if a is greater than b, 0 otherwise.","",o));else if("a1"==e)i.push(new n(e,"LTE","# Returns 1 if a is less than or equal to b, 0 otherwise.","",o));else if("a2"==e)i.push(new n(e,"GTE","# Returns 1 if a is greater than or equal to b, 0 otherwise.","",o));else if("a3"==e)i.push(new n(e,"MIN","# Returns the smaller of a and b.","",o));else if("a4"==e)i.push(new n(e,"MAX","# Returns the larger of a and b.","",o));else if("a5"==e)i.push(new n(e,"WITHIN","# Returns 1 if x is within the specified range (left-inclusive), 0 otherwise.","",o));else if("a7"==e)i.push(new n(e,"SHA1","# The input is hashed using SHA-1.","",o));else if("a8"==e)i.push(new n(e,"SHA256","# The input is hashed using SHA-256.","",o));else if("a9"==e)i.push(new n(e,"HASH160","# The input is hashed using HASH160.","",o));else if("aa"==e)i.push(new n(e,"HASH256","# The input is hashed using HASH256.","",o));else if("ac"==e)i.push(new n(e,"CHECKSIG","# The publickey and signature are taken from main stack. Verifies if transaction was signed by given publickey and a boolean output is put on top of the main stack.","",o));else if("ad"==e)i.push(new n(e,"VERIFY","# The publickey, signature and message are taken from main stack. Verifies if given message was signed by given publickey and a boolean output is put on top of the main stack.","",o));else if("ae"==e)i.push(new n(e,"CHECKMULTISIG","# A set of n public keys (an array or value n followed by n pubkeys) is validated against a set of m signatures (an array or value m followed by m signatures).","",o));else if("c0"==e)i.push(new n(e,"ARRAYSIZE","# An array is removed from top of the main stack. Its size is put on top of the main stack.","",o));else if("c1"==e)i.push(new n(e,"PACK","# A value n is taken from top of main stack. The next n items on main stack are removed, put inside n-sized array and this array is put on top of the main stack.","",o));else if("c2"==e)i.push(new n(e,"UNPACK","# An array is removed from top of the main stack. Its elements are put on top of the main stack (in reverse order) and the array size is also put on main stack.","",o));else if("c3"==e)i.push(new n(e,"PICKITEM","# An input index n (or key) and an array (or map) are taken from main stack. Element array[n] (or map[n]) is put on top of the main stack.","",o));else if("c4"==e)i.push(new n(e,"SETITEM","#  A value v, index n (or key) and an array (or map) are taken from main stack. Attribution array[n]=v (or map[n]=v) is performed.","",o));else if("c5"==e)i.push(new n(e,"NEWARRAY","#  A value n is taken from top of main stack. A zero-filled array type with size n is put on top of the main stack.","",o));else if("c6"==e)i.push(new n(e,"NEWSTRUCT","#  A value n is taken from top of main stack. A zero-filled struct type with size n is put on top of the main stack.","",o));else if("c7"==e)i.push(new n(e,"NEWMAP","# A Map is created and put on top of the main stack.","",o));else if("c8"==e)i.push(new n(e,"APPEND","# The item on top of main stack is removed and appended to the second item on top of the main stack.","",o));else if("c9"==e)i.push(new n(e,"REVERSE","# An array is removed from the top of the main stack and its elements are reversed.","",o));else if("ca"==e)i.push(new n(e,"REMOVE","# An input index n (or key) and an array (or map) are removed from the top of the main stack. Element array[n] (or map[n]) is removed.","",o));else if("cb"==e)i.push(new n(e,"HASKEY","# An input index n (or key) and an array (or map) are removed from the top of the main stack. Puts True on top of main stack if array[n] (or map[n]) exist, and False otherwise.","",o));else if("cc"==e)i.push(new n(e,"KEYS","# A map is taken from top of the main stack. The keys of this map are put on top of the main stack.","",o));else if("cd"==e)i.push(new n(e,"VALUES","# A map is taken from top of the main stack. The values of this map are put on top of the main stack.","",o));else if("e0"==e){a="# ";var w="",v="";m="";t.length>=8&&(w=""+t[0]+t[1],v=""+t[2]+t[3],m=""+t[4]+t[5]+t[6]+t[7],t=t.substr(8,t.length));var y=w+v;a+=y+" "+s.byteArray2ToInt16(s.littleHexStringToBigByteArray(m,o)),i.push(new n(e,"CALL_I",a,y+m,o))}else if("e1"==e||"e2"==e||"e3"==e||"e4"==e){a="# ";T="";"e1"==e&&(T="CALL_E"),"e2"==e&&(T="CALL_ED"),"e3"==e&&(T="CALL_ET"),"e4"==e&&(T="CALL_EDT");w="",v="";t.length>=4&&(a+=""+(w=""+t[0]+t[1])+(v=""+t[1]+t[2]),t=t.substr(4,t.length));A="";for(h=0;h<20&&!(t.length<2);h++){b=""+t[0]+t[1];t=t.substr(2,t.length),A+=b}i.push(new n(e,T,a,A,o))}else"f0"==e?i.push(new n(e,"THROW","#","",o)):"f1"==e?i.push(new n(e,"THROWIFNOT","#","",o)):i.push(new n(e,"???","#","",o));return t},s.markJumpAt=function(e,t,n,s=!1,i=!1){for(var o=0;o<e.length;o++)e[o].byteline==t&&(s&&e[o].jumpsFrom.push(n),i&&e[o].callsFrom.push(n))},s.computeJumpsFrom=function(e){for(var t=0;t<e.length;t++)if("JMP"==e[t].opname||"JMPIF"==e[t].opname||"JMPIFNOT"==e[t].opname||"THROWIFNOT"==e[t].opname){var n=s.byteArray2ToInt16(s.littleHexStringToBigByteArray(e[t].args));s.markJumpAt(e,e[t].byteline+n,e[t].byteline,!0,!1)}else if("CALL"==e[t].opname){n=s.byteArray2ToInt16(s.littleHexStringToBigByteArray(e[t].args));s.markJumpAt(e,e[t].byteline+n,e[t].byteline,!1,!0)}},s.verifyLineNumbers=function(e){if(0==e.length)return!0;for(var t=0,n=0;n<e.length;n++){if(e[n].byteline!=t)return!1;t+=e[n].size}return!0},s.parseJumpList=function(e){for(var t=[],n=0;n<e.length;n++)t.push([e[n].byteline,e[n].opname,e[n].jumpsFrom,e[n].callsFrom]);return t},s.breakJumpModules=function(e){for(var t=e.slice(),n=[],s=0,i=0;i<t.length;i++)(t[i][2].length>0||t[i][3].length>0)&&(n.push(t.slice(s,i)),s=i);return s!=t.length&&n.push(t.slice(s,t.length)),n},s.breakAllJumpModules=function(e){for(var t=e.slice(),n=[],s=0,i=0;i<t.length;i++)(t[i][2].length>0||t[i][3].length>0)&&(n.push(t.slice(s,i)),s=i),"JMP"!=t[i][1]&&"JMPIF"!=t[i][1]&&"JMPIFNOT"!=t[i][1]&&"CALL"!=t[i][1]&&"THROWIFNOT"!=t[i][1]||(s!=i&&(n.push(t.slice(s,i)),s=i),n.push(t.slice(s,i+1)),s=i+1);return s!=t.length&&n.push(t.slice(s,t.length)),n},s.joinListModules=function(e){for(var t=[],n=0;n<e.length;n++)for(var s=0;s<e[n].length;s++)t.push(e[n][s]);return t},s.findOnArray=function(e,t){for(var n=0;n<t.length;n++)if(t[n]==e)return!0;return!1},s.findLineOnOplist=function(e,t){for(var n=0;n<t.length;n++)if(s.findOnArray(e,t[n][2])||s.findOnArray(e,t[n][3]))return t[n][0];return-1},s.findUnreachableCode=function(e){for(var t=0;t<e.length-1;t++)if(("RET"==e[t][1]||"THROW"==e[t][1])&&0==e[t+1][2].length&&0==e[t+1][3].length)return console.log("unreachable:"+e[t]),t+1;return-1},s.generateFlowChartFromModules=function(e,t,n,i=!1){var o="";o+="input=>start: Start Script|past\nret=>end: RET|approved\nthrow=>end: THROW|rejected\nnone=>end: NONE|approved\n";for(var r=0;r<e.length;r++){var a=e[r].length-1;if(o+="Line"+e[r][0][0]+"=>",1!=e[r].length||"JMP"!=e[r][0][1]&&"JMPIF"!=e[r][0][1]&&"JMPIFNOT"!=e[r][0][1]&&"CALL"!=e[r][0][1]&&"THROWIFNOT"!=e[r][0][1]?o+="operation: ":o+="condition: ",i)o+=e[r][0][0]+":"+e[r][0][1],a>0&&(o+="..."+e[r][a][0]+":"+e[r][a][1]);else for(var h=0;h<e[r].length;h++)o+=e[r][h][0]+":"+e[r][h][1]+"\n";o+="|future\n"}o+="input->Line0\n";for(r=0;r<e.length;r++){a=e[r].length-1;if(1!=e[r].length||"JMP"!=e[r][0][1]&&"JMPIF"!=e[r][0][1]&&"JMPIFNOT"!=e[r][0][1]&&"CALL"!=e[r][0][1]&&"THROWIFNOT"!=e[r][0][1])o+="Line"+e[r][0][0]+"->","RET"==e[r][a][1]?o+="ret\n":"THROW"==e[r][a][1]?o+="throw\n":r==e.length-1?o+="none\n":o+="Line"+e[r+1][0][0]+"\n";else{o+="Line"+e[r][0][0]+"(no)->","RET"==e[r][a][1]?o+="ret\n":"THROW"==e[r][a][1]?o+="throw\n":r==e.length-1?o+="none\n":o+="Line"+e[r+1][0][0]+"\n",o+="Line"+e[r][0][0]+"(yes)->";var u=s.findLineOnOplist(e[r][0][0],t);o+=u<0?"ERROR_Line_Not_Found\n":"Line"+u+"\n"}}return o},s.removeOP=function(e,t){e.splice(t,1);for(var n=t;n<e.length;n++)e[n].byteline-=1;for(var i=0,o=0,r=(n=t-1,1);n>0;){if("J"==e[n].opname[0]||"65"==e[n].hexcode)if(r<=(h=s.byteArray2ToInt16(s.littleHexStringToBigByteArray(e[n].args)))-2){i++,h-=1;var a=s.bigByteArray2TolittleHexString(s.int16ToByteArray2(h));e[n].args=a,e[n].comment="# "+h}r+=e[n].size,n--}for(n=t,r=1;n<e.length;){var h;if("J"==e[n].opname[0]||"65"==e[n].hexcode)if((h=s.byteArray2ToInt16(s.littleHexStringToBigByteArray(e[n].args)))<=-r){o++,h+=1;a=s.bigByteArray2TolittleHexString(s.int16ToByteArray2(h));e[n].args=a,e[n].comment="# "+h}r+=e[n].size,n++}return o+i},s.removeNOP=function(e){for(var t=0,n=0;n<e.length;)"61"==e[n].hexcode?(t++,s.removeOP(e,n)):n++;return t},s.detectDUPFROMALTSTACK=function(e){for(var t=0,n=0,i=0;i<e.length-2;)"6c"==e[i].hexcode&&"76"==e[i+1].hexcode&&"6b"==e[i+2].hexcode?(console.log("will add DUPFROMALTSTACK at i="+i+" oplist="+e.length+"\n"),t++,n+=s.removeOP(e,i),n+=s.removeOP(e,i),e[i].hexcode="6a",e[i].opname="DUPFROMALTSTACK",e[i].comment="#"):i++;return console.log("added DUPFROMALTSTACK: "+t+" Adjusted "+n+" jumps/calls."),t},s.detect_51c100c3=function(e){for(var t=0,n=0,i=0;i<e.length-3;)"51"==e[i].hexcode&&"c1"==e[i+1].hexcode&&"00"==e[i+2].hexcode&&"c3"==e[i+3].hexcode?(console.log("detect_51c100c3 at i="+i+" oplist="+e.length+"\n"),t++,n+=s.removeOP(e,i),n+=s.removeOP(e,i),n+=s.removeOP(e,i),n+=s.removeOP(e,i)):i++;return console.log("detect_51c100c3: "+t+" Adjusted "+n+" jumps/calls."),t},s.removeLastRET=function(e){var t=0,n=0;return"66"==e[e.length-1].hexcode&&(console.log("removeLastRET oplist="+e.length+"\n"),t++,n+=s.removeOP(e,e.length-1)),console.log("removeLastRET: "+t+" Adjusted "+n+" jumps/calls."),t},s.detect_PUSH1_PACK_TOALTSTACK=function(e){for(var t=0,n=0,i=0;i<e.length-7;)if("51"==e[i].hexcode&&"c5"==e[i+1].hexcode&&"6b"==e[i+2].hexcode&&"6a"==e[i+3].hexcode&&"00"==e[i+4].hexcode&&"52"==e[i+5].hexcode&&"7a"==e[i+6].hexcode&&"c4"==e[i+7].hexcode){console.log("found pattern PUSH1 PACK TOALTSTACK at i="+i+" oplist="+e.length+"\n"),t++;for(var o=0;o<5;o++)n+=s.removeOP(e,i+1);e[i+1].hexcode="c1",e[i+1].opname="PACK",e[i+1].comment="#",e[i+2].hexcode="6b",e[i+2].opname="TOALTSTACK",e[i+2].comment="#"}else i++;return console.log("patterns found: "+t+" Adjusted "+n+" jumps/calls."),t},s.detect_TOALTSTACK_DUPFROMALTSTACK=function(e){for(var t=0,n=0;n<e.length-1;)"6b"==e[n].hexcode&&"6a"==e[n+1].hexcode?(console.log("found pattern TOALTSTACK_DUPFROMALTSTACK at i="+n+" oplist="+e.length+"\n"),t++,e[n].hexcode="76",e[n].opname="DUP",e[n].comment="#",e[n+1].hexcode="6b",e[n+1].opname="TOALTSTACK",e[n+1].comment="#"):n++;return console.log("patterns found: "+t+" Adjusted 0 jumps/calls."),t},s.detect_DUP_TOALT_FROM_ALT_DROP=function(e){for(var t=0,n=0,i=0,o=-1;i<e.length-3;){if(o=-1,"76"==e[i].hexcode&&"6b"==e[i+1].hexcode){for(var r=i+2;r<e.length;r++){if("6c"==e[r].hexcode&&"75"==e[r+1].hexcode){o=r;break}if(r-i>5)break}if(o>0)for(r=i+2;r<o;r++)if("00"!=e[r].hexcode&&"c3"!=e[r].hexcode&&"21"!=e[r].hexcode&&"ac"!=e[r].hexcode){o=-1;break}}o>0?(console.log("found pattern DUP_ALTSTACK_DROP at i="+i+" oplist="+e.length+"\n"),t++,n+=s.removeOP(e,i),n+=s.removeOP(e,i),n+=s.removeOP(e,o-2),n+=s.removeOP(e,o-2)):i++}return console.log("patterns found: "+t+" Adjusted "+n+" jumps/calls."),t},s.inlineSWAP=function(e){for(var t=0,n=0,i=0;i<e.length-2;){var o=parseInt(e[i].hexcode,16),r=0==o||o>=79&&o<=96,a=parseInt(e[i+1].hexcode,16);if(r&&(0==a||a>=79&&a<=96)&&"7c"==e[i+2].hexcode){console.log("will inline SWAP i="+(i+2)+" oplist="+e.length+"\n"),t++,n+=s.removeOP(e,i+2);var h=e[i];e[i]=e[i+1],e[i+1]=h}else i++}return console.log("inlined SWAP: "+t+" Adjusted "+n+" jumps/calls."),t},s.optimizeAVM=function(e,t=!1){console.log("starting optimizer");var n=s.removeNOP(e),i=s.detectDUPFROMALTSTACK(e),o=s.inlineSWAP(e),r=s.detect_PUSH1_PACK_TOALTSTACK(e),a=s.detect_TOALTSTACK_DUPFROMALTSTACK(e),h=s.detect_DUP_TOALT_FROM_ALT_DROP(e),u=s.detect_51c100c3(e);return t&&s.removeLastRET(e),n+i+o+r+a+h+u+0},s.getAVMFromList=function(e){var t="",n=0;for(n=0;n<e.length;n++)t+=e[n].hexcode+e[n].args;return t},e.exports={AvmOptimizer:s,NeoOpcode:n}}()}])});