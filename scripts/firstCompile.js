const path = require('path');
const fs = require('fs');
const solc = require('solc');
const contractName = 'TestContract.sol';
const chalck = require('chalk');
const contractPath = path.resolve(__dirname, '../contracts', contractName);
const source = fs.readFileSync(contractPath, 'utf8');

const compilerInput = {
  language: 'Solidity',
  sources: {
    'TestContract.sol': {
      content: source
    }
  },
  settings: {
    optimizer: {
      enabled: true,
    },
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
}

const inputString = JSON.stringify(compilerInput);
const output = JSON.parse(solc.compile(inputString));
const contractEVM = output.contracts[contractName]['TestContract']['evm'];
const bytecode = contractEVM['bytecode']['object'];
const gasEstimateTotal = contractEVM['gasEstimates']['creation']['totalCost'];
const gasEstimateExecution = contractEVM['gasEstimates']['creation']['executionCost'];

console.log(chalck.yellow('Total Gas Execution:'))
console.log(chalck.green(gasEstimateExecution));

console.log(chalck.yellow('Total Gas Estimate:'))
console.log(chalck.green(gasEstimateTotal));

console.log(chalck.yellow('Bytecode:'))
console.log(chalck.green(bytecode));