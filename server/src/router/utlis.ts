import { Application, Request, Response, NextFunction } from 'express';
import { vars } from '../env';

type Wrapper = (app: Application) => void;

const applyMiddleware = (app: Application, middlewareWrappers: Wrapper[]) => {
	middlewareWrappers.forEach(wrapper => wrapper(app));
};

type Handler = (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<void> | void;

type Route = {
	path: string;
	method: string;
	handler: Handler | Handler[];
};

const catchErrors = (fn: any) => (
	req: Request,
	res: Response,
	next: NextFunction
) => fn(req, res, next).catch(next);

const applyRoutes = (router: Application, routes: Route[]) => {
	routes.forEach(route => {
		const { method, path, handler } = route;
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		(<any>router)[method](path, catchErrors(handler));
	});
};

const serve = (app: Application) => {
	const { port, nodeEnv } = vars;
	app.listen(port, () => {
		console.log(`[express] ${nodeEnv} application served on ${port}`);
	});
};

export { applyMiddleware, applyRoutes, serve };
