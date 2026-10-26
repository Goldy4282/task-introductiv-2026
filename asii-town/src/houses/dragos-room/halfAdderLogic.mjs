export const GATES = Object.freeze(['AND', 'OR', 'NOT', 'XOR']);
export const TRUTH_TABLE = Object.freeze([
  { a: 0, b: 0, sum: 0, carry: 0 },
  { a: 0, b: 1, sum: 1, carry: 0 },
  { a: 1, b: 0, sum: 1, carry: 0 },
  { a: 1, b: 1, sum: 0, carry: 1 },
]);

export function gateOutput(gate, a, b) {
  if (![0, 1].includes(a) || ![0, 1].includes(b)) return null;
  switch (gate) {
    case 'AND': return a & b;
    case 'OR': return a | b;
    case 'XOR': return a ^ b;
    case 'NOT': return 1 - a;
    default: return null;
  }
}

export function circuitReady(circuit) {
  return Boolean(circuit && GATES.includes(circuit.sum) && GATES.includes(circuit.carry));
}

export function circuitOutputs(circuit, a, b) {
  return { sum: gateOutput(circuit?.sum, a, b), carry: gateOutput(circuit?.carry, a, b) };
}

export function verifyCircuit(circuit) {
  if (!circuitReady(circuit)) return { ready: false, passed: false, rows: [] };
  const rows = TRUTH_TABLE.map(({ a, b, sum, carry }) => {
    const actual = circuitOutputs(circuit, a, b);
    return { a, b, sum, carry, actualSum: actual.sum, actualCarry: actual.carry,
      passed: actual.sum === sum && actual.carry === carry };
  });
  return { ready: true, passed: rows.every(row => row.passed), rows };
}
