import { Mutex } from 'async-mutex';
import { HandleOrder, Order } from '.';
import { Execution } from './orders';

const mutex = new Mutex();

/**
 * @function HandleOrderAsync
 * @param {Order} order 
 * @returns {Promise<[boolean, Execution]>}
 */

const HandleOrderAsync = async (order: Order): Promise<[boolean, Execution]> => {
	// wait to aquire mutex
	const release = await mutex.acquire();
	try {
		return new Promise(resolve => resolve(HandleOrder(order)));
	} finally {
		release();
	}
};

export { HandleOrderAsync };
