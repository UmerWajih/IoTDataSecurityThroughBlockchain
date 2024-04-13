const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } = require('../util');

class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }
  //First block of blockchain is loaded through this
  static genesis() {
    return new this(GENESIS_DATA);
  }
  //Blocks are mined using this
  //nonce is incremented till our desired goal is achieved
  //difficulty is calculated using timestamps
  static mineBlock({ lastBlock, data }) {
    const lastHash = lastBlock.hash; //hash from previously mined block
    let hash, timestamp;
    let { difficulty } = lastBlock;
    let nonce = 0;
    do {
      nonce++;
      timestamp = Date.now();//timestamp needs to be the same for difficulty and hash
      difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hexToBinary(hash)
      .substring(0, difficulty) !== '0'
      .repeat(difficulty));//checks if calculated hash as zero equalign diffuculty

    return new this({ timestamp, lastHash, data, difficulty, nonce, hash });
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;

    if (difficulty < 1) return 1;

    if ((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;

    return difficulty + 1;
  }
}

module.exports = Block;
