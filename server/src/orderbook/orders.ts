import { MinPriorityQueue, MaxPriorityQueue } from '@datastructures-js/priority-queue';
import { LimitOrder, MarketOrder } from '.';
import { recordTransaction, Transaction } from './transactions';

type Execution = [ 'full' | 'partial' | 'no fill', Array<Transaction>, MarketOrder|LimitOrder];

/**
 * Arrange Seller and Buyer for asker and bidder
 * @param {string} asker 
 * @param {string} bidder 
 * @param {'sell' | 'buy'} side
 * @returns {[string, string]} - Return Seller and Buyer from asker and bidder in the proper order
 */

const arrangeSellerBuyer = (asker: string, bidder: string, side: 'sell' | 'buy'): [string, string] => side === 'sell' ? [asker, bidder] : [bidder,asker] ;

/**  
 *	Market Order Execution
 *	Try to fullfil the incoming Market Order with the head of the Queue 
 *	Until the Market Order is filled completely or Queue is empty
 *	If head is partially filled then it is enqueued with the remaining quantity
 * 	Record the successfull transactions
 *	@param {MarketOrder} ask - Incoming Market Order
 *	@param {MinPriorityQueue<LimitOrder>|MaxPriorityQueue<LimitOrder>} bookQueue - Priority Queue with the matching Limit Orders
`* @returns {Execution} - Result of the execution, Transactions executed, Market Order after the execution
 */

const MarketExecution = (ask: MarketOrder, bookQueue: MinPriorityQueue<LimitOrder>|MaxPriorityQueue<LimitOrder>): Execution => {
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
			quantity_demand = 0;
			// add to the queue the remainder of the transaction
			bookQueue.enqueue({...bid, quantity: delta.toFixed(4)});
		} else {
			// More demand than supply
			// Limit Order exhausted
			// Market Order change demanded quantity
			const transaction = {seller, buyer, timestamp: new Date(), price: price.toFixed(4), quantity: quantity_supply.toFixed(4)}
			recordTransaction(transaction);
			transactions.push(transaction);
			quantity_demand = delta * (-1);
		}
		// loop back if positive demand and not empty queue
	}
	if (transactions.length === 0) {
		// No transaction executed
		return ['no fill', transactions, ask];
	} else if (quantity_demand > 0) {
		// Partial transaction executed
		// BookQueue exhausted
		return ['partial', transactions, {...ask, quantity: quantity_demand.toFixed(4)}]; 
	} else {
		// Full transaction executed
		return ['full', transactions, ask];
	}
};

/** 
 *  Price Covered 
 *	if current price covers the limit
 *	for buy limit > i
 *	for sell i > 0
 *  @param {number} i - current price
 *  @param {number} limit - price limit
 *	@param {'buy' | 'sell'} side - kind of order performed
 *  @returns {boolean} - if current price "under" price limit
 */

const priceCovered = (i: number, limit: number, side: 'buy' | 'sell'): boolean => {
	const check = limit - i > 0;
	return side === 'sell' ? !check : check ;
}

/**
 *	Limit Order Execution
 *	Try to fullfil the incoming Limit Order with the head of the Queue 
 *	Until the Limit Order is filled completely or Queue is empty or the head's price "over" price limit
 *	If head is partially filled then it is enqueued with the remaining quantity
 * 	Record the successfull transactions
 *	@param {LimitOrder} ask - Incoming Limit Order 
 *	@param {MinPriorityQueue<LimitOrder>|MaxPriorityQueue<LimitOrder>} bookQueue - Priority Queue with the matching Limit Orders
`* 	@returns {Execution} - Result of the execution, Transactions executed, Limit Order after the execution
 */

const LimitExecution = (ask: LimitOrder, bookQueue: MinPriorityQueue<LimitOrder>|MaxPriorityQueue<LimitOrder>): Execution => {
	const transactions: Array<Transaction> = [];
	const price_limit = Number(ask.price);
	let quantity_limit = Number(ask.quantity);
	// flag if in price
	let inPrice = true;
	// while quantity limit not fullfilled and in price range and not empty queue
	while(quantity_limit > 0 && inPrice && !bookQueue.isEmpty()) {
		// peak not get head of the Queue
		const bid = <LimitOrder>bookQueue.front();
		const price_fill =  Number(bid.price);
		const quantity_fill = Number(bid.quantity);
		const [seller, buyer] = arrangeSellerBuyer(ask.uuid, bid.uuid, ask.side);
		// if current price covers the limit
		if (priceCovered(price_fill, price_limit, ask.side)) {
			const delta = quantity_fill - quantity_limit;
			// More supply than demand
			// Limit Order fullfilled
			// Remainder of Limit Order needs to be requeued
			if (delta > 0) {
				const transaction = {seller, buyer, timestamp: new Date(), price: price_fill.toFixed(4), quantity: quantity_limit.toFixed(4)}
				recordTransaction(transaction);
				transactions.push(transaction);
				// filled the limit order
				quantity_limit = 0;
				// remove bid from queue
				bookQueue.dequeue();
				// enqueue remainder limit order
				bookQueue.enqueue({...bid, quantity: delta.toFixed(4)});
			} else {
				// More demand than supply
				// Queued Limit Order exhausted
				// Incoming Limit Order change demanded quantity
				const transaction = {seller, buyer, timestamp: new Date(), price: price_fill.toFixed(4), quantity: quantity_fill.toFixed(4)}
				recordTransaction(transaction);
				transactions.push(transaction);
				// remove bid from queue
				bookQueue.dequeue();
				quantity_limit = (-1) * delta;
			}
		} else {
			// break the loop
			inPrice = false;
		}
	}
	if (transactions.length === 0) {
		// No transaction executed
		return ['no fill', transactions, ask];
	} else if (!inPrice) {
		// Book price does not cross with ask price
		if (Number(ask.quantity)-quantity_limit>0) {
			// Partial execution of the Limit Order
			return ['partial', transactions, {...ask, quantity: quantity_limit.toFixed(4)}];	
		}
		// No transaction executed
		return ['no fill', transactions, {...ask, quantity: quantity_limit.toFixed(4)}];
	} else if (quantity_limit > 0) {
		// Partial transaction executed
		return ['partial', transactions, {...ask, quantity: quantity_limit.toFixed(4)}];
	} else {
		// Full transaction executed
		return ['full', transactions, ask];
	}
};

export { MarketExecution, LimitExecution, Execution };