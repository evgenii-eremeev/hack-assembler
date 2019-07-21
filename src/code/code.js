const { DEST, COMP, JUMP } = require('../core/mappings');

function leftPad(str, len, prefix = '0') {
  let res = str;
  for (let i = str.length; i < len; i++) {
    res = prefix + res;
  }
  return res;
}

function toBin(num, len) {
  return leftPad(num.toString(2), len);
}

function toMachineCode(instructions, symbolTable) {
  let machineCode = '';
  let memoryCounter = 16;
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    switch (instruction.type) {
      case 'a-number':
        machineCode += '0' + toBin(instruction.value, 15);
        break;
      case 'a-symbol':
        if (!symbolTable.has(instruction.value)) {
          symbolTable.set(instruction.value, memoryCounter);
          memoryCounter += 1;
        }
        machineCode += '0' + toBin(symbolTable.get(instruction.value), 15);
        break;
      case 'c': {
        const { dest, comp, jump } = instruction;
        machineCode += '111' + COMP[comp] + DEST[dest] + JUMP[jump];
        break;
      }
      default:
        throw new Error('UNEXPECTED ERROR in intruction:', instruction);
    }
    if (i + 1 !== instructions.length) {
      machineCode += '\n';
    }
  }
  return machineCode;
}

module.exports = { toMachineCode };
