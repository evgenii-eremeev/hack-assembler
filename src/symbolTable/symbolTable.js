const registers = Array(16)
  .fill(null)
  .reduce(
    (acc, _, index) => ({
      ...acc,
      ['R' + index]: index,
    }),
    {}
  );

const PREDEFINED_SYMBOLS = {
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  ...registers,
  SCREEN: 16384,
  KBD: 24576,
};

function initSymbolTable() {
  return new Map(Object.entries(PREDEFINED_SYMBOLS));
}

module.exports = { initSymbolTable, PREDEFINED_SYMBOLS };
