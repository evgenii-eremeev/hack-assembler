const {
  clean,
  parseLine,
  getType,
  getCParts,
  validateCLine,
  validateALine,
  parseTypeALine,
  parseTypeCLine,
  parseTypeLabelLine,
  parseSource,
} = require('../parser');
const { MAX_UNSIGNED_15_BIT } = require('../../core/constants');
const { initSymbolTable } = require('../../symbolTable/symbolTable');

describe('parser', function() {
  describe('clean', function() {
    it('cleans comment part', function() {
      const line = 'D=M              // D = first number';
      expect(clean(line)).toBe('D=M');
    });
    it('cleans entire line if it is a comment', function() {
      const line = '// D = first number';
      expect(clean(line)).toBe('');
    });
  });

  describe('getType', function() {
    it('should return "label" type', function() {
      const line = '(LOOP)';
      expect(getType(line)).toBe('label');
    });
    it('should return "a" type with number value', function() {
      const line = '@123';
      expect(getType(line)).toBe('a-number');
    });
    it('should return "a" type with symbol value', function() {
      const line = '@R1';
      expect(getType(line)).toBe('a-symbol');
    });
    it('should return "c" type', function() {
      const line = 'M=D';
      expect(getType(line)).toBe('c');
    });
    it('should throw if type not determened', function() {
      const line = 'foo';
      expect(() => getType(line)).toThrowError();
    });
  });

  describe('getCParts', function() {
    it('should get parts for a line with only comp part (1)', function() {
      const line = 'D+M';
      const [dest, comp, jump] = getCParts(line);
      expect(dest).toBe('null');
      expect(comp).toBe('D+M');
      expect(jump).toBe('null');
    });
    it('should get parts for a line with only comp part (2)', function() {
      const line = 'D';
      const [dest, comp, jump] = getCParts(line);
      expect(dest).toBe('null');
      expect(comp).toBe('D');
      expect(jump).toBe('null');
    });
    it('should get parts for a line with dest and comp part (1)', function() {
      const line = 'A=D|A';
      const [dest, comp, jump] = getCParts(line);
      expect(dest).toBe('A');
      expect(comp).toBe('D|A');
      expect(jump).toBe('null');
    });
    it('should get parts for a line with comp and jump part (1)', function() {
      const line = 'D;JEQ';
      const [dest, comp, jump] = getCParts(line);
      expect(dest).toBe('null');
      expect(comp).toBe('D');
      expect(jump).toBe('JEQ');
    });
    it('should get parts for a line with dest, comp and jump part (1)', function() {
      const line = 'M=-1;JLT';
      const [dest, comp, jump] = getCParts(line);
      expect(dest).toBe('M');
      expect(comp).toBe('-1');
      expect(jump).toBe('JLT');
    });
  });

  describe('validateCInstruction', function() {
    it('should throw if comp part is invalid', function() {
      const line = 'D++';
      expect(() => validateCLine(line)).toThrowError(/comp/i);
    });
    it('should throw if comp dest is invalid', function() {
      const line = 'C=D';
      expect(() => validateCLine(line)).toThrowError(/dest/i);
    });
    it('should throw if jump part is invalid', function() {
      const line = 'D;JUMPNOW';
      expect(() => validateCLine(line)).toThrowError(/jump/i);
    });
    it('should throw if dest part invalid in full line', function() {
      const line = 'C=-1;JLT';
      expect(() => validateCLine(line)).toThrowError(/dest/i);
    });
    it('should throw if comp part invalid in full line', function() {
      const line = 'A=2+2;JLT';
      expect(() => validateCLine(line)).toThrowError(/comp/i);
    });
    it('should throw if jump part invalid in full line', function() {
      const line = 'A=0;JUMPPP';
      expect(() => validateCLine(line)).toThrowError(/jump/i);
    });
  });

  describe('parseTypeALine', function() {
    it('should parse "a" type line with number', function() {
      const line = '@123';
      const instruction = {
        type: 'a-number',
        value: 123,
      };
      expect(parseTypeALine(line)).toEqual(instruction);
    });
    it('should parse "a" type line  with number (edge 0)', function() {
      const line = `@0`;
      const instruction = {
        type: 'a-number',
        value: 0,
      };
      expect(parseTypeALine(line)).toEqual(instruction);
    });
    it('should parse "a" type line with number (edge max)', function() {
      const line = `@${MAX_UNSIGNED_15_BIT}`;
      const instruction = {
        type: 'a-number',
        value: MAX_UNSIGNED_15_BIT,
      };
      expect(parseTypeALine(line)).toEqual(instruction);
    });
    it('should parse "a" type line with symbol', function() {
      const line = '@R1';
      const instruction = {
        type: 'a-symbol',
        value: 'R1',
      };
      expect(parseTypeALine(line)).toEqual(instruction);
    });
  });
  describe('validateALine', function() {
    it('should throw if value > max', function() {
      const line = `@${MAX_UNSIGNED_15_BIT + 1}`;
      expect(() => validateALine(line)).toThrowError(/out of bounds/i);
    });
  });
  describe('parseTypeCLine', function() {
    it('should parse C type line to instruction (comp)', function() {
      const line = 'D+A';
      const instruction = {
        type: 'c',
        dest: 'null',
        comp: 'D+A',
        jump: 'null',
      };
      expect(parseTypeCLine(line)).toEqual(instruction);
    });
    it('should parse C type line to instruction (dest, comp)', function() {
      const line = 'D=D+A';
      const instruction = {
        type: 'c',
        dest: 'D',
        comp: 'D+A',
        jump: 'null',
      };
      expect(parseTypeCLine(line)).toEqual(instruction);
    });
    it('should parse C type line to instruction (comp, jump)', function() {
      const line = 'D;JMP';
      const instruction = {
        type: 'c',
        dest: 'null',
        comp: 'D',
        jump: 'JMP',
      };
      expect(parseTypeCLine(line)).toEqual(instruction);
    });
    it('should parse C type line to instruction (dest, comp, jump)', function() {
      const line = 'D=D+A;JMP';
      const instruction = {
        type: 'c',
        dest: 'D',
        comp: 'D+A',
        jump: 'JMP',
      };
      expect(parseTypeCLine(line)).toEqual(instruction);
    });
  });

  describe('parseTypeLabelLine', function() {
    it('should parse label line', function() {
      const line = '(LOOP)';
      const instruction = {
        type: 'label',
        value: 'LOOP',
      };
      expect(parseTypeLabelLine(line)).toEqual(instruction);
    });
  });

  describe('parseLine', function() {
    it('should parse "a" line', function() {
      const line = '@123';
      const instruction = {
        type: 'a-number',
        value: 123,
      };
      expect(parseLine(line, 100)).toEqual(instruction);
    });
    it('should parse "c" line', function() {
      const line = 'D=D-1;JEQ';
      const instruction = {
        type: 'c',
        dest: 'D',
        comp: 'D-1',
        jump: 'JEQ',
      };
      expect(parseLine(line, 100)).toEqual(instruction);
    });
    it('should parse "label" line', function() {
      const line = '(END_LOOP)';
      const instruction = {
        type: 'label',
        value: 'END_LOOP',
      };
      expect(parseLine(line, 100)).toEqual(instruction);
    });
    it('should throw error for invalid "a" line', function() {
      const line = `@${MAX_UNSIGNED_15_BIT + 1}`;
      expect(() => parseLine(line, 100)).toThrowErrorMatchingInlineSnapshot(
        `"PARSE_ERROR. Line: 100. Register A is out of bounds"`
      );
    });
    it('should throw error for invalid "c" line', function() {
      const line = 'C=A;J';
      expect(() => parseLine(line, 100)).toThrowErrorMatchingInlineSnapshot(
        `"PARSE_ERROR. Line: 100. Dest \\"C\\" in not valid in line: \\"C=A;J\\""`
      );
    });
    it('should clean the line before parsing', function() {
      const line = 'D=D+1   // hello world';
      const instruction = {
        type: 'c',
        dest: 'D',
        comp: 'D+1',
        jump: 'null',
      };
      expect(parseLine(line, 100)).toEqual(instruction);
    });
    it('should return null instruction for commnets', function() {
      const line = '// whole line comment';
      const instruction = null;
      expect(parseLine(line, 100)).toEqual(instruction);
    });
  });

  describe('parseSource', function() {
    it('should parse simple source code', function() {
      const source = `
        @5
        D=A
        @6
        D=D+A
        @0
        M=D
      `;
      const instructions = [
        { type: 'a-number', value: 5 },
        { type: 'c', dest: 'D', comp: 'A', jump: 'null' },
        { type: 'a-number', value: 6 },
        { type: 'c', dest: 'D', comp: 'D+A', jump: 'null' },
        { type: 'a-number', value: 0 },
        { type: 'c', dest: 'M', comp: 'D', jump: 'null' },
      ];
      const symbolTable = initSymbolTable();
      expect(parseSource(source, symbolTable)).toEqual(instructions);
    });
    it('should parse simple source code (with comments)', function() {
      const source = `
        // adds 5 and 6
        // puts result in M[0]
        @5 // five
        D=A
        @6 // six
        D=D+A
        @0 // M[0]
        M=D
      `;
      const instructions = [
        { type: 'a-number', value: 5 },
        { type: 'c', dest: 'D', comp: 'A', jump: 'null' },
        { type: 'a-number', value: 6 },
        { type: 'c', dest: 'D', comp: 'D+A', jump: 'null' },
        { type: 'a-number', value: 0 },
        { type: 'c', dest: 'M', comp: 'D', jump: 'null' },
      ];
      const symbolTable = initSymbolTable();
      expect(parseSource(source, symbolTable)).toEqual(instructions);
    });
    it('should parse source code with labels', function() {
      const source = `
        (PROGRAMM)
          @5
          D=A
          @6
          D=D+A
        (END)
          @0
          M=D
      `;
      const instructions = [
        { type: 'a-number', value: 5 },
        { type: 'c', dest: 'D', comp: 'A', jump: 'null' },
        { type: 'a-number', value: 6 },
        { type: 'c', dest: 'D', comp: 'D+A', jump: 'null' },
        { type: 'a-number', value: 0 },
        { type: 'c', dest: 'M', comp: 'D', jump: 'null' },
      ];
      const symbolTable = initSymbolTable();
      expect(parseSource(source, symbolTable)).toEqual(instructions);
      expect(symbolTable.get('PROGRAMM')).toBe(0);
      expect(symbolTable.get('END')).toBe(4);
    });
    it('should parse source code with variables', function() {
      const source = `
        @R0
        D=M
        @R1
        D=D+M
        @R2
        M=D
      `;
      const instructions = [
        { type: 'a-symbol', value: 'R0' },
        { type: 'c', dest: 'D', comp: 'M', jump: 'null' },
        { type: 'a-symbol', value: 'R1' },
        { type: 'c', dest: 'D', comp: 'D+M', jump: 'null' },
        { type: 'a-symbol', value: 'R2' },
        { type: 'c', dest: 'M', comp: 'D', jump: 'null' },
      ];
      const symbolTable = initSymbolTable();
      expect(parseSource(source, symbolTable)).toEqual(instructions);
    });
  });
});
