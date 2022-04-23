const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Blockchain = require('../blockchain/blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet/wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname+'/../', 'public')));

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname+'/../', 'index.html'));
});

app.get('/blocks', (req, res) => {
	res.json(bc.chain);
});

app.get('/blocks/length', (req, res) => {
	res.json(bc.chain.length);
});

app.get('/blocks/:id', (req, res) => {
	const id = req.params.id;
	const length = bc.chain.length;

	const blocksReversed = bc.chain.slice().reverse();

	let startIndex = (id - 1) * 5;
	let endIndex = id * 5;

	startIndex = startIndex < length ? startIndex : length;
	endIndex = endIndex < length ? endIndex : length;

	res.json(blocksReversed.slice(startIndex, endIndex));
});

app.get('/transactions', (req, res) => {
	res.json(tp.transactions);
});

app.post('/transact', (req, res) => { // make transaction
	const amount = parseInt(req.body.amount);
	const recipient = req.body.recipient;
	
	const transaction = wallet.createTransaction(recipient, amount, bc, tp);

	// store transactions on the block itself.
	p2pServer.broadcastTransaction(transaction);

	res.json({ transaction: transaction });
});

app.get('/peers', (req, res) => {
  res.json({ peers: p2pServer.sockets.length });
});

app.get('/wallet-info', (req, res) => {
	const address = wallet.publicKey;
	const balance = wallet.calculateBalance(bc);

	res.json({ address: address, balance: balance});
});

app.get('/mine-transactions', (req, res) => {
	const block = miner.mine();
	console.log(`New block added: ${block.toString()}`);

	res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => {
	console.log(`Listening on port ${HTTP_PORT}`)
});

p2pServer.listen();