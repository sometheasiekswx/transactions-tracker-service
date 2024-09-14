import express from "express";
import {
    addTransaction,
    addTransactions,
    deleteTransaction,
    updateTransaction
} from "../controllers/transactionController";

const router = express.Router();

router.post(["/transactions", "/statements"], addTransactions);
router.post(["/transaction"], addTransaction);
router.delete("/transaction/:id", deleteTransaction)
router.put("/transaction/:id", updateTransaction)


export default router;
