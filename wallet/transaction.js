const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {
	constructor() {
		this.id = ChainUtil.id();
		this.input = null;
		this.outputs = [];
	}

	update(senderWallet, receipient, amount) {
		const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

		if (amount > senderWallet.outputs) {
			console.log(`Amount: ${amount} exceeds balance.`);
			return;
		}

		senderOutput.amount = senderOutput.amount - amount;
		this.outputs.push( { amount, address: receipient } );

		Transaction.signTransaction(this, senderWallet);

		return this;
	}

	static transactionWithOutputs(senderWallet, outputs) {
		const transaction = new this();
		transaction.outputs.push(...outputs);
		Transaction.signTransaction(transaction, senderWallet);
		return transaction;
	}

	static newTransaction(senderWallet, receipient, amount) {
		if (amount > senderWallet.balance) {
			console.log(`Amount: ${amount} exceeds balance.`);
			return;
		}

		return Transaction.transactionWithOutputs(senderWallet, [
			{ amount: senderWallet.balance - amount, address: senderWallet.publicKey },
			{ amount, address: receipient }
		]);
	}

	static rewardTransaction(minerWallet, blockchainWallet) {
		return Transaction.transactionWithOutputs(blockchainWallet, [{
			amount: MINING_REWARD, address:minerWallet.publicKey
		}]);
	}

	static signTransaction(transaction, senderWallet) {
		transaction.input = {
			timestamp: Date.now(),
			amount: senderWallet.balance,
			address: senderWallet.publicKey,
			signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
		};
	}

	static verifyTransaction(transaction) {
		return ChainUtil.verifySignature(
				transaction.input.address,
				transaction.input.signature,
				ChainUtil.hash(transaction.outputs)
			);
	}
}

module.exports = Transaction;