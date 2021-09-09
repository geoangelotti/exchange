import express, { Application } from 'express';
import morgan from 'morgan';
import { vars } from '../env';

const handleBodyRequestParsing = (app: Application) => {
  app.use(express.json());
};

const format =
  vars.nodeEnv === 'development'
    ? 'dev'
    : ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length]';

const logger = (app: Application) => {
  app.use(morgan(format));
};

export default [handleBodyRequestParsing, logger];
