const AvmOptimizer = require('./AvmOptimizer').AvmOptimizer;
const NeoOpcode = require('./AvmOptimizer').NeoOpcode;

// =========================================
// testing byteArray2ToInt16

test('AvmOptimizer.byteArray2ToInt16([255]) equals 0', () => {
  expect(AvmOptimizer.byteArray2ToInt16([255])).toBe(0);
});

test('AvmOptimizer.byteArray2ToInt16([]) equals 0', () => {
  expect(AvmOptimizer.byteArray2ToInt16([])).toBe(0);
});

test('AvmOptimizer.byteArray2ToInt16([0,1]) equals 1', () => {
  expect(AvmOptimizer.byteArray2ToInt16([0,1])).toBe(1);
});

test('AvmOptimizer.byteArray2ToInt16([0,127]) equals 127', () => {
  expect(AvmOptimizer.byteArray2ToInt16([0,127])).toBe(127);
});

test('AvmOptimizer.byteArray2ToInt16([0,255]) equals 255', () => {
  expect(AvmOptimizer.byteArray2ToInt16([0,255])).toBe(255);
});

test('AvmOptimizer.byteArray2ToInt16([1,0]) equals 256', () => {
  expect(AvmOptimizer.byteArray2ToInt16([1,0])).toBe(256);
});

test('AvmOptimizer.byteArray2ToInt16([127,0]) equals 32512', () => {
  expect(AvmOptimizer.byteArray2ToInt16([127,0])).toBe(32512);
});

test('AvmOptimizer.byteArray2ToInt16([127,1]) equals 32513', () => {
  expect(AvmOptimizer.byteArray2ToInt16([127,1])).toBe(32513);
});

test('AvmOptimizer.byteArray2ToInt16([127,255]) equals 32767', () => {
  expect(AvmOptimizer.byteArray2ToInt16([127,255])).toBe(32767);
});

test('AvmOptimizer.byteArray2ToInt16([128,0]) equals -32768', () => {
  expect(AvmOptimizer.byteArray2ToInt16([128,0])).toBe(-32768);
});

test('AvmOptimizer.byteArray2ToInt16([128,1]) equals -32767', () => {
  expect(AvmOptimizer.byteArray2ToInt16([128,1])).toBe(-32767);
});

// ============================================
// testing int16ToByteArray2

test('AvmOptimizer.int16ToByteArray2(10) equals [0, 10]', () => {
  expect(AvmOptimizer.int16ToByteArray2(10)).toEqual([0, 10]);
});

test('AvmOptimizer.byteArray2ToInt16(AvmOptimizer.int16ToByteArray2(10)) equals 10', () => {
  expect(AvmOptimizer.byteArray2ToInt16(AvmOptimizer.int16ToByteArray2(10))).toBe(10);
});

test('AvmOptimizer.byteArray2ToInt16(AvmOptimizer.int16ToByteArray2(1000)) equals 1000', () => {
  expect(AvmOptimizer.byteArray2ToInt16(AvmOptimizer.int16ToByteArray2(1000))).toBe(1000);
});

test('AvmOptimizer.byteArray2ToInt16(AvmOptimizer.int16ToByteArray2(-1000)) equals -1000', () => {
  expect(AvmOptimizer.byteArray2ToInt16(AvmOptimizer.int16ToByteArray2(-1000))).toBe(-1000);
});

// =============================================
// testing littleHexStringToBigByteArray and bigByteArray2TolittleHexString

test('AvmOptimizer.littleHexStringToBigByteArray("0102") equals [2, 1]', () => {
  expect(AvmOptimizer.littleHexStringToBigByteArray("0102")).toEqual([2, 1]);
});

test('AvmOptimizer.bigByteArray2TolittleHexString([10, 1]) equals "010a"', () => {
  expect(AvmOptimizer.bigByteArray2TolittleHexString([10, 1])).toEqual("010a");
});

test('AvmOptimizer.littleHexStringToBigByteArray("2f00") equals [0, 47]', () => {
  expect(AvmOptimizer.littleHexStringToBigByteArray("2f00")).toEqual([0, 47]);
});

test('AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray("2f00")) equals 47', () => {
  expect( AvmOptimizer.byteArray2ToInt16(AvmOptimizer.littleHexStringToBigByteArray("2f00")) ).toBe(47);
});


// =============================================
// testing getAVMFromList

test('AvmOptimizer.getAVMFromList([...]) equals "00ac"', () => {
  var ops = [];
  ops.push(new NeoOpcode('00', 'PUSH0'));
  ops.push(new NeoOpcode('ac', 'CHECKSIG'));
  expect(AvmOptimizer.getAVMFromList(ops)).toBe("00ac");
});


// ==============================================
//  testing parseOpcodeList

test('AvmOptimizer.getAVMFromList(AvmOptimizer.parseOpcodeList("00ac")) equals "00ac"', () => {
  var ops = [];
  AvmOptimizer.parseOpcodeList("00ac", ops);
  expect( AvmOptimizer.getAVMFromList(ops)).toBe("00ac");
});

test('AvmOptimizer.parseOpcodeList("00ac") equals [(0:PUSH0:),(0:CHECKSIG:)]', () => {
  var ops = [];
  AvmOptimizer.parseOpcodeList("00ac", ops);
  expect( NeoOpcode.printList(ops) ).toBe("[(0:PUSH0:),(1:CHECKSIG:)]");
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});

test('AvmOptimizer.parseOpcodeList("21031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4aac") equals [(0:PUSHBYTES33:031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4a),(34:CHECKSIG:)]', () => {
  var ops = [];
  AvmOptimizer.parseOpcodeList("21031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4aac", ops);
  expect( NeoOpcode.printList(ops) ).toBe("[(0:PUSHBYTES33:031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4a),(34:CHECKSIG:)]");
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});

test('AvmOptimizer.parseOpcodeList(HelloWorldAVM)', () => {
  var avm = "00c56b68164e656f2e53746f726167652e476574436f6e746578740548656c6c6f05576f726c645272680f4e656f2e53746f726167652e5075746c7566";
  var avmOut = "[(0:PUSH0:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:SYSCALL:164e656f2e53746f726167652e476574436f6e74657874),(27:PUSHBYTES5:48656c6c6f),(33:PUSHBYTES5:576f726c64),(39:PUSH2:),(40:XSWAP:),(41:SYSCALL:0f4e656f2e53746f726167652e507574),(58:FROMALTSTACK:),(59:DROP:),(60:RET:)]";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});

test('AvmOptimizer.parseOpcodeList(CheckWitnessAVM) - Seems wrong.. previous optimization', () => {
  var avm = "00c56b1423ba2703c53263e8d6e522dc32203339dcd8eee968184e656f2e\
52756e74696d652e436865636b5769746e657373642f0051c576000f4f57\
4e45522069732063616c6c6572c468124e656f2e52756e74696d652e4e6f74696679516c7566006c7566";
  var avmOut = "[(0:PUSH0:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:PUSHBYTES20:23ba2703c53263e8d6e522dc32203339dcd8eee9),\
(24:SYSCALL:184e656f2e52756e74696d652e436865636b5769746e657373),(50:JMPIFNOT:2f00),(53:PUSH1:),(54:NEWARRAY:),(55:DUP:),(56:PUSH0:),\
(57:PUSHBYTES15:4f574e45522069732063616c6c6572),(73:SETITEM:),(74:SYSCALL:124e656f2e52756e74696d652e4e6f74696679),(94:PUSH1:),(95:FROMALTSTACK:),\
(96:DROP:),(97:RET:),(98:PUSH0:),(99:FROMALTSTACK:),(100:DROP:),(101:RET:)]";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
});

test('AvmOptimizer.parseOpcodeList(WhileTrue)', () => {
  var avm = "00c56b620000";
  var avmOut = "[(0:PUSH0:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:JMP:0000)]";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});


test('AvmOptimizer.parseOpcodeList(x<10 then true)', () => {
  var avm = "51c56b6c766b00527ac46c766b00c35aa263080051616c756600616c7566";
  var avmOut = "[(0:PUSH1:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:FROMALTSTACK:),(4:DUP:),(5:TOALTSTACK:),(6:PUSH0:),(7:PUSH2:),(8:ROLL:),(9:SETITEM:),(10:FROMALTSTACK:),\
(11:DUP:),(12:TOALTSTACK:),(13:PUSH0:),(14:PICKITEM:),(15:PUSH10:),(16:GTE:),(17:JMPIF:0800),(20:PUSH1:),(21:NOP:),(22:FROMALTSTACK:),(23:DROP:),(24:RET:),(25:PUSH0:),\
(26:NOP:),(27:FROMALTSTACK:),(28:DROP:),(29:RET:)]";

  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});


test('AvmOptimizer.parseOpcodeList(x<10 then true) - OLD OPTIMIZER (JMPIF:0600 SEEMS WRONG!)', () => {
  var avm = "51c56b6a00527ac46a00c35aa2630600516c7566006c7566";
  var avmOut = "[(0:PUSH1:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:DUPFROMALTSTACK:),(4:PUSH0:),(5:PUSH2:),(6:ROLL:),(7:SETITEM:),(8:DUPFROMALTSTACK:),(9:PUSH0:),\
(10:PICKITEM:),(11:PUSH10:),(12:GTE:),(13:JMPIF:0600),(16:PUSH1:),(17:FROMALTSTACK:),(18:DROP:),(19:RET:),(20:PUSH0:),(21:FROMALTSTACK:),(22:DROP:),(23:RET:)]";

  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});


// ================================================================
//  computeJumpsFrom

test('AvmOptimizer.computeJumpsFrom (x<10 then true)', () => {
  var avm = "51c56b6c766b00527ac46c766b00c35aa263080051616c756600616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsCompare = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []], [5, "TOALTSTACK", [], []],
[6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "FROMALTSTACK", [], []], [11, "DUP", [], []], [12, "TOALTSTACK", [], []],
[13, "PUSH0", [], []], [14, "PICKITEM", [], []], [15, "PUSH10", [], []], [16, "GTE", [], []], [17, "JMPIF", [], []], [20, "PUSH1", [], []], [21, "NOP", [], []],
[22, "FROMALTSTACK", [], []], [23, "DROP", [], []], [24, "RET", [], []], [25, "PUSH0", [17], []], [26, "NOP", [], []], [27, "FROMALTSTACK", [], []], [28, "DROP", [], []],
[29, "RET", [], []]];

  expect( opsJump ).toEqual( opsCompare );
});


test('AvmOptimizer.parseOpcodeList(WhileTrue)', () => {
  var avm = "00c56b620000";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsCompare = [[0, "PUSH0", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "JMP", [3], []]];
  expect( opsJump ).toEqual( opsCompare );
});


test('AvmOptimizer.parseOpcodeList( SimpleCall )', () => {
  var avm = "51c56b6c766b00527ac46c766b00c361650700616c756651c56b6c766b00527ac451616c7566";
  var avmOut = "[(0:PUSH1:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:FROMALTSTACK:),(4:DUP:),(5:TOALTSTACK:),(6:PUSH0:),(7:PUSH2:),(8:ROLL:),(9:SETITEM:),(10:FROMALTSTACK:),\
(11:DUP:),(12:TOALTSTACK:),(13:PUSH0:),(14:PICKITEM:),(15:NOP:),(16:CALL:0700),(19:NOP:),(20:FROMALTSTACK:),(21:DROP:),(22:RET:),(23:PUSH1:),(24:NEWARRAY:),(25:TOALTSTACK:),\
(26:FROMALTSTACK:),(27:DUP:),(28:TOALTSTACK:),(29:PUSH0:),(30:PUSH2:),(31:ROLL:),(32:SETITEM:),(33:PUSH1:),(34:NOP:),(35:FROMALTSTACK:),(36:DROP:),(37:RET:)]";

  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  //AvmOptimizer.computeJumpsFrom(ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});


test('AvmOptimizer.parseOpcodeList( SimpleCall )', () => {
  var avm = "51c56b6c766b00527ac46c766b00c361650700616c756651c56b6c766b00527ac451616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsCompare = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []], [5, "TOALTSTACK", [], []],
[6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "FROMALTSTACK", [], []], [11, "DUP", [], []], [12, "TOALTSTACK", [], []],
[13, "PUSH0", [], []], [14, "PICKITEM", [], []], [15, "NOP", [], []], [16, "CALL", [], []], [19, "NOP", [], []], [20, "FROMALTSTACK", [], []], [21, "DROP", [], []],
[22, "RET", [], []], [23, "PUSH1", [], [16]], [24, "NEWARRAY", [], []], [25, "TOALTSTACK", [], []], [26, "FROMALTSTACK", [], []], [27, "DUP", [], []], [28, "TOALTSTACK", [], []],
[29, "PUSH0", [], []], [30, "PUSH2", [], []], [31, "ROLL", [], []], [32, "SETITEM", [], []], [33, "PUSH1", [], []], [34, "NOP", [], []], [35, "FROMALTSTACK", [], []],
[36, "DROP", [], []], [37, "RET", [], []]];

  expect( opsJump ).toEqual( opsCompare );
});


// =====================================================
// Testing simplecall with if inside

test('AvmOptimizer.parseOpcodeList( SimpleCall+If )', () => {
  var avm = "51c56b6c766b00527ac46c766b00c361650700616c756651c56b6c766b00527ac46c766b00c35aa263080000616c756651616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  var avmOut = "[(0:PUSH1:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:FROMALTSTACK:),(4:DUP:),(5:TOALTSTACK:),(6:PUSH0:),(7:PUSH2:),(8:ROLL:),(9:SETITEM:),\
(10:FROMALTSTACK:),(11:DUP:),(12:TOALTSTACK:),(13:PUSH0:),(14:PICKITEM:),(15:NOP:),(16:CALL:0700),(19:NOP:),(20:FROMALTSTACK:),(21:DROP:),(22:RET:),(23:PUSH1:),\
(24:NEWARRAY:),(25:TOALTSTACK:),(26:FROMALTSTACK:),(27:DUP:),(28:TOALTSTACK:),(29:PUSH0:),(30:PUSH2:),(31:ROLL:),(32:SETITEM:),(33:FROMALTSTACK:),(34:DUP:),\
(35:TOALTSTACK:),(36:PUSH0:),(37:PICKITEM:),(38:PUSH10:),(39:GTE:),(40:JMPIF:0800),(43:PUSH0:),(44:NOP:),(45:FROMALTSTACK:),(46:DROP:),(47:RET:),(48:PUSH1:),\
(49:NOP:),(50:FROMALTSTACK:),(51:DROP:),(52:RET:)]";

  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  //AvmOptimizer.computeJumpsFrom(ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
});

test('AvmOptimizer.parseOpcodeList( SimpleCall+If )', () => {
  var avm = "51c56b6c766b00527ac46c766b00c361650700616c756651c56b6c766b00527ac46c766b00c35aa263080000616c756651616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsCompare = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []], [5, "TOALTSTACK", [], []],
[6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "FROMALTSTACK", [], []], [11, "DUP", [], []], [12, "TOALTSTACK", [], []],
[13, "PUSH0", [], []], [14, "PICKITEM", [], []], [15, "NOP", [], []], [16, "CALL", [], []], [19, "NOP", [], []], [20, "FROMALTSTACK", [], []], [21, "DROP", [], []],
[22, "RET", [], []], [23, "PUSH1", [], [16]], [24, "NEWARRAY", [], []], [25, "TOALTSTACK", [], []], [26, "FROMALTSTACK", [], []], [27, "DUP", [], []], [28, "TOALTSTACK", [], []],
[29, "PUSH0", [], []], [30, "PUSH2", [], []], [31, "ROLL", [], []], [32, "SETITEM", [], []], [33, "FROMALTSTACK", [], []], [34, "DUP", [], []], [35, "TOALTSTACK", [], []],
[36, "PUSH0", [], []], [37, "PICKITEM", [], []], [38, "PUSH10", [], []], [39, "GTE", [], []], [40, "JMPIF", [], []], [43, "PUSH0", [], []], [44, "NOP", [], []],
[45, "FROMALTSTACK", [], []], [46, "DROP", [], []], [47, "RET", [], []], [48, "PUSH1", [40], []], [49, "NOP", [], []], [50, "FROMALTSTACK", [], []], [51, "DROP", [], []],
[52, "RET", [], []]];

  expect( opsJump ).toEqual( opsCompare );
});

// =====================================================================
// breakJumpModules

test('breakJumpModules (x<10 then true)', () => {
  var avm = "51c56b6c766b00527ac46c766b00c35aa263080051616c756600616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []],
[5, "TOALTSTACK", [], []], [6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "FROMALTSTACK", [], []],
[11, "DUP", [], []], [12, "TOALTSTACK", [], []], [13, "PUSH0", [], []], [14, "PICKITEM", [], []], [15, "PUSH10", [], []], [16, "GTE", [], []],
[17, "JMPIF", [], []], [20, "PUSH1", [], []], [21, "NOP", [], []], [22, "FROMALTSTACK", [], []], [23, "DROP", [], []], [24, "RET", [], []]];
  var opsCompare1 = [[25, "PUSH0", [17], []], [26, "NOP", [], []], [27, "FROMALTSTACK", [], []], [28, "DROP", [], []], [29, "RET", [], []]];

  expect( opsModules.length ).toEqual( 2 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});

test('breakJumpModules (whileTrue)', () => {
  var avm = "00c56b620000";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH0", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []]];
  var opsCompare1 = [[3, "JMP", [3], []]];

  expect( opsModules.length ).toEqual( 2 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


test('breakJumpModules (x<10 then true) - OLD OPTIMIZER (JMPIF:0600 SEEMS WRONG!)', () => {
  var avm = "51c56b6a00527ac46a00c35aa2630600516c7566006c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "DUPFROMALTSTACK", [], []], [4, "PUSH0", [], []],
[5, "PUSH2", [], []], [6, "ROLL", [], []], [7, "SETITEM", [], []], [8, "DUPFROMALTSTACK", [], []], [9, "PUSH0", [], []], [10, "PICKITEM", [], []],
[11, "PUSH10", [], []], [12, "GTE", [], []], [13, "JMPIF", [], []], [16, "PUSH1", [], []], [17, "FROMALTSTACK", [], []], [18, "DROP", [], []]];
  var opsCompare1 = [[19, "RET", [13], []], [20, "PUSH0", [], []], [21, "FROMALTSTACK", [], []], [22, "DROP", [], []], [23, "RET", [], []]];

  expect( opsModules.length ).toEqual( 2 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


test('breakJumpModules ( SimpleCall+If )', () => {
  var avm = "51c56b6c766b00527ac46c766b00c361650700616c756651c56b6c766b00527ac46c766b00c35aa263080000616c756651616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []],
[5, "TOALTSTACK", [], []], [6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "FROMALTSTACK", [], []],
[11, "DUP", [], []], [12, "TOALTSTACK", [], []], [13, "PUSH0", [], []], [14, "PICKITEM", [], []], [15, "NOP", [], []], [16, "CALL", [], []],
[19, "NOP", [], []], [20, "FROMALTSTACK", [], []], [21, "DROP", [], []], [22, "RET", [], []]];
  var opsCompare1 = [[23, "PUSH1", [], [16]], [24, "NEWARRAY", [], []], [25, "TOALTSTACK", [], []], [26, "FROMALTSTACK", [], []], [27, "DUP", [], []],
[28, "TOALTSTACK", [], []], [29, "PUSH0", [], []], [30, "PUSH2", [], []], [31, "ROLL", [], []], [32, "SETITEM", [], []], [33, "FROMALTSTACK", [], []],
[34, "DUP", [], []], [35, "TOALTSTACK", [], []], [36, "PUSH0", [], []], [37, "PICKITEM", [], []], [38, "PUSH10", [], []], [39, "GTE", [], []],
[40, "JMPIF", [], []], [43, "PUSH0", [], []], [44, "NOP", [], []], [45, "FROMALTSTACK", [], []], [46, "DROP", [], []], [47, "RET", [], []]];
  var opsCompare2 = [[48, "PUSH1", [40], []], [49, "NOP", [], []], [50, "FROMALTSTACK", [], []], [51, "DROP", [], []], [52, "RET", [], []]];

  expect( opsModules.length ).toEqual( 3 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( opsModules[2] ).toEqual( opsCompare2 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );

});


test('breakJumpModules ( CheckWitness ) - Seems wrong too... previous optimization', () => {
  var avm = "00c56b1423ba2703c53263e8d6e522dc32203339dcd8eee968184e656f2e\
52756e74696d652e436865636b5769746e657373642f0051c576000f4f57\
4e45522069732063616c6c6572c468124e656f2e52756e74696d652e4e6f74696679516c7566006c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH0", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "PUSHBYTES20", [], []], [24, "SYSCALL", [], []],
[50, "JMPIFNOT", [], []], [53, "PUSH1", [], []], [54, "NEWARRAY", [], []], [55, "DUP", [], []], [56, "PUSH0", [], []], [57, "PUSHBYTES15", [], []],
[73, "SETITEM", [], []], [74, "SYSCALL", [], []], [94, "PUSH1", [], []], [95, "FROMALTSTACK", [], []], [96, "DROP", [], []]];
  var opsCompare1 = [[97, "RET", [50], []], [98, "PUSH0", [], []], [99, "FROMALTSTACK", [], []], [100, "DROP", [], []], [101, "RET", [], []]];

  expect( opsModules.length ).toEqual( 2 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


test('breakJumpModules ( CheckWitness )', () => {
  var avm = "00c56b611423ba2703c53263e8d6e522dc32203339dcd8eee96168184e656f2e52756e74696d652e436865636b5769746e65737364320051c576000f\
4f574e45522069732063616c6c6572c46168124e656f2e52756e74696d652e4e6f7469667951616c756600616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH0", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "NOP", [], []], [4, "PUSHBYTES20", [], []],
[25, "NOP", [], []], [26, "SYSCALL", [], []], [52, "JMPIFNOT", [], []], [55, "PUSH1", [], []], [56, "NEWARRAY", [], []], [57, "DUP", [], []],
[58, "PUSH0", [], []], [59, "PUSHBYTES15", [], []], [75, "SETITEM", [], []], [76, "NOP", [], []], [77, "SYSCALL", [], []], [97, "PUSH1", [], []],
[98, "NOP", [], []], [99, "FROMALTSTACK", [], []], [100, "DROP", [], []], [101, "RET", [], []]];
  var opsCompare1 = [[102, "PUSH0", [52], []], [103, "NOP", [], []], [104, "FROMALTSTACK", [], []], [105, "DROP", [], []], [106, "RET", [], []]];

  expect( opsModules.length ).toEqual( 2 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


// ================================================================
// breakAllJumpModules

test('breakAllJumpModules (x<10 then true)', () => {
  var avm = "51c56b6c766b00527ac46c766b00c35aa263080051616c756600616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []],
[5, "TOALTSTACK", [], []], [6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "FROMALTSTACK", [], []],
[11, "DUP", [], []], [12, "TOALTSTACK", [], []], [13, "PUSH0", [], []], [14, "PICKITEM", [], []], [15, "PUSH10", [], []], [16, "GTE", [], []]];
  var opsCompare1 = [[17, "JMPIF", [], []]];
  var opsCompare2 = [[20, "PUSH1", [], []], [21, "NOP", [], []], [22, "FROMALTSTACK", [], []], [23, "DROP", [], []], [24, "RET", [], []]];
  var opsCompare3 = [[25, "PUSH0", [17], []], [26, "NOP", [], []], [27, "FROMALTSTACK", [], []], [28, "DROP", [], []], [29, "RET", [], []]];

  expect( opsModules.length ).toEqual( 4 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( opsModules[2] ).toEqual( opsCompare2 );
  expect( opsModules[3] ).toEqual( opsCompare3 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


test('breakAllJumpModules (while true)', () => {
  var avm = "00c56b620000";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH0", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []]];
  var opsCompare1 = [[3, "JMP", [3], []]];

  expect( opsModules.length ).toEqual( 2 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


test('breakAllJumpModules  (x<10 then true) - OLD OPTIMIZER (JMPIF:0600 SEEMS WRONG!)', () => {
  var avm = "51c56b6a00527ac46a00c35aa2630600516c7566006c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "DUPFROMALTSTACK", [], []], [4, "PUSH0", [], []],
[5, "PUSH2", [], []], [6, "ROLL", [], []], [7, "SETITEM", [], []], [8, "DUPFROMALTSTACK", [], []], [9, "PUSH0", [], []], [10, "PICKITEM", [], []],
[11, "PUSH10", [], []], [12, "GTE", [], []]];
  var opsCompare1 = [[13, "JMPIF", [], []]];
  var opsCompare2 = [[16, "PUSH1", [], []], [17, "FROMALTSTACK", [], []], [18, "DROP", [], []]];
  var opsCompare3 = [[19, "RET", [13], []], [20, "PUSH0", [], []], [21, "FROMALTSTACK", [], []], [22, "DROP", [], []], [23, "RET", [], []]];

  expect( opsModules.length ).toEqual( 4 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( opsModules[2] ).toEqual( opsCompare2 );
  expect( opsModules[3] ).toEqual( opsCompare3 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


test('breakAllJumpModules  (SimpleCall+If)', () => {
  var avm = "51c56b6c766b00527ac46c766b00c361650700616c756651c56b6c766b00527ac46c766b00c35aa263080000616c756651616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []],
[5, "TOALTSTACK", [], []], [6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "FROMALTSTACK", [], []],
[11, "DUP", [], []], [12, "TOALTSTACK", [], []], [13, "PUSH0", [], []], [14, "PICKITEM", [], []], [15, "NOP", [], []]];
  var opsCompare1 = [[16, "CALL", [], []]];
  var opsCompare2 = [[19, "NOP", [], []], [20, "FROMALTSTACK", [], []], [21, "DROP", [], []], [22, "RET", [], []]];
  var opsCompare3 = [[23, "PUSH1", [], [16]], [24, "NEWARRAY", [], []], [25, "TOALTSTACK", [], []], [26, "FROMALTSTACK", [], []], [27, "DUP", [], []],
[28, "TOALTSTACK", [], []], [29, "PUSH0", [], []], [30, "PUSH2", [], []], [31, "ROLL", [], []], [32, "SETITEM", [], []], [33, "FROMALTSTACK", [], []],
[34, "DUP", [], []], [35, "TOALTSTACK", [], []], [36, "PUSH0", [], []], [37, "PICKITEM", [], []], [38, "PUSH10", [], []], [39, "GTE", [], []]];
  var opsCompare4 = [[40, "JMPIF", [], []]];
  var opsCompare5 = [[43, "PUSH0", [], []], [44, "NOP", [], []], [45, "FROMALTSTACK", [], []], [46, "DROP", [], []], [47, "RET", [], []]];
  var opsCompare6 = [[48, "PUSH1", [40], []], [49, "NOP", [], []], [50, "FROMALTSTACK", [], []], [51, "DROP", [], []], [52, "RET", [], []]];

  expect( opsModules.length ).toEqual( 7 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( opsModules[2] ).toEqual( opsCompare2 );
  expect( opsModules[3] ).toEqual( opsCompare3 );
  expect( opsModules[4] ).toEqual( opsCompare4 );
  expect( opsModules[5] ).toEqual( opsCompare5 );
  expect( opsModules[6] ).toEqual( opsCompare6 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


test('breakAllJumpModules  (CheckWitness)', () => {
  var avm = "00c56b611423ba2703c53263e8d6e522dc32203339dcd8eee96168184e656f2e52756e74696d652e436865636b5769746e65737364320051c576000f\
4f574e45522069732063616c6c6572c46168124e656f2e52756e74696d652e4e6f7469667951616c756600616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH0", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "NOP", [], []], [4, "PUSHBYTES20", [], []],
[25, "NOP", [], []], [26, "SYSCALL", [], []]];
  var opsCompare1 = [[52, "JMPIFNOT", [], []]];
  var opsCompare2 = [[55, "PUSH1", [], []], [56, "NEWARRAY", [], []], [57, "DUP", [], []], [58, "PUSH0", [], []], [59, "PUSHBYTES15", [], []],
[75, "SETITEM", [], []], [76, "NOP", [], []], [77, "SYSCALL", [], []], [97, "PUSH1", [], []], [98, "NOP", [], []], [99, "FROMALTSTACK", [], []],
[100, "DROP", [], []], [101, "RET", [], []]];
  var opsCompare3 = [[102, "PUSH0", [52], []], [103, "NOP", [], []], [104, "FROMALTSTACK", [], []], [105, "DROP", [], []], [106, "RET", [], []]];

  expect( opsModules.length ).toEqual( 4 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( opsModules[2] ).toEqual( opsCompare2 );
  expect( opsModules[3] ).toEqual( opsCompare3 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});

test('breakAllJumpModules  (factorial 10)', () => {
  var avm = "51c56b6c766b00527ac45a61650700616c756651c56b6c766b00527ac46c766b00c351a063080051616c75666c766b00c36c766b00c351946165daff95616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []],
[5, "TOALTSTACK", [], []], [6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "PUSH10", [], []], [11, "NOP", [], []]];
  var opsCompare1 = [[12, "CALL", [], []]];
  var opsCompare2 = [[15, "NOP", [], []], [16, "FROMALTSTACK", [], []], [17, "DROP", [], []], [18, "RET", [], []]];
  var opsCompare3 = [[19, "PUSH1", [], [12, 57]], [20, "NEWARRAY", [], []], [21, "TOALTSTACK", [], []], [22, "FROMALTSTACK", [], []], [23, "DUP", [], []],
[24, "TOALTSTACK", [], []], [25, "PUSH0", [], []], [26, "PUSH2", [], []], [27, "ROLL", [], []], [28, "SETITEM", [], []], [29, "FROMALTSTACK", [], []],
[30, "DUP", [], []], [31, "TOALTSTACK", [], []], [32, "PUSH0", [], []], [33, "PICKITEM", [], []], [34, "PUSH1", [], []], [35, "GT", [], []]];
  var opsCompare4 = [[36, "JMPIF", [], []]];
  var opsCompare5 = [[39, "PUSH1", [], []], [40, "NOP", [], []], [41, "FROMALTSTACK", [], []], [42, "DROP", [], []], [43, "RET", [], []]];
  var opsCompare6 = [[44, "FROMALTSTACK", [36], []], [45, "DUP", [], []], [46, "TOALTSTACK", [], []], [47, "PUSH0", [], []], [48, "PICKITEM", [], []],
[49, "FROMALTSTACK", [], []], [50, "DUP", [], []], [51, "TOALTSTACK", [], []], [52, "PUSH0", [], []], [53, "PICKITEM", [], []], [54, "PUSH1", [], []],
[55, "SUB", [], []], [56, "NOP", [], []]];
  var opsCompare7 = [[57, "CALL", [], []]];
  var opsCompare8 = [[60, "MUL", [], []], [61, "NOP", [], []], [62, "FROMALTSTACK", [], []], [63, "DROP", [], []], [64, "RET", [], []]];

  expect( opsModules.length ).toEqual( 9 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( opsModules[2] ).toEqual( opsCompare2 );
  expect( opsModules[3] ).toEqual( opsCompare3 );
  expect( opsModules[4] ).toEqual( opsCompare4 );
  expect( opsModules[5] ).toEqual( opsCompare5 );
  expect( opsModules[6] ).toEqual( opsCompare6 );
  expect( opsModules[7] ).toEqual( opsCompare7 );
  expect( opsModules[8] ).toEqual( opsCompare8 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});


test('breakAllJumpModules  (x<20 throw)', () => {
  var avm = "51c56b6c766b00527ac46c766b00c30114a263050061f06c766b00c3616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);
  var opsCompare0 = [[0, "PUSH1", [], []], [1, "NEWARRAY", [], []], [2, "TOALTSTACK", [], []], [3, "FROMALTSTACK", [], []], [4, "DUP", [], []],
[5, "TOALTSTACK", [], []], [6, "PUSH0", [], []], [7, "PUSH2", [], []], [8, "ROLL", [], []], [9, "SETITEM", [], []], [10, "FROMALTSTACK", [], []],
[11, "DUP", [], []], [12, "TOALTSTACK", [], []], [13, "PUSH0", [], []], [14, "PICKITEM", [], []], [15, "PUSHBYTES1", [], []], [17, "GTE", [], []]];
  var opsCompare1 = [[18, "JMPIF", [], []]]
  var opsCompare2 = [[21, "NOP", [], []], [22, "THROW", [], []]];
  var opsCompare3 = [[23, "FROMALTSTACK", [18], []], [24, "DUP", [], []], [25, "TOALTSTACK", [], []], [26, "PUSH0", [], []], [27, "PICKITEM", [], []],
[28, "NOP", [], []], [29, "FROMALTSTACK", [], []], [30, "DROP", [], []], [31, "RET", [], []]];

  var avmOut = "[(0:PUSH1:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:FROMALTSTACK:),(4:DUP:),(5:TOALTSTACK:),(6:PUSH0:),(7:PUSH2:),(8:ROLL:),(9:SETITEM:),\
(10:FROMALTSTACK:),(11:DUP:),(12:TOALTSTACK:),(13:PUSH0:),(14:PICKITEM:),(15:PUSHBYTES1:14),(17:GTE:),(18:JMPIF:0500),(21:NOP:),(22:THROW:),\
(23:FROMALTSTACK:),(24:DUP:),(25:TOALTSTACK:),(26:PUSH0:),(27:PICKITEM:),(28:NOP:),(29:FROMALTSTACK:),(30:DROP:),(31:RET:)]";

  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
  expect( opsModules.length ).toEqual( 4 );
  expect( opsModules[0] ).toEqual( opsCompare0 );
  expect( opsModules[1] ).toEqual( opsCompare1 );
  expect( opsModules[2] ).toEqual( opsCompare2 );
  expect( opsModules[3] ).toEqual( opsCompare3 );
  expect( AvmOptimizer.joinListModules(opsModules) ).toEqual( opsJump );
});

// ========================================================================
// generateFlowChartFromModules

test('generateFlowChartFromModules  (x<20 throw)', () => {
  var avm = "51c56b6c766b00527ac46c766b00c30114a263050061f06c766b00c3616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);

  var fcCode = "input=>start: Start Script|past\n\
ret=>end: RET|approved\n\
throw=>end: THROW|rejected\n\
none=>end: NONE|approved\n\
Line0=>operation: 0:PUSH1\n\
1:NEWARRAY\n\
2:TOALTSTACK\n\
3:FROMALTSTACK\n\
4:DUP\n\
5:TOALTSTACK\n\
6:PUSH0\n\
7:PUSH2\n\
8:ROLL\n\
9:SETITEM\n\
10:FROMALTSTACK\n\
11:DUP\n\
12:TOALTSTACK\n\
13:PUSH0\n\
14:PICKITEM\n\
15:PUSHBYTES1\n\
17:GTE\n\
|future\n\
Line18=>condition: 18:JMPIF\n\
|future\n\
Line21=>operation: 21:NOP\n\
22:THROW\n\
|future\n\
Line23=>operation: 23:FROMALTSTACK\n\
24:DUP\n\
25:TOALTSTACK\n\
26:PUSH0\n\
27:PICKITEM\n\
28:NOP\n\
29:FROMALTSTACK\n\
30:DROP\n\
31:RET\n\
|future\n\
input->Line0\n\
Line0->Line18\n\
Line18(no)->Line21\n\
Line18(yes)->Line23\n\
Line21->throw\n\
Line23->ret\n";

  expect( AvmOptimizer.generateFlowChartFromModules(opsModules, opsJump, ops) ).toEqual( fcCode );
});


test('generateFlowChartFromModules  (x<20 throw) ellipseContent=true', () => {
  var avm = "51c56b6c766b00527ac46c766b00c30114a263050061f06c766b00c3616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);

  var fcCode = "input=>start: Start Script|past\n\
ret=>end: RET|approved\n\
throw=>end: THROW|rejected\n\
none=>end: NONE|approved\n\
Line0=>operation: 0:PUSH1...17:GTE|future\n\
Line18=>condition: 18:JMPIF|future\n\
Line21=>operation: 21:NOP...22:THROW|future\n\
Line23=>operation: 23:FROMALTSTACK...31:RET|future\n\
input->Line0\n\
Line0->Line18\n\
Line18(no)->Line21\n\
Line18(yes)->Line23\n\
Line21->throw\n\
Line23->ret\n";

  expect( AvmOptimizer.generateFlowChartFromModules(opsModules, opsJump, ops, true) ).toEqual( fcCode );
});


test('generateFlowChartFromModules  (CheckWitness) ellipseContent=true', () => {
  var avm = "00c56b611423ba2703c53263e8d6e522dc32203339dcd8eee96168184e656f2e52756e74696d652e436865636b5769746e65737364320051c576000f\
4f574e45522069732063616c6c6572c46168124e656f2e52756e74696d652e4e6f7469667951616c756600616c7566";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.computeJumpsFrom(ops);
  var opsJump = AvmOptimizer.parseJumpList(ops);
  var opsModules = AvmOptimizer.breakAllJumpModules(opsJump);

  var fcCode = "input=>start: Start Script|past\n\
ret=>end: RET|approved\n\
throw=>end: THROW|rejected\n\
none=>end: NONE|approved\n\
Line0=>operation: 0:PUSH0\n\
1:NEWARRAY\n\
2:TOALTSTACK\n\
3:NOP\n\
4:PUSHBYTES20\n\
25:NOP\n\
26:SYSCALL\n\
|future\n\
Line52=>condition: 52:JMPIFNOT\n\
|future\n\
Line55=>operation: 55:PUSH1\n\
56:NEWARRAY\n\
57:DUP\n\
58:PUSH0\n\
59:PUSHBYTES15\n\
75:SETITEM\n\
76:NOP\n\
77:SYSCALL\n\
97:PUSH1\n\
98:NOP\n\
99:FROMALTSTACK\n\
100:DROP\n\
101:RET\n\
|future\n\
Line102=>operation: 102:PUSH0\n\
103:NOP\n\
104:FROMALTSTACK\n\
105:DROP\n\
106:RET\n\
|future\n\
input->Line0\n\
Line0->Line52\n\
Line52(no)->Line55\n\
Line52(yes)->Line102\n\
Line55->ret\n\
Line102->ret\n";

  expect( AvmOptimizer.generateFlowChartFromModules(opsModules, opsJump, ops, false) ).toEqual( fcCode );
});


// ============================================================
//  testing optimizations

test('getAVMFromList - HelloWorld: Runtime.Notify("oi")', () => {
  var avm = "00c56b51c57600026f69c46168124e656f2e52756e74696d652e4e6f74696679616c7566";
  var avmOut = "[(0:PUSH0:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:PUSH1:),(4:NEWARRAY:),(5:DUP:),(6:PUSH0:),(7:PUSHBYTES2:6f69),(10:SETITEM:),\
(11:NOP:),(12:SYSCALL:124e656f2e52756e74696d652e4e6f74696679),(32:NOP:),(33:FROMALTSTACK:),(34:DROP:),(35:RET:)]";

  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});

test('getAVMFromList - HelloWorld: Runtime.Notify("oi") - optimized', () => {
  var avm = "00c56b51c57600026f69c46168124e656f2e52756e74696d652e4e6f74696679616c7566";
  var avmOut = "[(0:PUSH0:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:PUSH1:),(4:NEWARRAY:),(5:DUP:),(6:PUSH0:),(7:PUSHBYTES2:6f69),(10:SETITEM:),\
(11:SYSCALL:124e656f2e52756e74696d652e4e6f74696679),(31:FROMALTSTACK:),(32:DROP:),(33:RET:)]";

  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  AvmOptimizer.optimizeAVM(ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
});

test('getAVMFromList - CheckWitness', () => {
  var avm = "00c56b611423ba2703c53263e8d6e522dc32203339dcd8eee96168184e656f2e52756e74696d652e436865636b5769746e65737364320051c576000f\
  4f574e45522069732063616c6c6572c46168124e656f2e52756e74696d652e4e6f7469667951616c756600616c7566";
  var avmOutList1 = "[(0:PUSH0:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:NOP:),(4:PUSHBYTES20:23ba2703c53263e8d6e522dc32203339dcd8eee9),(25:NOP:),\
(26:SYSCALL:184e656f2e52756e74696d652e436865636b5769746e657373),(52:JMPIFNOT:3200),(55:PUSH1:),(56:NEWARRAY:),(57:DUP:),(58:PUSH0:),\
(59:PUSHBYTES15:4f574e45522069732063616c6c6572),(75:SETITEM:),(76:NOP:),(77:SYSCALL:124e656f2e52756e74696d652e4e6f74696679),(97:PUSH1:),(98:NOP:),\
(99:FROMALTSTACK:),(100:DROP:),(101:RET:),(102:PUSH0:),(103:NOP:),(104:FROMALTSTACK:),(105:DROP:),(106:RET:)]";
  var avmOutList = "[(0:PUSH0:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:PUSHBYTES20:23ba2703c53263e8d6e522dc32203339dcd8eee9),\
(24:SYSCALL:184e656f2e52756e74696d652e436865636b5769746e657373),(50:JMPIFNOT:2f00),(53:PUSH1:),(54:NEWARRAY:),(55:DUP:),(56:PUSH0:),\
(57:PUSHBYTES15:4f574e45522069732063616c6c6572),(73:SETITEM:),(74:SYSCALL:124e656f2e52756e74696d652e4e6f74696679),(94:PUSH1:),\
(95:FROMALTSTACK:),(96:DROP:),(97:RET:),(98:PUSH0:),(99:FROMALTSTACK:),(100:DROP:),(101:RET:)]";
  var avmOpt = "00c56b1423ba2703c53263e8d6e522dc32203339dcd8eee968184e656f2e52756e74696d652e436865636b5769746e657373642f0051c576000f4f\
574e45522069732063616c6c6572c468124e656f2e52756e74696d652e4e6f74696679516c7566006c7566";
  // THIS OPTIMIZATION SEEMS PROBLEMATIC!! JUST LOOK AT FLUXOGRAM!

  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOutList1);
  AvmOptimizer.optimizeAVM(ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOutList);
  expect( AvmOptimizer.verifyLineNumbers(ops)).toBe(true);
  expect( AvmOptimizer.getAVMFromList(ops) ).toBe(avmOpt);

});
