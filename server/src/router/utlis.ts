import { Application, Request, Response, NextFunction } from 'express';
import { vars } from '../env';

/**
 * @type {Wrapper}
 */

type Wrapper = (app: Application) => void;

/**
 * @function applyMiddleware
 * @param {Application} app
 * @param {Wrapper[]} middlewareWrappers
 */

const applyMiddleware = (app: Application, middlewareWrappers: Wrapper[]) => {
	middlewareWrappers.forEach(wrapper => wrapper(app));
};

/**
 * @type {Handler}
 * express handle route function
 */

type Handler = (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<void>;

/**
 * @type {Route}
 */

type Route = {
	path: string;
	method: string;
	handler: Handler | Handler[];
};

/**
 * @function catchErrors passes errors to @type {NextFunction} for default express error handling
 * @param {Handler| Handler[]} fn
 * @returns {Promise<void | Handler>}
 */

const catchErrors = (fn: Handler | Handler[]) => (
	req: Request,
	res: Response,
	next: NextFunction
) =>
	Array.isArray(fn)
		? Promise.any(fn).catch(next)
		: fn(req, res, next).catch(next);

/**
 * @function applyRoutes
 * @param {Application} app
 * @param {Route[]}routes
 */

const applyRoutes = (app: Application, routes: Route[]) => {
	routes.forEach(route => {
		const { method, path, handler } = route;
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		(<any>app)[method](path, catchErrors(handler));
	});
};

/**
 * @function serve
 * @param {Application} app
 */

const serve = (app: Application) => {
	const { port, nodeEnv } = vars;
	app.listen(port, () => {
		console.log(`[express] ${nodeEnv} application served on ${port}`);
	});
};

export { applyMiddleware, applyRoutes, serve };
