export function territoryBreakdown(a, b) {
  if (![a, b].every(values => Array.isArray(values) && values.length >= 6 && values.slice(0, 6).every(Number.isFinite))) {
    throw new TypeError('São necessários totais válidos dos dois turnos.');
  }

  const eliminated = a[2] - a[0] - a[1];
  const turnout = b[5] - a[5];
  const invalidReduction = a[3] + a[4] - b[3] - b[4];
  const lula = b[0] - a[0];
  const flavio = b[1] - a[1];
  const combined = lula + flavio;
  const marginChange = (b[0] - b[1]) - (a[0] - a[1]);

  if (eliminated + turnout + invalidReduction !== combined || marginChange !== lula - flavio) {
    throw new Error('Os totais dos turnos não fecham a identidade contábil.');
  }

  return { eliminated, turnout, invalidReduction, lula, flavio, combined, marginChange };
}
