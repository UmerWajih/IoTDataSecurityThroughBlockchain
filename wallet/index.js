const Transaction = require('./transaction');
const { ec, cryptoHash } = require('../util');

class Wallet {
  constructor() {

    this.keyPair = ec.genKeyPair();

    this.publicKey = this.keyPair.getPublic().encode('hex');
  }
  //Called to sign the transaction when data is received
  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }

}

module.exports = Wallet;
