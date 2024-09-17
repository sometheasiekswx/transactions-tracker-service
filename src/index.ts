import * as dotenv from "dotenv";
import app from "./app";
import {checkEnv} from "./config/env";
import {connectDB} from "./config/db";


declare global {
    namespace Express {
        interface Request {
            authUser: { id: String, iat: number, exp: number }; // You can adjust the type according to your needs
        }
    }
}


dotenv.config();
checkEnv(["PORT", "MONGODB_URI", "MONGODB_DB_NAME", "JWT_SECRET"]);
connectDB();

app.listen(process.env.PORT, () => {
    console.log(`transactions-tracker-service listening on port ${process.env.PORT}`)
})