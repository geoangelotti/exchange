import { Request, Response } from 'express';

export default [
	{
		path: '/ping',
		method: 'get',
		handler: async (_req: Request, res:Response) => {
			res.status(200).send('pong');
		}
	},
	{
		path: '/order',
		method: 'post',
		handler: async (_req: Request, _res:Response) => {

		}
	},
	{
		path: '/book',
		method: 'get',
		handler: async (_req: Request, _res:Response) => {

		}
	},
];
