const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;
const REWARD_INPUT = { address: '*authorized-reward*' };
const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  REWARD_INPUT
};
