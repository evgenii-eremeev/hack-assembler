const { toMachineCode } = require('../code');
const { MAX_UNSIGNED_15_BIT } = require('../../core/constants');
const { initSymbolTable } = require('../../symbolTable/symbolTable');

describe('code', function() {
  describe('toMachineCode', function() {
    it('should convert "a-number" instructions', function() {
      const symbolTable = initSymbolTable();
      const instructions = [
        { type: 'a-number', value: 0 },
        { type: 'a-number', value: 7 },
        { type: 'a-number', value: MAX_UNSIGNED_15_BIT },
      ];
      const machineCode = [
        '0000 0000 0000 0000',
        '0000 0000 0000 0111',
        '0111 1111 1111 1111',
      ]
        .map(r => r.replace(/ /g, ''))
        .join('\n');
      expect(toMachineCode(instructions, symbolTable)).toBe(machineCode);
    });
    it('should convert "a-symbol" instructions with default symbols', function() {
      const symbolTable = initSymbolTable();
      const instructions = [
        { type: 'a-symbol', value: 'R0' },
        { type: 'a-symbol', value: 'R1' },
        { type: 'a-symbol', value: 'R2' },
        { type: 'a-symbol', value: 'SCREEN' },
        { type: 'a-symbol', value: 'KBD' },
      ];
      const machineCode = [
        '0000 0000 0000 0000',
        '0000 0000 0000 0001',
        '0000 0000 0000 0010',
        '0100 0000 0000 0000',
        '0110 0000 0000 0000',
      ]
        .map(r => r.replace(/ /g, ''))
        .join('\n');
      expect(toMachineCode(instructions, symbolTable)).toBe(machineCode);
    });
    it('should convert "a-symbol" instructions with custom symbols', function() {
      const symbolTable = initSymbolTable();
      const instructions = [
        { type: 'a-symbol', value: 'i' },
        { type: 'a-symbol', value: 'j' },
        { type: 'a-symbol', value: 'k' },
      ];
      const machineCode = [
        '0000 0000 0001 0000',
        '0000 0000 0001 0001',
        '0000 0000 0001 0010',
      ]
        .map(r => r.replace(/ /g, ''))
        .join('\n');
      expect(toMachineCode(instructions, symbolTable)).toBe(machineCode);
    });
    it('should convert "c" instructions', function() {
      const symbolTable = initSymbolTable();
      const instructions = [
        { type: 'c', dest: 'null', comp: 'D&M', jump: 'null' },
        { type: 'c', dest: 'M', comp: 'D&A', jump: 'null' },
        { type: 'c', dest: 'D', comp: '!D', jump: 'JEQ' },
        { type: 'c', dest: 'AMD', comp: '1', jump: 'JMP' },
      ];
      const machineCode = [
        '111 1 000000 000 000',
        '111 0 000000 001 000',
        '111 0 001101 010 010',
        '111 0 111111 111 111',
      ]
        .map(r => r.replace(/ /g, ''))
        .join('\n');
      expect(toMachineCode(instructions, symbolTable)).toBe(machineCode);
    });
  });
});
