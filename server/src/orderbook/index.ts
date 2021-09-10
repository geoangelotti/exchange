import {
  MinPriorityQueue,
  MaxPriorityQueue,
} from '@datastructures-js/priority-queue';
import { ExecutionResponse, LimitExecution, MarketExecution } from './orders';
import { getLastTransaction } from './transactions';

interface MarketOrder {
  uuid: string;
  side: 'buy' | 'sell';
  type: 'market';
  quantity: string;
  timestamp: Date;
}

interface LimitOrder {
  uuid: string;
  side: 'buy' | 'sell';
  type: 'limit';
  quantity: string;
  price: string;
  timestamp: Date;
}

type Order = MarketOrder | LimitOrder;

/*	Minimum Priority Queue
 *	Selling occurs at the smallest price (as far as a buyer is concerned)
 *  Efficient way to peak the largest LimitOrder O(1)
 *  Efficient way to get the smallest LimitOrder O(logn)
 *  Efficient way to place the order to the appropriate place O(logn)
 */

const SellQueue = new MinPriorityQueue<LimitOrder>({
  compare: (o1, o2) => {
    if (Number(o1.price) < Number(o2.price)) return -1; // do not swap
    if (Number(o1.price) > Number(o2.price)) return 1; // swap
    return o1.timestamp < o2.timestamp ? -1 : 1;
  },
});

/*	Maximum Priority Queue
 *	Selling occurs at the largest price (as far as a seller is concerned)
 *  Efficient way to peak the largest LimitOrder O(1)
 *  Efficient way to get the largest LimitOrder O(logn)
 *  Efficient way to place the order to the appropriate place O(logn)
 */

const BuyQueue = new MaxPriorityQueue<LimitOrder>({
  compare: (o1, o2) => {
    if (Number(o1.price) > Number(o2.price)) return -1; // do not swap
    if (Number(o1.price) < Number(o2.price)) return 1; // swap
    return o1.timestamp < o2.timestamp ? -1 : 1;
  },
});

const HandleOrder = (order: Order): [boolean, ExecutionResponse] => {
  let Queue:
    | MinPriorityQueue<LimitOrder>
    | MaxPriorityQueue<LimitOrder> = SellQueue;
  let Stash:
    | MinPriorityQueue<LimitOrder>
    | MaxPriorityQueue<LimitOrder> = BuyQueue;
  if (order.side === 'sell') {
    const temp = Queue;
    Queue = Stash;
    Stash = temp;
  }
  const execution =
    order.type === 'market'
      ? MarketExecution(order, Queue)
      : LimitExecution(order, Queue);
  const [result, , remainderOrder] = execution;
  // Partial or no execution of the Order
  // The remainder of the Order needs to be added as a Market Order to the Appropriate stash
  if (result !== 'full') {
    if (order.type === 'limit') {
      Stash.enqueue(remainderOrder as LimitOrder);
    } else {
      // Market Order needs to be transformed to Limit Order
      // the price is the price of the last recorder transaction
      // theoritically this does not happen as the exchange has market makers to provide liquidity to match every incoming Market Order (Market Maker)
      const lastTransaction = getLastTransaction();
      if (lastTransaction) {
        Stash.enqueue({
          ...remainderOrder,
          type: 'limit',
          price: lastTransaction.price,
        });
      } else {
        // there is no recorded transaction so there is no price for the asset
        // complete failure of the order unable to place it to book
        // some exchanges do not allow Market Orders at the start of trading
        return [false, execution];
      }
    }
  }
  return [true, execution];
};

export { SellQueue, BuyQueue, LimitOrder, MarketOrder, Order, HandleOrder };
