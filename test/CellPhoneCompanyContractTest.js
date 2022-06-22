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

    const etherValue = web3.utils.toWei('1', 'ether');

    await cellPhoneCompanyContracts.methods
      .payMonthlyBill(etherValue)
      .send({ from: account_1, gas: 1000000, value: etherValue });

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

    const etherValue = web3.utils.toWei('1', 'ether');

    await cellPhoneCompanyContracts.methods
      .payMonthlyBill(etherValue)
      .send({ from: account_1, gas: 1000000, value: etherValue });

    await cellPhoneCompanyContracts.methods
      .payMonthlyBill(etherValue)
      .send({ from: account_1, gas: 1000000, value: etherValue });

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
  it('Customer should send eth to other customer', async () => {
    const customerFirst = 'Maik Vinicius';
    const customerSecond = 'Natalia Borges';

    await cellPhoneCompanyContracts.methods
      .enrollCustomer(customerFirst)
      .send({ from: account_1, gas: 1000000 });

    await cellPhoneCompanyContracts.methods
      .enrollCustomer(customerSecond)
      .send({ from: account_2, gas: 1000000 });

    const etherValue = web3.utils.toWei('1', 'ether');

    // Pay monthly bill to customer 1

    await cellPhoneCompanyContracts.methods
      .payMonthlyBill(etherValue)
      .send({ from: account_1, gas: 1000000, value: etherValue });

    const contractBalanceOld = await cellPhoneCompanyContracts.methods
      .getContractBalance()
      .call();

    // With my amount of ether after pay monthly bill, I send it to customer 2

    await cellPhoneCompanyContracts.methods
      .transferToAccount(account_2, etherValue)
      .send({ from: account_1, gas: 1000000 });

    const contractBalance = await cellPhoneCompanyContracts.methods
      .getContractBalance()
      .call();

    assert.strictEqual(contractBalanceOld, `${etherValue}`);
    assert.strictEqual(contractBalance, '0');
  });
});