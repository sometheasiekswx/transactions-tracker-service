// Function to convert a money string to an AUD number
export function convertMoneyToAUD(moneyString: string): number {
    // Regular expression to match numeric amount and optional currency symbols
    const match = moneyString.match(/([0-9.,]+)\s*([A-Za-z$]*)/);

    if (match) {
        // Extract and normalize the numeric part
        let amount = parseFloat(match[1].replace(/,/g, ''));

        // Check if amount is valid
        if (isNaN(amount)) {
            throw new Error('Invalid amount');
        }

        // Optional: Handle different currency symbols (if needed in future)
        // For now, everything is considered AUD

        return amount;
    }
    return 0;
}