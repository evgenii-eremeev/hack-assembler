const R = require('ramda');
const { DEST, COMP, JUMP } = require('../core/mappings');
const { MAX_UNSIGNED_15_BIT } = require('../core/constants');
const { lines } = require('../util/util');

const LABEL_REGEX = /^\((.+)\)$/;
const A_INSTRUCTION_NUMBER_REGEX = /^@([0-9])+/;
const A_INSTRUCTION_SYMBOL_REGEX = /^@[^0-9]\w*/;

function getCParts(line) {
  const eqIndex = line.indexOf('=');
  const semiIndex = line.indexOf(';');
  const dest = eqIndex !== -1 ? line.slice(0, eqIndex) : 'null';
  const jump =
    semiIndex !== -1 ? line.slice(semiIndex + 1, line.length) : 'null';
  const compStart = eqIndex !== -1 ? eqIndex + 1 : 0;
  const compEnd = semiIndex !== -1 ? semiIndex : line.length;
  const comp = line.slice(compStart, compEnd);

  return [dest, comp, jump];
}

function validateCLine(line) {
  const [dest, comp, jump] = getCParts(line);

  const isDestValid = dest in DEST;
  const isCompValid = comp in COMP;
  const isJumpValid = jump in JUMP;

  if (!isDestValid)
    throw new Error(`Dest "${dest}" in not valid in line: "${line}"`);
  if (!isCompValid)
    throw new Error(`Comp "${comp}" in not valid in line: "${line}"`);
  if (!isJumpValid)
    throw new Error(`Jump "${jump}" in not valid in line: "${line}"`);
}

function clean(str) {
  return str.replace(/\/\/.+/, '').trim();
}

const validateALine = R.pipe(
  getAValue,
  validate15bitSignedNumber
);

function getType(line) {
  if (LABEL_REGEX.test(line)) {
    return 'label';
  } else if (A_INSTRUCTION_NUMBER_REGEX.test(line)) {
    validateALine(line);
    return 'a-number';
  } else if (A_INSTRUCTION_SYMBOL_REGEX.test(line)) {
    return 'a-symbol';
  } else {
    validateCLine(line);
    return 'c';
  }
}

function validate15bitSignedNumber(num) {
  if (num > MAX_UNSIGNED_15_BIT) {
    throw new Error('Register A is out of bounds');
  }
}

function getAValue(line) {
  const value = line.slice(1);
  return A_INSTRUCTION_NUMBER_REGEX.test(line) ? Number(value) : value;
}

function parseTypeALine(line) {
  const valueType = A_INSTRUCTION_NUMBER_REGEX.test(line) ? 'number' : 'symbol';
  return {
    type: `a-${valueType}`,
    value: getAValue(line),
  };
}

function parseTypeCLine(line) {
  const [dest, comp, jump] = getCParts(line);
  return {
    type: 'c',
    dest,
    comp,
    jump,
  };
}

function parseTypeLabelLine(line) {
  return {
    type: 'label',
    value: line.slice(1, -1),
  };
}

function parseLine(line, count) {
  line = clean(line);
  if (!line.length) return null;

  let type;
  try {
    type = getType(line);
  } catch (error) {
    throw new Error(`PARSE_ERROR. Line: ${count}. ${error.message}`);
  }

  switch (type) {
    case 'a-number':
    case 'a-symbol':
      return parseTypeALine(line);
    case 'c':
      return parseTypeCLine(line);
    case 'label':
      return parseTypeLabelLine(line);
    default:
      throw new Error(`UNEXPECTED_ERROR. Line: ${count}. "${line}"`);
  }
}

function parseSource(source, symbolTable) {
  const instructions = [];
  let lineCount = 0;
  for (const line of lines(source)) {
    const instruction = parseLine(line, lineCount);

    if (!instruction) continue;
    switch (instruction.type) {
      case 'label':
        symbolTable.set(instruction.value, instructions.length);
        break;
      case 'a-number':
      case 'a-symbol':
      case 'c':
        instructions.push(instruction);
        break;
    }
    lineCount += 1;
  }
  return instructions;
}

module.exports = {
  parseLine,
  clean,
  getType,
  getCParts,
  validateCLine,
  validateALine,
  parseTypeALine,
  parseTypeCLine,
  parseTypeLabelLine,
  parseSource,
};
