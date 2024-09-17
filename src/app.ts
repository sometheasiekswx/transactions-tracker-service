import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import transactionRoutes from "./routes/transactionRoutes";
import {verifyJwt} from "./middleware/jwt";

const app = express();

app.use(express.json());
app.use(bodyParser.text());
app.use('/api', verifyJwt);
app.use('/api', transactionRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).send({error: "Sorry, can't find that"});
});

export default app;
