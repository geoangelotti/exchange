import { app } from './router';

module.exports = app;

export const sum = (a: number, b: number) => {
	if ('development' === process.env.NODE_ENV) {
		console.log('boop');
	}
	return a + b;
};
