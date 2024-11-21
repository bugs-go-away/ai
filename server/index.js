import express from 'express';
import cors from 'cors';
import path from 'path';

// Routers
import chatRouter from './routes/chatRouter.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static('../'));

// static routes a little later.
app.use('/chat', chatRouter);

// Catch-all route
app.use('/', (_req, res, _next) => {
	res.status(404).json({ err: 'you got a 404, thats an error' });
});

//Global error handler
app.use((err, _req, res, _next) => {
	const defaultError = {
		log: `An unexpected error occurred`,
		status: 500,
		message: { err: 'An error occurred' },
	};
	const customErr = Object.assign({}, defaultError, err);
	console.log(customErr.log);
	return res
		.status(customErr.status)
		.json(Object.assign({}, { ok: false }, { message: customErr.message }));
});

// Listening on PORT 3000
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
