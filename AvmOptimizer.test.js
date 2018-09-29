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
  expect( NeoOpcode.printList(ops) ).toBe("[(0:PUSH0:),(0:CHECKSIG:)]");
});
