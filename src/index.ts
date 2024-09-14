import * as dotenv from "dotenv";
import app from "./app";
import {checkEnv} from "./config/env";
import {connectDB} from "./config/db";

dotenv.config();
checkEnv();
connectDB();

app.listen(process.env.PORT, () => {
    console.log(`transactions-tracker-service listening on port ${process.env.PORT}`)
})