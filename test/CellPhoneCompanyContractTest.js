const assert = require('assert');
const Web3 = require('web3');
const { abiJSON, bytecode } = require('../scripts/cellPhoneCompanyCompile.js');

const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);

let accounts;
let account_1;
let account_2;
let cellPhoneCompanyContracts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  account_1 = accounts[0];
  account_2 = accounts[1];

  cellPhoneCompanyContracts =
    await new web3.eth.Contract(abiJSON)
      .deploy({ data: "0x" + bytecode })
      .send({ from: account_1, gas: 3000000 });
});

describe('CellPhone Company Contract', async () => {
  it('Should return a valid customer', async () => {
    const name = 'Maik Vinicius';

    await cellPhoneCompanyContracts.methods
      .enrollCustomer(name)
      .send({ from: account_1, gas: 1000000 });

    const customer = await cellPhoneCompanyContracts.methods
      .getEnrolledCustomerByAddress(account_1)
      .call();

    assert.strictEqual(customer[0], name);
  });
  it('Customer should pay monthly bill', async () => {
    const name = 'Maik Vinicius';

    await cellPhoneCompanyContracts.methods
      .enrollCustomer(name)
      .send({ from: account_1, gas: 1000000 });

    await cellPhoneCompanyContracts.methods
      .payMonthlyBill(web3.utils.toWei('20', 'ether'))
      .send({ from: account_1, gas: 1000000, value: web3.utils.toWei('20', 'ether') });

    const customer = await cellPhoneCompanyContracts.methods
      .getEnrolledCustomerByAddress(account_1)
      .call();

    assert.strictEqual(customer[1], '1');
  });
  it('Customer should trade your points to watch', async () => {
    const name = 'Maik Vinicius';

    await cellPhoneCompanyContracts.methods
      .enrollCustomer(name)
      .send({ from: account_1, gas: 1000000 });

    await cellPhoneCompanyContracts.methods
      .payMonthlyBill(0)
      .send({ from: account_1, gas: 1000000 });

    await cellPhoneCompanyContracts.methods
      .payMonthlyBill(0)
      .send({ from: account_1, gas: 1000000 });

    await cellPhoneCompanyContracts.methods
      .exchangeCustomerPointsByProduct(0)
      .send({ from: account_1, gas: 1000000 });

    const product = await cellPhoneCompanyContracts.methods
      .getProduct(0)
      .call();

    const customer = await cellPhoneCompanyContracts.methods
      .getEnrolledCustomerByAddress(account_1)
      .call();

    assert.strictEqual(customer[1], '0'); // customer should have 0 points
    assert.strictEqual(product[2], '1'); // product must have been purchased once
  });
});