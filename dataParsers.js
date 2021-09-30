const Transaction = require("./cTransaction");
const fs = require("fs");
const MalformedTransaction = require("./cMalformedTransaction");
const logs = require("log4js").getLogger("parsing");
const LogFormats = require("./cLogFormats");

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

			if (transaction.isMalformed()) {
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
			logs.error(LogFormats.formatError(err, "Failed to read file!"));
		}
	}

	static removeHeader(rawTransactionList) {
		rawTransactionList.shift();
		return rawTransactionList;
	}
}

class JSONParser {
	static parseTransactionsFromFile(filePath) {
		const rawTransactionsFile = fs.readFileSync(filePath, "utf8");
		const jsonTransactionsFile = JSON.parse(rawTransactionsFile);
		const transactions = [];
		for (let i = 0; i < jsonTransactionsFile.length; i++) {
			if (jsonTransactionsFile[i].length === 0) continue;

			const transactionObject = jsonTransactionsFile[i];
			let transaction = new Transaction(transactionObject);

			if (transaction.isMalformed()) {
				logs.debug(`Object ${i + 1} was malformed.`);
				transaction = new MalformedTransaction(transactionObject);
			}
			transactions.push(transaction);
		}

		return transactions;
	}
}

class XMLParser {}

module.exports = {
	CSVParser: CSVParser,
	JSONParser: JSONParser,
	XMLParser: XMLParser,
};
