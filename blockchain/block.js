const ChainUtil = require('../chain-util');
const DIFFICULTY = require('../config').DIFFICULTY;
const MINE_RATE = require('../config').MINE_RATE;

class Block {
	constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty || DIFFICULTY;
	}

	toString() {
		return `Block -
			Timestamp : ${this.timestamp}
			Last Hash : ${this.lastHash.substring(0, 10)}
			Hash      : ${this.hash.substring(0, 10)}
			Nonce     : ${this.nonce}
			Difficulty: ${this.difficulty}
			Data      : ${this.data}`;
	}

	static genesis() {
		return new this('Genesis time', '-----', 'n0ax-h45x',[], 0, DIFFICULTY);
	}

	static mineBlock(lastBlock, data) {
		const lastHash = lastBlock.hash;
		let hash, timestamp;
		let difficulty = lastBlock.difficulty;
		let nonce = 0;

		do {
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustDifficulty(lastBlock, timestamp);
			hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);	
		} while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

		return new this(timestamp, lastHash, hash, data, nonce, difficulty)
	}

	static hash(timestamp, lastHash, data, nonce, difficulty) {
		return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
	}

	static blockHash(block) {
		const timestamp = block.timestamp;
		const lastHash = block.lastHash;
		const data = block.data;
		const nonce = block.nonce;
		const difficulty = block.difficulty;
		return Block.hash(timestamp, lastHash, data, nonce, difficulty);
	}

	static adjustDifficulty(lastBlock, currentTime) {
		let difficulty = lastBlock.difficulty;
		difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
		return difficulty;
	}
}

module.exports = Block;