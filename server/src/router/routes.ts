import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BuyQueue, HandleOrder, SellQueue } from '../orderbook';

export default [
  {
    path: '/ping',
    method: 'get',
    handler: async (_req: Request, res: Response) => {
      res.status(200).send('pong');
    },
  },
  {
    path: '/order',
    method: 'post',
    handler: async (req: Request, res: Response) => {
      let { type, side, price, quantity } = req.body;
      const check1 = new Set<string>(['market', 'limit']);
      const check2 = new Set<string>(['sell', 'buy']);
      if (!check1.has(String(type)) || !check2.has(String(side))) {
        res.status(400).send({ error: 'Invalid order type or side.' });
        return;
      }
      if (isNaN(Number(quantity))) {
        res.status(400).send({ error: 'Invalid quantity requested.' });
        return;
      }
      if (String(type) === 'limit' && isNaN(Number(price))) {
        res.status(400).send({ error: 'Invalid price requested.' });
        return;
      }
      type = String(type) === 'market' ? 'market' : 'limit';
      side = String(side) === 'buy' ? 'buy' : 'sell';
      quantity = Number(quantity).toFixed(4);
      price = Number(price).toFixed(4);
      const [success, execution] = HandleOrder({
        uuid: uuidv4(),
        type,
        side,
        quantity,
        price,
        timestamp: new Date(),
      });
      const [result, transactions, order] = execution;
      if (success) {
        switch (result) {
          case 'full':
            res
              .status(200)
              .send({ message: 'Order fully executed.', order, transactions });
            break;
          case 'partial':
            res.status(200).send({
              message:
                'Order partially executed. The remainder recorded to the orderbook.',
              order,
              transactions,
            });
            break;
          case 'empty':
            res.status(200).send({
              message:
                'Order not executed. The order recorded to the orderbook.',
              order,
              transactions,
            });
            break;
          default:
            break;
        }
      } else {
        res.status(400).send({
          error:
            'Exchange unable to execute the Market Order due to liquidity issues.',
          order,
        });
      }
      return;
    },
  },
  {
    path: '/book',
    method: 'get',
    handler: async (_req: Request, res: Response) => {
      res
        .status(200)
        .send({ book: { sellQueue: SellQueue.toArray(), buyQueue: BuyQueue.toArray() } });
    },
  },
];
