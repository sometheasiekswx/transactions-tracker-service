import mongoose, {Schema} from 'mongoose';

export const allowedUpdateFields = ['date', 'description', 'amount', 'status'];

// Define the TypeScript interface for the Transaction model
export interface ITransaction {
    userId: String;
    date: Date;
    description: String;
    amount: Number;
    createdAt?: Date; // Optional because Mongoose handles this automatically
    updatedAt?: Date; // Optional because Mongoose handles this automatically
    status: 'Paid' | 'Unpaid' | 'Pending';
}

// Create the Mongoose schema for the Transaction model
const transactionSchema: Schema<ITransaction> = new Schema({
    userId: {type: String, required: true},
    date: {type: Date, required: true},
    description: {type: String, required: true},
    amount: {type: Number, required: true},
    status: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Pending'], // Restricting status to these values
        default: 'Pending', // Setting the default status to Pending
        required: true,
    },
}, {timestamps: true});

transactionSchema.index({ userId: 1 });

// Create and export the Mongoose model for the Transaction schema
const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
