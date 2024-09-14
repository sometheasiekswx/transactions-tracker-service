import mongoose, {Schema} from 'mongoose';

export const allowedUpdateFields = ['date', 'description', 'amount'];

// Define the TypeScript interface for the Transaction model
export interface ITransaction {
    date: Date;
    description: string;
    amount: Number;
    createdAt?: Date; // Optional because Mongoose handles this automatically
    updatedAt?: Date; // Optional because Mongoose handles this automatically
}

// Create the Mongoose schema for the Transaction model
const transactionSchema: Schema<ITransaction> = new Schema({
    date: {type: Date, required: true},
    description: {type: String, required: true},
    amount: {type: Number, required: true}
}, {timestamps: true});

// Create and export the Mongoose model for the Transaction schema
const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
