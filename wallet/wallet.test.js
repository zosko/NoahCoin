const TransactionPool = require('./transaction-pool');
const Wallet = require('./wallet');
const Blockchain = require('../blockchain/blockchain');

describe('Wallet', () => {
	
	let wallet, tp, bc;

	beforeEach( () => {
		wallet = new Wallet();
		tp = new TransactionPool();
		bc = new Blockchain();
	});

	describe('creating a transaction', () => {
		let transaction, sendAmount, recipient;

		beforeEach( () => {
			sendAmount = 50;
			recipient = 'recepient_111';
			transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
		});

		describe('and doing the same transaction', () => {
			beforeEach( () => {
				wallet.createTransaction(recipient, sendAmount, bc, tp);
			});

			it('doubles the `sendAmount` subtracted from the wallet balance', () => {
				expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - sendAmount * 2);
			});

			it('clones `sendAmount` output for the recipient', () => {
				expect(transaction.outputs.filter(output => output.address === recipient).map(output => output.amount)).toEqual([sendAmount, sendAmount]);
			});

		});

	});
});