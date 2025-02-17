import Transaction, {allowedUpdateFields, ITransaction} from "../models/Transaction";
import {Request, Response} from "express";
import {amountRegex, isTransferLine, isValidDateLine, parseDate} from "../utils/processLineUtils";
import {convertMoneyToAUD} from "../utils/convertToAud";
import mongoose from "mongoose";

export async function getTransactionsAllPeriodLast12Months(req: Request, res: Response) {
    if (!req.authUser || !req.authUser.id) {
        return res.status(401).json({message: "Unauthorized"});
    }

    try {
        const queryBelongToUser: any = {userId: req.authUser.id};
        const monthsFrom = new Date();
        const monthsTo = new Date();
        monthsFrom.setMonth(monthsFrom.getMonth() - 1);

        const totalSpending = []
        for (let i = 0; i < 12; i++) {
            monthsFrom.setMonth(monthsFrom.getMonth() - 1);
            monthsFrom.setDate(1);

            monthsTo.setDate(1);
            monthsTo.setDate(monthsTo.getDate() - 2)

            const queryFromMonthToMonth = {
                $and: [queryBelongToUser, {date: {$gte: monthsFrom, $lte: monthsTo}}]
            }

            const monthlySpending = await Transaction.aggregate([{$match: queryFromMonthToMonth}, {
                $group: {
                    _id: {
                        year: {$year: "$date"}, month: {$month: "$date"}
                    }, totalSpent: {$sum: "$amount"}
                }
            }, {$sort: {"_id.year": 1, "_id.month": 1}}]);
            if (monthlySpending.length !== 0) {
                totalSpending.push(monthlySpending[0]);
            }

            monthsTo.setDate(monthsTo.getDate() + 2)
            monthsTo.setMonth(monthsTo.getMonth() - 1);
        }

        res.status(200).json({
            message: "Transactions retrieved successfully", totalSpending,
        });
    } catch (error) {
        console.error('Error retrieving transactions:', error);
        res.status(500).json({message: 'Server error'});
    }
}

export async function getTransactionsAllStatusCount(req: Request, res: Response) {
    // Ensure the user is authenticated
    if (!req.authUser || !req.authUser.id) {
        return res.status(401).json({message: "Unauthorized"});
    }

    try {
        const queryBelongToUser: any = {userId: req.authUser.id};
        const totalTransactions = await Transaction.countDocuments(queryBelongToUser);

        const queryStatusPaid = {
            $and: [queryBelongToUser, {status: "Paid"}]
        }
        const totalPaidTransactions = await Transaction.countDocuments(queryStatusPaid);

        const queryStatusPending = {
            $and: [queryBelongToUser, {status: "Pending"}]
        }
        const totalPendingTransactions = await Transaction.countDocuments(queryStatusPending);

        const queryStatusUnpaid = {
            $and: [queryBelongToUser, {status: "Unpaid"}]
        }
        const totalUnpaidTransactions = await Transaction.countDocuments(queryStatusUnpaid);

        res.status(200).json({
            message: "Transaction status counts retrieved successfully",
            totalTransactions,
            totalPaidTransactions,
            totalPendingTransactions,
            totalUnpaidTransactions,
        });
    } catch (error) {
        console.error('Error retrieving transactions:', error);
        res.status(500).json({message: 'Server error'});
    }
}

export async function getTransactionsAll(req: Request, res: Response) {
    const {page = 1, limit = 100, query = ''} = req.query; // Default page is 1 and limit is 100 per page

    // Ensure the user is authenticated
    if (!req.authUser || !req.authUser.id) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);

    try {
        // Build the query object
        const queryObject: any = {userId: req.authUser.id};

        // If the query is not empty, add conditions to the query object
        if (query) {
            const regex = new RegExp(query as string, 'i'); // Case-insensitive regex
            queryObject.$or = [{description: {$regex: regex}}, {status: {$regex: regex}},];
        }

        // Fetch the total count of transactions for the user
        // const totalTransactions = await Transaction.countDocuments({userId: req.authUser.id});
        const totalTransactions = await Transaction.countDocuments(queryObject);

        // Calculate the total pages
        const totalPages = Math.ceil(totalTransactions / limitNumber);


        // Fetch the transactions with pagination (skip and limit)
        const transactions = await Transaction.find(queryObject)
            .sort({
                createdAt: -1 // Sort by date descending
            })
            .skip((pageNumber - 1) * limitNumber) // Skip the previous pages
            .limit(limitNumber) // Limit the number of results per page
            .exec();

        res.status(200).json({
            message: "Transactions retrieved successfully",
            totalTransactions,
            totalPages,
            currentPage: pageNumber,
            transactions
        });
    } catch (error) {
        console.error('Error retrieving transactions:', error);
        res.status(500).json({message: 'Server error'});
    }
}

export async function getTransaction(req: Request, res: Response) {
    const {id} = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({message: "Invalid ID format"});
    }

    try {
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({message: "Transaction not found"});
        }

        // Check if the transaction belongs to the authenticated user
        if (transaction.userId !== req.authUser.id) {
            return res.status(403).json({message: "User does not own the transaction"});
        }

        res.status(200).json({message: "Transaction retrieved successfully", transaction: transaction});
    } catch (error) {
        console.error('Error retrieving transaction:', error);
        res.status(500).json({message: 'Server error'});
    }
}

async function retrieveTransaction(id: string, userId: String) {
    try {
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return {};
        }

        if (transaction.userId !== userId) {
            return {};
        }

        return transaction;
    } catch (error) {
        console.error('Error retrieving transaction:', error);
        return new Error(`Error retrieving transaction ${error}`);
    }
}

export async function getTransactions(req: Request, res: Response) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send("Request body is empty");
    }

    const data = req.body;

    // Validate that at least one field is provided
    if (Object.keys(data).length === 0) {
        return res.status(400).json({message: 'No fields provided for update'});
    }

    const invalidFields = Object.keys(data).filter(field => !["ids"].includes(field));

    if (invalidFields.length > 0) {
        return res.status(400).json({message: `Invalid fields: ${invalidFields.join(', ')}`});
    }

    try {
        const transactions = [];
        for (const id of data.ids) {
            transactions.push(await retrieveTransaction(id, req.authUser.id));
        }
        res.status(200).json({message: "Transactions retrieved successfully", transactions: transactions});
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({message: 'Server error'});
    }
}

export async function updateTransactions(req: Request, res: Response) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send("Request body is empty");
    }

    const results = [];

    for (const newData of req.body) {
        if (!mongoose.isValidObjectId(newData._id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }

        // Validate that at least one field is provided
        if (Object.keys(newData).length === 0) {
            return res.status(400).json({message: 'No fields provided for update'});
        }

        const {_id, ...newDataNoId} = newData

        const invalidFields = Object.keys(newDataNoId).filter(field => !allowedUpdateFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({message: `Invalid fields: ${invalidFields.join(', ')}`});
        }

        try {

            const transaction = await Transaction.findById(_id);

            if (!transaction) {
                return res.status(404).json({message: "Transaction not found"});
            }

            // Check if the transaction belongs to the authenticated user
            if (transaction.userId !== req.authUser.id) {
                return res.status(403).json({message: "User does not own the transaction"});
            }

            const result = await transaction.updateOne(newDataNoId, {new: true, runValidators: true});
            results.push(result)
        } catch (error) {
            console.error('Error updating transaction:', error);
            res.status(500).json({message: 'Server error'});
        }
    }

    res.status(200).json({message: "Transactions updated successfully", results: results});
}

export async function updateTransaction(req: Request, res: Response) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send("Request body is empty");
    }

    const {id} = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({message: "Invalid ID format"});
    }

    const newData = req.body;

    // Validate that at least one field is provided
    if (Object.keys(newData).length === 0) {
        return res.status(400).json({message: 'No fields provided for update'});
    }

    const invalidFields = Object.keys(newData).filter(field => !allowedUpdateFields.includes(field));

    if (invalidFields.length > 0) {
        return res.status(400).json({message: `Invalid fields: ${invalidFields.join(', ')}`});
    }

    try {
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({message: "Transaction not found"});
        }

        // Check if the transaction belongs to the authenticated user
        if (transaction.userId !== req.authUser.id) {
            return res.status(403).json({message: "User does not own the transaction"});
        }

        const result = await transaction.updateOne(newData, {new: true, runValidators: true});

        res.status(200).json({message: "Transaction updated successfully", result: result});
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({message: 'Server error'});
    }
}

export async function deleteTransaction(req: Request, res: Response) {
    const {id} = req.params;

    // Validate the ID format
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({message: "Invalid ID format"});
    }

    try {
        // Find the transaction by ID and delete it
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({message: "Transaction not found"});
        }

        // Check if the transaction belongs to the authenticated user
        if (transaction.userId !== req.authUser.id) {
            return res.status(403).json({message: "User does not own the transaction"});
        }

        const result = await transaction.deleteOne();

        res.status(200).json({message: "Transaction successfully deleted", result: result});
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({message: "Server error"});
    }
}

export async function addTransaction(req: Request, res: Response) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send("Request body is empty");
    }

    const {date, description, amount, status} = req.body;

    if (!date || !description || typeof amount !== "number") {
        return res.status(400).send("Invalid transaction data");
    }

    try {
        const transactionDate = new Date(date);
        const newTransaction = {
            userId: req.authUser.id, date: transactionDate, description: description, amount: amount, status: status
        };
        const createdTransaction = await Transaction.create(newTransaction);

        return res.status(201).send({message: "Transaction added successfully", transaction: createdTransaction});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Database connection error");
    }
}

export async function addTransactionsANZ(req: Request, res: Response): Promise<Response> {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send("Request body is empty");
    }

    const rawBody: string = req.body;
    const lines: string[] = rawBody
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);  // Clean up data

    const transactions: ITransaction[] = [];
    let date: Date | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (isValidDateLine(line)) {
            date = parseDate(line);  // Capture the date
            continue;
        }

        // Skip transfers or balance lines
        if (isTransferLine(line) || (amountRegex.test(line) && lines[i + 1] && isTransferLine(lines[i + 1]))) {
            console.log(`Ignoring transfer or balance line: ${line}`);
            continue;
        }

        // Handle POS Transactions
        if (amountRegex.test(line)) {
            const amountMatch = line.match(amountRegex);
            const amountStr = amountMatch ? amountMatch[0] : null;
            const amount = convertMoneyToAUD(amountStr || "");

            const description = line.replace(amountRegex, "").trim();  // Remove amount from description

            // Store the POS transaction
            if (amountStr && description) {
                transactions.push({
                    userId: req.authUser.id, date: date!, description: description, amount: amount, status: "Pending"
                });
            }
        }
    }

    if (transactions.length === 0) {
        return res.status(404).send("No transactions found.");
    }

    try {
        const transactionsAdded = [];
        for (const transaction of transactions) {
            console.log(`|| Processing Transaction ${transaction.description}`);

            const existingTransaction = await Transaction.findOne({
                date: transaction.date, description: transaction.description, amount: transaction.amount
            }).exec();

            if (!existingTransaction) {
                const createdTransaction = await Transaction.create(transaction);
                transactionsAdded.push(createdTransaction)
            } else {
                console.log("Skipping duplicate transaction");
            }
        }

        return res.status(200).send({message: "Transactions added successfully", transactionsAdded: transactionsAdded});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Database connection error");
    }
}