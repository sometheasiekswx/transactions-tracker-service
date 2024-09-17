export function checkEnv(envs: string[]) {
    for (const variable of envs) {
        if (!process.env[variable]) {
            const errorMessage = `${variable} is not present in .env`;
            throw new Error(errorMessage);
        }
    }
}