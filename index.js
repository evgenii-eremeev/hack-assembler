const fs = require('fs');
const { readFile, writeFile } = fs.promises;
const path = require('path');

const { parseSource } = require('./src/parser/parser');
const { toMachineCode } = require('./src/code/code');
const { initSymbolTable } = require('./src/symbolTable/symbolTable');
const symbolTable = initSymbolTable();

const fileName = path.parse(process.argv[2]).name;
const asmPath = path.resolve(process.cwd(), process.argv[2]);
const hackPath = path.resolve(process.cwd(), fileName + '.hack');

async function main() {
  const sourceCode = await readFile(asmPath, 'utf8');
  const instructions = parseSource(sourceCode, symbolTable);
  const machineCode = toMachineCode(instructions, symbolTable);
  await writeFile(hackPath, machineCode, 'utf8');
}

main().catch(console.error);
