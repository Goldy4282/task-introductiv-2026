import test from 'node:test';
import assert from 'node:assert/strict';
import { GATES, TRUTH_TABLE, gateOutput, circuitReady, verifyCircuit, circuitOutputs } from '../src/houses/dragos-room/halfAdderLogic.mjs';

test('half-adder specification contains exactly four binary combinations', () => {
  assert.deepEqual(TRUTH_TABLE.map(row => [row.a, row.b]), [[0,0],[0,1],[1,0],[1,1]]);
});

test('gate inventory offers AND, OR, NOT and XOR', () => {
  assert.deepEqual(GATES, ['AND','OR','NOT','XOR']);
  assert.equal(gateOutput('NOT', 0, 1), 1);
  assert.equal(gateOutput('OR', 0, 1), 1);
});

test('test button readiness requires two installed gates, not manual wires', () => {
  assert.equal(circuitReady({ sum: null, carry: null }), false);
  assert.equal(circuitReady({ sum: 'XOR', carry: null }), false);
  assert.equal(circuitReady({ sum: 'XOR', carry: 'AND' }), true);
  assert.equal(circuitReady({ sum: 'INVALID', carry: 'AND' }), false);
});

test('XOR as SUM and AND as CARRY passes all four tests', () => {
  const verified = verifyCircuit({ sum: 'XOR', carry: 'AND' });
  assert.equal(verified.ready, true);
  assert.equal(verified.passed, true);
  assert.equal(verified.rows.length, 4);
  assert(verified.rows.every(row => row.passed));
});

test('wrong gates report failed rows instead of blocking the test button', () => {
  const verified = verifyCircuit({ sum: 'OR', carry: 'AND' });
  assert.equal(verified.ready, true);
  assert.equal(verified.passed, false);
  assert(verified.rows.some(row => !row.passed));
});

test('all gate configurations are checked, unique correct gate pair', () => {
  const passing = GATES.flatMap(sum => GATES.map(carry => ({ sum, carry })))
    .filter(circuit => verifyCircuit(circuit).passed);
  assert.deepEqual(passing, [{ sum: 'XOR', carry: 'AND' }]);
});

test('changing live inputs updates correctly without affecting readiness', () => {
  const circuit = { sum: 'XOR', carry: 'AND' };
  assert.deepEqual(circuitOutputs(circuit, 0, 1), { sum: 1, carry: 0 });
  assert.deepEqual(circuitOutputs(circuit, 1, 1), { sum: 0, carry: 1 });
  assert.equal(circuitReady(circuit), true);
});
