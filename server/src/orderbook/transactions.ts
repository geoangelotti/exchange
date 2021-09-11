/**
 * @type {Transaction}
 */

interface Transaction {
	timestamp: Date;
	seller: string;
	buyer: string;
	quantity: string;
	price: string;
}

const TransactionHistory: Array<Transaction> = [];

/**
 * @function recordTransaction
 * @param {Transaction} transaction 
 * @returns {number}
 */

const recordTransaction = (transaction: Transaction): number =>
	TransactionHistory.push(transaction);

/**
 * @function getLastTransaction
 * @returns {Transaction | undefined}
 */

const getLastTransaction = (): Transaction | undefined => TransactionHistory.at(-1);

export {
	Transaction,
	TransactionHistory,
	recordTransaction,
	getLastTransaction,
};
