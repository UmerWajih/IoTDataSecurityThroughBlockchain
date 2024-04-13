const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');

describe('input', () => {
    it('transaction object `', () => {
    let transaction = new Transaction({ senderWallet: new Wallet(), recipient: "umer", data:"wajih" });
      expect(transaction.input.data).toEqual('wajih');
    });

  });