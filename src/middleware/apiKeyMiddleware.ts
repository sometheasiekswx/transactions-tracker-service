import {NextFunction, Request, Response} from "express";
import ApiKey from "../models/ApiKey";

interface CustomRequest extends Request {
    key?: string;
}

export async function apiKeyMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).send("API key required");
    }

    const key = authHeader.split(" ")[1];

    try {
        const existingApiKey = await ApiKey.findOne({bearer_token: key}).exec();

        if (!existingApiKey) {
            return res.status(401).send("Invalid API key");
        }

        req.key = key;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send("Database connection error");
    }
}
