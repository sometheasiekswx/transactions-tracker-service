import express from "express";
import {
    addTransaction,
    addTransactionsANZ,
    deleteTransaction,
    getTransaction,
    getTransactions,
    getTransactionsAll,
    getTransactionsAllPeriodLast12Months,
    getTransactionsAllStatusCount,
    updateTransaction,
    updateTransactions
} from "../controllers/transactionController";

const router = express.Router();

router.get(["/transactions/all"], getTransactionsAll);
router.get(["/transactions/all/period/last-12-months"], getTransactionsAllPeriodLast12Months);
router.get(["/transactions/all/status"], getTransactionsAllStatusCount);
router.get(["/transactions"], getTransactions);
router.get(["/transaction/:id"], getTransaction);
router.post(["/transactions/anz"], addTransactionsANZ);
router.post(["/transaction"], addTransaction);
router.delete("/transaction/:id", deleteTransaction)
router.put("/transaction/:id", updateTransaction)
router.put("/transactions", updateTransactions)


export default router;
