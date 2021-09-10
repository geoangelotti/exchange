import { config } from 'dotenv';

config();

const vars: {
	port: number;
	nodeEnv: string;
} = {
	port: Number(process.env.PORT) || 3000,
	nodeEnv: String(process.env.NODE_ENV),
};

export { vars };
