import express, { Application } from 'express';
import morgan from 'morgan';
import { vars } from '../env';

/**
 * Express JSON Body Parser
 * @param {Application} app
 */

const jsonBodyParser = (app: Application) => {
	app.use(express.json());
};

const format =
	vars.nodeEnv === 'development'
		? 'dev'
		: ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length]';

/**
 * Morgan Logger
 * @param {Application} app
 */
const logger = (app: Application) => {
	app.use(morgan(format));
};

export default [jsonBodyParser, logger];
