const Transaction = require('./transaction');
const Wallet = require('./wallet');

describe('Transaction', () => {
	
	let transaction, wallet, receipient, amount;

	beforeEach( () => {
		wallet = new Wallet();
		amount = 50;
		receipient = 'recepient_111';

		transaction = Transaction.newTransaction(wallet, receipient, amount);
	});

	it('outputs the `amount` subtracted from wallet balance', () => {
		let tmpAmout = transaction.outputs.find(output => output.address === wallet.publicKey).amount;

		expect(tmpAmout).toEqual(wallet.balance - amount);
	});

	it('outputs the `amount` added to the receipient', () => {
		let tmpAmout = transaction.outputs.find(output => output.address === receipient).amount;

		expect(tmpAmout).toEqual(amount);
	});

	it('inputs the balance of the wallet', () => {
		expect(transaction.input.amount).toEqual(wallet.balance);
	});

	it('validates a valid transaction', () => {
		expect(Transaction.verifyTransaction(transaction)).toBe(true);
	});

	it('invalidates a currupt transaction', () => {
		transaction.outputs[0].amount = 50000;
		expect(Transaction.verifyTransaction(transaction)).toBe(false);
	});

	describe('transaction with amount that exceed the balance', () => {
		beforeEach( () => {
			amount = 5000;
			transaction = Transaction.newTransaction(wallet, receipient, amount);
		});

		it('does not create the transaction', () => {
			expect(transaction).toEqual(undefined);
		})
	});

	describe('and updating a transaction', () => {

		let nextAmount, nextRecepient;

		beforeEach( () => {
			nextAmount = 20;
			nextRecepient = 'recepient_222';
			transaction = transaction.update(wallet, nextRecepient, nextAmount);
		});

		it('subtracts the next amount from the senders outputs', () => {
			let tmpAddress = transaction.outputs.find(output => output.address === wallet.publicKey);

			expect(tmpAddress.amount).toEqual(wallet.balance - amount - nextAmount);
		})


		it('outputs an amount for the next recepient', () => {
			let tmpAddress = transaction.outputs.find(output => output.address === nextRecepient);

			expect(tmpAddress.amount).toEqual(nextAmount);
		})
	});
});