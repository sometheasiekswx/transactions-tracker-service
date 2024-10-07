import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import transactionRoutes from "./routes/transactionRoutes";
import {verifyCookie} from "./middleware/jwt";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.text());
app.use('/api', verifyCookie);
app.use('/api', transactionRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).send({error: "Sorry, can't find that"});
});

export default app;
