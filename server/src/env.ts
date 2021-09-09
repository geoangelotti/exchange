import { config } from 'dotenv';

config();

const vars: {
	port: number;
	nodeEnv: string;
} = {
	port: Number(process.env.PORT) || 3000,
	nodeEnv: process.env.NODE_ENV || 'prod',
};

export { vars };
