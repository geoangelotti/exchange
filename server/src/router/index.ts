import express, { Application } from 'express';
import {
	applyMiddleware,
	applyRoutes,
	serve,
} from './utlis';
import middleware from './middleware';
import routes from './routes';

const app: Application = express();

serve(app);
applyMiddleware(app, middleware);
applyRoutes(app, routes);

export { app };
