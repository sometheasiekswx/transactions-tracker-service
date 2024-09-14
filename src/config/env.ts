export function checkEnv() {
    const requiredEnvVars = ['PORT', 'MONGODB_URI', 'MONGODB_DB_NAME'];
    for (const variable of requiredEnvVars) {
        if (!process.env[variable]) {
            const errorMessage = `${variable} is not present in .env`;
            throw new Error(errorMessage);
        }
    }
}