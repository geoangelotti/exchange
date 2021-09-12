import {
	MinPriorityQueue,
	MaxPriorityQueue,
} from '@datastructures-js/priority-queue';
import { Execution, LimitExecution, MarketExecution } from './orders';
import { getLastTransaction } from './transactions';

/**
 * @typedef {MarketOrder}
 */

interface MarketOrder {
	uuid: string;
	side: 'buy' | 'sell';
	type: 'market';
	quantity: string;
	timestamp: Date;
}

/**
 * @typedef {LimitOrder}
 */

interface LimitOrder {
	uuid: string;
	side: 'buy' | 'sell';
	type: 'limit';
	quantity: string;
	price: string;
	timestamp: Date;
}

/**
 * @typedef {Order}
 */

type Order = MarketOrder | LimitOrder;

/**
 * @typedef {PriorityQueue}
 */

type PriorityQueue = MinPriorityQueue<LimitOrder>|MaxPriorityQueue<LimitOrder>;

/** 
 * Minimum Priority Queue
 * Selling occurs at the smallest price (as far as a buyer is concerned)
 * Efficient way to peak the smallest LimitOrder O(1)
 * Efficient way to get the smallest LimitOrder O(log(n))
 * Efficient way to place the order to the appropriate place O(log(n))
 */

const SellQueue = new MinPriorityQueue<LimitOrder>({
	compare: (o1, o2) => {
		if (Number(o1.price) < Number(o2.price)) return -1; // do not swap
		if (Number(o1.price) > Number(o2.price)) return 1; // swap
		return o1.timestamp < o2.timestamp ? -1 : 1;
	},
});

/**
 * Maximum Priority Queue
 * Selling occurs at the largest price (as far as a seller is concerned)
 * Efficient way to peak the largest LimitOrder O(1)
 * Efficient way to get the largest LimitOrder O(log(n))
 * Efficient way to place the order to the appropriate place O(log(n))
 */

const BuyQueue = new MaxPriorityQueue<LimitOrder>({
	compare: (o1, o2) => {
		if (Number(o1.price) > Number(o2.price)) return -1; // do not swap
		if (Number(o1.price) < Number(o2.price)) return 1; // swap
		return o1.timestamp < o2.timestamp ? -1 : 1;
	},
});

/**
 * @function arrangeQueueStash
 * @param {'sell' | 'buy'} side 
 * @returns {[PriorityQueue, PriorityQueue]} 
 */

const arrangeQueueStash = (side: 'buy' | 'sell'): [PriorityQueue, PriorityQueue] =>
	side === 'buy' ? [SellQueue, BuyQueue] : [BuyQueue, SellQueue]

/**
 * @function HandleOrder
 * Execute the Order
 * If partial or no execution of the order the remainder becomes a limit order
 * @param {Order} order 
 * @returns {[boolean, Execution]}
 */

const HandleOrder = (order: Order): [boolean, Execution] => {
	const [Queue, Stash] = arrangeQueueStash(order.side);
	const execution =
		order.type === 'market'
			? MarketExecution(order, Queue)
			: LimitExecution(order, Queue);
	const [result, , remainderOrder] = execution;
	
	// if partial or no execution of the Order
	// The remainder of the Order needs to be added as a Limit Order to the stash
	if (result !== 'full') {
		if (order.type === 'limit') {
			Stash.enqueue(remainderOrder as LimitOrder);
		} else {
			// Market Order needs to be transformed to Limit Order
			// the price is the price of the last recorder transaction
			// theoritically this does not happen as the exchange has market makers to provide adequate liquidity
			const lastTransaction = getLastTransaction();
			if (lastTransaction) {
				Stash.enqueue({
					...remainderOrder,
					type: 'limit',
					price: lastTransaction.price,
				});
			} else {
				// there is no recorded transaction so there is no price for the asset
				// complete failure of the order unable to place it into the book
				// some exchanges do not allow Market Orders at the start of trading for this reason
				return [false, execution];
			}
		}
	}
	return [true, execution];
};

export { SellQueue, BuyQueue, LimitOrder, MarketOrder, Order, PriorityQueue, HandleOrder };
