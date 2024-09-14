import express from 'express';
import bodyParser from 'body-parser';
import {apiKeyMiddleware} from './middleware/apiKeyMiddleware';
import transactionRoutes from "./routes/transactionRoutes";

const app = express();

app.use(express.json());
app.use(bodyParser.text());
app.use('/api', apiKeyMiddleware);
app.use('/api', transactionRoutes);

app.use((req, res) => {
    res.status(404).send({error: "Sorry, can't find that"});
});

export default app;
