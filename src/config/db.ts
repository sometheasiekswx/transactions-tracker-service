import mongoose from 'mongoose';

// TODO: Return different a connection string depending on if its Development or Production environment
function getConnectionString(): string {
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
        throw new Error('MONGODB_URL is not defined in the environment variables');
    }
    return connectionString;
}

// TODO: Return different a database name depending on if its Development or Production environment
function getDBName(): string {
    const dbName = process.env.MONGODB_DB_NAME;
    if (!dbName) {
        throw new Error('MONGODB_DB_NAME is not defined in the environment variables');
    }
    return dbName;
}

export async function connectDB() {
    try {
        const connectionString = getConnectionString();
        const dbName = getDBName();
        await mongoose.connect(connectionString!, {
            serverApi: {version: '1', strict: true, deprecationErrors: true}, dbName: dbName,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
}
