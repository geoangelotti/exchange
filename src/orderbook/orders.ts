import { LimitOrder, MarketOrder, PriorityQueue } from '.';
import { recordTransaction, Transaction } from './transactions';

/**
 * @typedef {Execution} - Order execution outcome
 */

type Execution = [ 'full' | 'partial' | 'no fill', Array<Transaction>, MarketOrder|LimitOrder];

/**
 * @function arrangeSellerBuyer
 * Arrange Seller and Buyer from asker and bidder depending on the side
 * @param {string} asker 
 * @param {string} bidder 
 * @param {'sell' | 'buy'} side
 * @returns {[string, string]} - Return Seller and Buyer
 */

const arrangeSellerBuyer = (asker: string, bidder: string, side: 'sell' | 'buy'): [string, string] => side === 'sell' ? [asker, bidder] : [bidder,asker] ;

/** 
 * @function MarketExecution
 * Try to fullfil the incoming Market Order with the head of the Queue 
 * Continue with the next Head of the Queue
 * Until the Market Order is filled completely or Queue is empty
 * If head is partially filled then it is enqueued with the remaining quantity
 * Record the successfull transactions
 * @param {MarketOrder} ask - Incoming Market Order
 * @param {PriorityQueue} bookQueue - Priority Queue with the matching Limit Orders
`* @returns {Execution} - Result of the execution, Transactions executed, Market Order after the execution
 */

const MarketExecution = (ask: MarketOrder, bookQueue: PriorityQueue): Execution => {
	const transactions: Array<Transaction> = [];
	let quantity_demand = Number(ask.quantity);
	// while positive demand and not empty queue
	while (quantity_demand > 0 && !bookQueue.isEmpty()) {
		const bid = <LimitOrder>bookQueue.dequeue();
		const [seller, buyer] = arrangeSellerBuyer(ask.uuid, bid.uuid, ask.side);

		const price = Number(bid.price);
		const quantity_supply = Number(bid.quantity);
		const delta = quantity_supply - quantity_demand;

		// More supply than demand
		// Market Order fullfilled
		// Remainder of Limit Order needs to be requeued
		if (delta > 0) {
			const transaction = {seller, buyer, timestamp: new Date(), price: price.toFixed(4), quantity: quantity_demand.toFixed(4)}
			recordTransaction(transaction);
			transactions.push(transaction);
			
			// Market Order was filled
			// Add to the queue the remainder of the transaction
			quantity_demand = 0;
			bookQueue.enqueue({...bid, quantity: delta.toFixed(4)});
		} else {
			// More demand than supply
			// Limit Order exhausted
			// Change demanded quantity of Market Order
			const transaction = {seller, buyer, timestamp: new Date(), price: price.toFixed(4), quantity: quantity_supply.toFixed(4)}
			recordTransaction(transaction);
			transactions.push(transaction);

			quantity_demand = delta * (-1);
		}
	}

	if (transactions.length === 0) {
		// No Order executed
		return ['no fill', transactions, ask];
	} else if (quantity_demand > 0) {
		// Partial Order executed
		return ['partial', transactions, {...ask, quantity: quantity_demand.toFixed(4)}]; 
	} else {
		// Full Order executed
		return ['full', transactions, ask];
	}
};

/** 
 * @function priceCovered
 * if current price covers the limit
 * for buy: limit > i
 * for sell: i > 0
 * @param {number} price - current price
 * @param {number} limit - price limit
 * @param {'buy' | 'sell'} side - kind of order performed
 * @returns {boolean} - if current price covers price limit
 */

const limitCovered = (price: number, limit: number, side: 'buy' | 'sell'): boolean => {
	const check = limit - price > 0;
	return side === 'sell' ? !check : check ;
}

/**
 * @function LimitExecution
 * Try to fullfil the incoming Limit Order with the head of the Queue
 * Continue with the next Head of the Queue
 * Until the Limit Order is filled completely or Queue is empty or the head's price does not cover price limit
 * If head is partially filled then it is enqueued with the remaining quantity
 * Record the successfull transactions
 * @param {LimitOrder} ask - Incoming Limit Order 
 * @param {PriorityQueue} bookQueue - Priority Queue with the matching Limit Orders
`* @returns {Execution} - Result of the execution, Transactions executed, Limit Order after the execution
 */

const LimitExecution = (ask: LimitOrder, bookQueue: PriorityQueue): Execution => {
	const transactions: Array<Transaction> = [];
	const price_limit = Number(ask.price);
	let quantity_limit = Number(ask.quantity);
	// while quantity limit not fullfilled and limit covered and not empty queue
	while(quantity_limit > 0 &&  !bookQueue.isEmpty()) {
		// peak not get head of the Queue
		const bid = <LimitOrder>bookQueue.front();

		const price_fill =  Number(bid.price);
		const quantity_fill = Number(bid.quantity);
		const [seller, buyer] = arrangeSellerBuyer(ask.uuid, bid.uuid, ask.side);
		
		// if current price covers the limit
		if (limitCovered(price_fill, price_limit, ask.side)) {
			const delta = quantity_fill - quantity_limit;
			
			// More supply than demand
			// Limit Order fullfilled
			// Remainder of Limit Order needs to be requeued
			if (delta > 0) {
				const transaction = {seller, buyer, timestamp: new Date(), price: price_fill.toFixed(4), quantity: quantity_limit.toFixed(4)}
				recordTransaction(transaction);
				transactions.push(transaction);

				// limit order was filled
				// remove bid from Queue and enqueue the remainder of the head
				quantity_limit = 0;
				bookQueue.dequeue();
				bookQueue.enqueue({...bid, quantity: delta.toFixed(4)});
			} else {
				// More demand than supply
				// bid exhausted and removed from Queue
				// Change demanded quantity of Limit Order
				const transaction = {seller, buyer, timestamp: new Date(), price: price_fill.toFixed(4), quantity: quantity_fill.toFixed(4)}
				recordTransaction(transaction);
				transactions.push(transaction);

				bookQueue.dequeue();
				quantity_limit = (-1) * delta;
			}
		} else {
			// price does not cover the limit
			break;
		}
	}

	if (transactions.length === 0) {
		// No order executed
		return ['no fill', transactions, ask];
	} else if (quantity_limit > 0) {
		// Partial order executed
		return ['partial', transactions, {...ask, quantity: quantity_limit.toFixed(4)}];
	} else {
		// Full order executed
		return ['full', transactions, ask];
	}
};

export { MarketExecution, LimitExecution, Execution };