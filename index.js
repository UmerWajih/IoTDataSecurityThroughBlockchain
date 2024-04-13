const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain');
const Transaction = require('./wallet/transaction');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');
const WalletPool = require('./wallet/index-pool');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const walletPool = new WalletPool();
const pubsub = new PubSub({ blockchain, transactionPool, walletPool });

let walletMinerMap={};

const wallet = new Wallet();
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 4000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());



/*Blockchain Code */
app.get('/api/blocks', (req, res) => {
  const { address } = req.body;
  if(Boolean(walletPool.walletMap[address])) {
    res.json(blockchain.chain);
  }else{
    res.json({});
  }
  
});


/*Transaction Pool(Unmined Transactions)*/
app.get('/api/transaction-pool-map', (req, res) => {
  res.json(transactionPool.transactionMap);
});

/*Wallet Pool*/
app.get('/api/wallet-pool-map', (req, res) => {
  res.json(walletPool.walletMap);
});

/*Wallet Creation/Device Registration*/

app.post('/api/createWallet', (req, res) => {

  let w = new Wallet();
  const miner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });
  walletPool.setWallet(w);
  walletMinerMap[w.publicKey] = miner;

  //Broadcast wallets to other blockchain instances
  pubsub.broadcastWallet(w);
  res.json(w.publicKey);
});

/*Create Data Transactions*/
app.post('/api/transact', (req, res) => {
  const { data, recipient, sender } = req.body;

  let transaction;

  try {
    const sendersWallet = walletPool.walletMap[sender];
    const recipientsWallet = walletPool.walletMap[recipient];
    const validSender = Boolean(sendersWallet);
    const validRecipient = Boolean(recipientsWallet);
    if (validSender && validRecipient) {
      transaction = new Transaction({ senderWallet: sendersWallet, recipient, data });
      console.log(transaction);
    } else {
      if (!validSender && !validRecipient)
        throw new Error("Invalid Addresses");
      if (!validRecipient)
        throw new Error("Invalid Recipients Addresses");
      if (!validSender)
        throw new Error("Invalid Senders Addresses");
    }

  } catch (error) {
    return res.status(400).json({ type: 'error', message: error.message });
  }

  transactionPool.setTransaction(transaction);

  pubsub.broadcastTransaction(transaction);

  res.json({ type: 'success', transaction });
});




/*Mine Transactions*/
// app.get('/api/mine-transactions', (req, res) => {
//   transactionMiner.mineTransactions();

//   res.redirect('/api/blocks');
// });

app.get('/api/mine-transactions-by-address', (req, res) => {

  const { address } = req.body;
  const miner =  walletMinerMap[address];
  console.log(address);
  console.log(walletMinerMap);
  console.log(miner);
  miner.mineTransactions();

  res.redirect('/api/blocks');
});






app.get('/api/wallet-info', (req, res) => {
  const address = wallet.publicKey;

  res.json({
    address,
    //balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
  });
});











const syncWithRootState = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootTransactionPoolMap = JSON.parse(body);

      console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
      transactionPool.setMap(rootTransactionPoolMap);
    }
  });
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`listening at localhost:${PORT}`);

  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});
