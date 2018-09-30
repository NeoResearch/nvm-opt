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
});

test('AvmOptimizer.parseOpcodeList("21031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4aac") equals [(0:PUSHBYTES33:031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4a),(34:CHECKSIG:)]', () => {
  var ops = [];
  AvmOptimizer.parseOpcodeList("21031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4aac", ops);
  expect( NeoOpcode.printList(ops) ).toBe("[(0:PUSHBYTES33:031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4a),(34:CHECKSIG:)]");
});

test('AvmOptimizer.parseOpcodeList(HelloWorldAVM)', () => {
  var avm = "00c56b68164e656f2e53746f726167652e476574436f6e746578740548656c6c6f05576f726c645272680f4e656f2e53746f726167652e5075746c7566";
  var avmOut = "[(0:PUSH0:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:SYSCALL:164e656f2e53746f726167652e476574436f6e74657874),(27:PUSHBYTES5:48656c6c6f),(33:PUSHBYTES5:576f726c64),(39:PUSH2:),(40:XSWAP:),(41:SYSCALL:0f4e656f2e53746f726167652e507574),(58:FROMALTSTACK:),(59:DROP:),(60:RET:)]";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
});

test('AvmOptimizer.parseOpcodeList(CheckWitnessAVM)', () => {
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
});


test('AvmOptimizer.parseOpcodeList(x<10 then true)', () => {
  var avm = "51c56b6c766b00527ac46c766b00c35aa263080051616c756600616c7566";
  var avmOut = "[(0:PUSH1:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:FROMALTSTACK:),(4:DUP:),(5:TOALTSTACK:),(6:PUSH0:),(7:PUSH2:),(8:ROLL:),(9:SETITEM:),(10:FROMALTSTACK:),\
(11:DUP:),(12:TOALTSTACK:),(13:PUSH0:),(14:PICKITEM:),(15:PUSH10:),(16:GTE:),(17:JMPIF:0800),(20:PUSH1:),(0:NOP:),(22:FROMALTSTACK:),(23:DROP:),(24:RET:),(25:PUSH0:),\
(0:NOP:),(27:FROMALTSTACK:),(28:DROP:),(29:RET:)]";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
});


test('AvmOptimizer.parseOpcodeList(x<10 then true) - OLD OPTIMIZER (JMPIF:0600 SEEMS WRONG!)', () => {
  var avm = "51c56b6a00527ac46a00c35aa2630600516c7566006c7566";
  var avmOut = "[(0:PUSH1:),(1:NEWARRAY:),(2:TOALTSTACK:),(3:DUPFROMALTSTACK:),(4:PUSH0:),(5:PUSH2:),(6:ROLL:),(7:SETITEM:),(8:DUPFROMALTSTACK:),(9:PUSH0:),\
(10:PICKITEM:),(11:PUSH10:),(12:GTE:),(13:JMPIF:0600),(16:PUSH1:),(17:FROMALTSTACK:),(18:DROP:),(19:RET:),(20:PUSH0:),(21:FROMALTSTACK:),(22:DROP:),(23:RET:)]";
  var ops = [];
  AvmOptimizer.parseOpcodeList(avm, ops);
  expect( NeoOpcode.printList(ops) ).toBe(avmOut);
});
