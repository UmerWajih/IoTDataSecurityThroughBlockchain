const uuid = require('uuid/v1');
const { verifySignature } = require('../util');
const { REWARD_INPUT } = require('../config');

class Transaction {
  constructor({ senderWallet, recipient, data, input,outputMap }) {
    //let obj = {  sendersWallet, recipient, data };
    console.log(recipient);
    console.log(senderWallet);
    console.log(data);
    this.id = uuid();
    this.outputMap =  this.createOutputMap({ senderWallet, recipient, data });
    this.input =  this.createInput({ senderWallet, data, outputMap: this.outputMap });
  }

  createOutputMap({ senderWallet, recipient, data }) {
    const outputMap = {};
    console.log(data);
    outputMap["data"] = data;
    outputMap["recipient"] = recipient;
    outputMap[senderWallet.publicKey] = senderWallet.publicKey;

    return outputMap;
  }

  createInput({ senderWallet, outputMap, data }) {
    return {
      timestamp: Date.now(),
      data: data,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  }

  update({ senderWallet, recipient, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error('Amount exceeds balance');
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  static validTransaction(transaction) {
    const { input: { address, signature }, outputMap } = transaction;
    
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

}

module.exports = Transaction;
