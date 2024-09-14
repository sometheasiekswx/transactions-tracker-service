// Utility function to parse a line with date
export function isValidDateLine(line: string): boolean {
    return /^[0-9]{2} [A-Z]{3}/.test(line);
}

// Regex to extract amount at the end of a line (e.g., "$75.44")
export const amountRegex = /\$[\d,.]+/;

// Function to check if a line is a transfer
export function isTransferLine(line: string): boolean {
    return /TRANSFER|PAYMENT FROM|MOBILE PHONE BANKING|ANZ M-BANKING/.test(line);
}

export function parseDate(dateString: string): Date {
    const formattedDate = convertToProperDate(dateString); // Assuming this returns "YYYY-MM-DD"
    return new Date(formattedDate); // Convert to Date object
}

// Function to convert "DD MMM" format to "YYYY-MM-DD"
export function convertToProperDate(dateString: string): string {
    // Split the input date string ("10 SEP") into day and month
    let [day, month] = dateString.split(" ");

    // Ensure day and month are defined
    if (!day || !month) {
        throw new Error(`Invalid date string format: ${dateString}`);
    }

    // Create a mapping for month abbreviations to month numbers
    const months: Record<string, string> = {
        "JAN": "01",
        "FEB": "02",
        "MAR": "03",
        "APR": "04",
        "MAY": "05",
        "JUN": "06",
        "JUL": "07",
        "AUG": "08",
        "SEP": "09",
        "OCT": "10",
        "NOV": "11",
        "DEC": "12"
    };

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Check if the provided month exists in the mapping, and convert
    month = months[month.toUpperCase()];

    if (!month) {
        throw new Error(`Invalid month abbreviation: ${month}`);
    }

    // Construct the proper date in "YYYY-MM-DD" format
    const formattedDate = `${currentYear}-${month}-${day.padStart(2, "0")}`;

    // Check if the date is valid by creating a new Date object
    const dateObject = new Date(formattedDate);

    // If the date is invalid, throw an error
    if (isNaN(dateObject.getTime())) {
        throw new Error(`Invalid date: ${formattedDate}`);
    }

    return formattedDate;
}