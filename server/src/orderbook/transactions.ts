interface Transaction {
	timestamp: Date;
	seller: string;
	buyer: string;
	quantity: string;
	price: string;
}

const TransactionHistory: Array<Transaction> = [];

const recordTransaction = (transaction: Transaction) => TransactionHistory.push(transaction);

const getLastTransaction = () => TransactionHistory[TransactionHistory.length - 1];

export {Transaction, TransactionHistory, recordTransaction, getLastTransaction};