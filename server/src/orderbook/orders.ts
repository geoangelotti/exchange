import { MinPriorityQueue, MaxPriorityQueue } from '@datastructures-js/priority-queue';
import { LimitOrder, MarketOrder } from '.';
import { recordTransaction, Transaction } from './transactions';

type Result = 'full' | 'partial' | 'empty';

type ExecutionResponse = [ Result, Array<Transaction>, MarketOrder|LimitOrder];

/*	Market Order Execution strategy
*	Try to fullfil the incoming Market Order
* 	Record the successfull transactions
*	Return Execution Response
*	[Result, Transactions, MarketOrder]
*	If Execution not fully fullfilled then the remainder Market Order will become a Limit Order with the last transaction's Price
*/

const MarketExecution = (ask: MarketOrder, bookQueue: MinPriorityQueue<LimitOrder>|MaxPriorityQueue<LimitOrder>): ExecutionResponse => {
	const transactions: Array<Transaction> = [];
	// quantity to fill
	// or demand
	let q_d = Number(ask.quantity);
	// while positive demand and not empty queue
	while (q_d > 0 && !bookQueue.isEmpty()) {
		const bid = <LimitOrder>bookQueue.dequeue();
		const state = [bid.uuid, ask.uuid];
		if (ask.side === 'sell') {
			const temp = state[0];
			state[0] = state[1];
			state[1] = temp;
		}
		const price = Number(bid.price);
		// quantity liquidity
		// or supply
		const q_s = Number(bid.quantity);
		const delta = q_s - q_d;
		// More liquidity at this price than demand
		if (delta > 0) {
			// Record the transaction
			const transaction = {seller: state[0], buyer: state[1], timestamp: new Date(), price: price.toFixed(4), quantity: q_d.toFixed(4)}
			recordTransaction(transaction);
			transactions.push(transaction);
			// filled the market order
			q_d = 0;
			// add to the queue the remainder of the transaction
			bookQueue.enqueue({...bid, quantity: delta.toFixed(4)});
		// More demand than liquidity
		} else {
			// Record the transaction
			const transaction = {seller: state[0], buyer: state[1], timestamp: new Date(), price: price.toFixed(4), quantity: q_s.toFixed(4)}
			recordTransaction(transaction);
			transactions.push(transaction);
			q_d = delta * (-1);
		}
		// loop back if positive demand and not empty queue
	}
	if (transactions.length === 0) {
		// No transaction executed
		return ['empty', transactions, ask];
	} else if (q_d > 0) {
		// Partial transaction executed
		return ['partial', transactions, {...ask, quantity: q_d.toFixed(4)}]; 
	} else {
		// Full transaction executed
		return ['full', transactions, ask];
	}
};

const underLimit = (i: number, limit: number, side: 'buy' | 'sell') => {
	const check = limit - i > 0;
	return side === 'sell' ? !check : check ;
}


const LimitExecution = (ask: LimitOrder, bookQueue: MinPriorityQueue<LimitOrder>|MaxPriorityQueue<LimitOrder>): ExecutionResponse => {
	const transactions: Array<Transaction> = [];
	// price_limit
	const p_l = Number(ask.price);
	// quantity_limit
	let q_l = Number(ask.quantity);
	// in price range
	let inPrice = true;
	// while quantity limit not met and in price range and not empty queue
	while(q_l > 0 && inPrice && !bookQueue.isEmpty()) {
		const bid = <LimitOrder>bookQueue.front();
		// potential price to fill
		const p_p_f =  Number(bid.price);
		// potential quantity to fill
		const p_q_f = Number(bid.quantity);
		const state: [string, string] = [bid.uuid, ask.uuid];
		if (ask.side === 'sell') {
			const temp = state[0];
			state[0] = state[1];
			state[1] = temp;
		}
		if (underLimit(p_p_f, p_l, ask.side)) {
			const delta = p_q_f - q_l;
			if (delta > 0) {
				// Record the transaction
				const transaction = {seller: state[0], buyer: state[1], timestamp: new Date(), price: p_p_f.toFixed(4), quantity: q_l.toFixed(4)}
				recordTransaction(transaction);
				transactions.push(transaction);
				// filled the limit order
				q_l = 0;
				bookQueue.dequeue();
				bookQueue.enqueue({...bid, quantity: delta.toFixed(4)});
			} else {
				// Record the transaction
				const transaction = {seller: state[0], buyer: state[1], timestamp: new Date(), price: p_p_f.toFixed(4), quantity: p_q_f.toFixed(4)}
				recordTransaction(transaction);
				transactions.push(transaction);
				bookQueue.dequeue();
				q_l = (-1) * delta;
			}
		} else {
			inPrice = false;
		}
	}
	if (transactions.length === 0) {
		return ['full', transactions, ask];
	} else if (!inPrice) {
		return ['full', transactions, {...ask, quantity: q_l.toFixed(4)}];
	} else if (q_l > 0) {
		return ['full', transactions, {...ask, quantity: q_l.toFixed(4)}];
	} else {
		return ['full', transactions, ask];
	}
};

export { MarketExecution, LimitExecution, ExecutionResponse };