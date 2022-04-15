const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./wallet');

describe('TransactionPool', () => {
	
	let tp, wallet, transaction;

	beforeEach( () => {
		tp = new TransactionPool();		
		wallet = new Wallet();
		transaction = wallet.createTransaction('recepient_111', 30, tp);
	});

	it('adds a transaction to the pool', () => {
		expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
	});

	it('updates a transaction in the pool', () => {
		const oldTransaction = JSON.stringify(transaction);
		const newTransaction = transaction.update(wallet, 'foo-new-recepient', 40);
		tp.updateOrAddTransaction(newTransaction);

		expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction);
	});

	describe('mixing valid and currupt trasanctions', () => {
		let validTransactions;

		beforeEach(() => {
			validTransactions = [...tp.transactions];

			for (let i = 0; i < 6; i++) {
				wallet = new Wallet();
				transaction = wallet.createTransaction('recepient_111', 30, tp);
				if (i % 2 == 0) {
					transaction.input.amount = 99999;
				} else {
					validTransactions.push(transaction);
				}
			}
		});

		it('show a difference between valid and corrupt transactions', () => {
			expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
		});

		it('grabs valid transactions', () => {
			expect(tp.validTransactions()).toEqual(validTransactions);
		});

	});

});