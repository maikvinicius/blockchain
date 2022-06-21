const assert = require('assert');
const Web3 = require('web3');
const { abiJSON, bytecode } = require('../scripts/studentsCompile.js');

const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);

let accounts;
let account_1;
let account_2;
let studentsContract;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  account_1 = accounts[0];
  account_2 = accounts[1];
  studentsContract =
    await new web3.eth.Contract(abiJSON)
      .deploy({ data: "0x" + bytecode })
      .send({ from: account_1, gas: 1000000 });
});

describe('Students Contract', async () => {
  it('Should return a valid student', async () => {
    let name = 'Maik Vinicius';
    let age = 25;

    await studentsContract.methods
      .enrollStudent(name, age)
      .send({ from: account_1, gas: 1000000 });

    let student = await studentsContract.methods
      .getEnrolledStudentByAddress(account_1)
      .call();

    assert.strictEqual(student[0], name);
    assert.strictEqual(student[1], age.toString());
  });
  it('Should return the default values when the student is not found', async () => {
    let student =
      await studentsContract.methods
        .getEnrolledStudentByAddress(account_2)
        .call();

    assert.strictEqual(student[0], '');
    assert.strictEqual(student[1], '0');
  });
});