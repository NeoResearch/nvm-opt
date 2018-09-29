const AvmOptimizer = require('./AvmOptimizer').AvmOptimizer;

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
