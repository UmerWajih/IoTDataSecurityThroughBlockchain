const Wallet = require('./index');

class WalletPool {
  constructor() {
    this.walletMap = {};
  }

  setWallet(wallet) {
    this.walletMap[wallet.publicKey] = wallet;
  }

  setMap(walletMap) {
    this.walletMap = walletMap;
  }

}

module.exports = WalletPool;