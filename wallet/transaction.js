const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {
	constructor() {
		this.id = ChainUtil.id();
		this.input = null;
		this.outputs = [];
	}

	// unique to this implementation:
	update(senderWallet, receipient, amount) {
		// update the sender's output amount based off the new receiving output
		const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

		if (amount > senderOutput.amount) {
			console.log(`Amount: ${amount} exceeds balance.`);
			return;
		}

		senderOutput.amount = senderOutput.amount - amount;

		this.outputs.push( { amount: amount, address: receipient });

		// resign the updated transaction, will only work from the original sender
		Transaction.signTransaction(this, senderWallet);

		return this;
	}

	static transactionWithOutputs(senderWallet, outputs) {
		const transaction = new this();
		transaction.outputs = [...outputs];
		Transaction.signTransaction(transaction, senderWallet);
		return transaction;
	}

	// sender is an entire wallet class
	// recipient is the public key of the recipient
	static newTransaction(senderWallet, receipient, amount) {
		if (amount > senderWallet.balance) {
			console.log(`Amount: ${amount} exceeds balance.`);
			return;
		}

		// subtract the balance from the sender
    	const senderAmount = senderWallet.balance - amount;

    	// TODO: add transaction fee
		return Transaction.transactionWithOutputs(senderWallet, [
			{ amount: senderAmount, address: senderWallet.publicKey },
			{ amount: amount, address: receipient }
		]);
	}

	static rewardTransaction(minerWallet, blockchainWallet) {
		return Transaction.transactionWithOutputs(blockchainWallet, [
			{ amount: MINING_REWARD, address: minerWallet.publicKey }
		]);
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
		const verifed = ChainUtil.verifySignature(
			transaction.input.address,
			transaction.input.signature,
			ChainUtil.hash(transaction.outputs)
		);
		return verifed;
	}
}

module.exports = Transaction;