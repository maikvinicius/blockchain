const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractName = 'StudentsContract.sol';
const contractPath = path.resolve(__dirname, '../contracts', contractName);
const source = fs.readFileSync(contractPath, 'utf8');

const compilerInput = {
  language: 'Solidity',
  sources: {
    'StudentsContract.sol': {
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

const inpuString = JSON.stringify(compilerInput);
const output = JSON.parse(solc.compile(inpuString));
const contractEVM = output.contracts[contractName]['StudentsContract'];

const abiJSON = contractEVM['abi'];
const bytecode = contractEVM['evm']['bytecode']['object'];

module.exports = { abiJSON, bytecode };