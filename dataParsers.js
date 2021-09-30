const Transaction = require("./cTransaction");
const fs = require("fs");
const MalformedTransaction = require("./cMalformedTransaction");
const logs = require("log4js").getLogger("parsing");

class CSVParser {
	static parseTransactionsFromFile(filePath) {
		logs.debug(`Attempting to read ${filePath} as a CSV file`);
		const rawTransactionsLines = this.readTransactionFileLines(filePath);
		logs.debug(`Received ${rawTransactionsLines.length} lines`);

		const transactions = [];
		for (let i = 0; i < rawTransactionsLines.length; i++) {
			if (rawTransactionsLines[i] === "") continue;

			const transactionText = rawTransactionsLines[i];
			let transaction = new Transaction(transactionText);

			if (isNaN(transaction.date.getTime()) || isNaN(transaction.amount)) {
				logs.debug(`Line ${i + 1} was malformed.`);
				transaction = new MalformedTransaction(transactionText);
			}
			transactions.push(transaction);
		}

		return transactions;
	}
	static readTransactionFileLines(filePath) {
		try {
			logs.debug("Reading..");
			const now = Date.now();
			const rawTransactionFile = fs.readFileSync(filePath, "utf8");
			logs.debug(`Read complete! (${Date.now() - now < 1 ? "<1" : Date.now() - now}ms)`);
			const rawTransactionsText = this.removeHeader(rawTransactionFile.split("\n"));
			return rawTransactionsText;
		} catch (err) {
			console.error("Could not read the file! Check .\\logs\\debug.logs for details");
			logs.debug(`Failed to read file!\n${err}`);
		}
	}

	static removeHeader(rawTransactionList) {
		rawTransactionList.shift();
		return rawTransactionList;
	}
}

class JSONParser {}

class XMLParser {}

module.exports = {
	CSVParser: CSVParser,
	JSONParser: JSONParser,
	XMLParser: XMLParser,
};
