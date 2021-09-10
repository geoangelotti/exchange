import { Mutex } from 'async-mutex';
import { HandleOrder, Order } from '.';
import { Execution } from './orders';

const mutex = new Mutex(); // creates a shared mutex instance

const HandleOrderAsync = async (order: Order): Promise<[boolean, Execution]> => {
	const release = await mutex.acquire();
	try {
		return new Promise(resolve => resolve(HandleOrder(order)));
	} finally {
		release();
	}
};

export { HandleOrderAsync };
