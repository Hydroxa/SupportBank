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
			let transaction = Transaction.createFromString(transactionText);

			if (transaction.isMalformed()) {
				logs.debug(`Line ${i + 1} was malformed.`);
				transaction = MalformedTransaction.createFromString(transactionText);
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
			console.error("Could not read the file! Check .\\logs\\latest.logs for details");
			logs.error(LogFormats.formatError(err, "Failed to read file!"));
			return "";
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
			let transaction = Transaction.createFromJSON(transactionObject);

			if (transaction.isMalformed()) {
				logs.debug(`Object ${i + 1} was malformed.`);
				transaction = MalformedTransaction.createFromJSON(transactionObject);
			}
			transactions.push(transaction);
		}

		return transactions;
	}
}

class XMLParser {
	static parseTransactionsFromFile(filePath) {
		logs.warn("XML Parsing is not fully implemented yet! This call will result in an error");

		const transactions = [];
		try {
			const transactionFileLines = this.readTransactionFileLines(filePath);
			const OLEconversionRatio = 24 * 2600 * 1000;

			let transactionBuilding = false;
			let transaction;
			for (let i = 0; i < transactionFileLines.length; i++) {
				const line = transactionFileLines[i];
				if (line.indexOf("<SupportTransaction") !== -1) {
					if (transactionBuilding) {
						throw Error(`Incomplete Transaction. Expected end at line ${i + 1}`);
					} else {
						transactionBuilding = true;
					}
					transaction = new Transaction();
					transaction.date = new Date();
					transaction.date.setTime((Number(line.split('"')[1]) - 25569) * OLEconversionRatio);
				} else if (line.indexOf("</SupportTransaction>") !== -1) {
					transactions.push(transaction);
					transactionBuilding = false;
				} else if (transactionBuilding) {
					if (line.indexOf("<Description>") !== -1) {
						transaction.reason = line.substring(line.indexOf(">") + 1, line.lastIndexOf("<"));
					} else if (line.indexOf("<Value>") !== -1) {
						transaction.amount = Number(line.substring(line.indexOf(">") + 1, line.lastIndexOf("<")));
					} else if (line.indexOf("<From>") !== -1) {
						transaction.from = line.substring(line.indexOf(">") + 1, line.lastIndexOf("<"));
					} else if (line.indexOf("<To>") !== -1) {
						transaction.to = line.substring(line.indexOf(">") + 1, line.lastIndexOf("<"));
					}
				}
			}
		} catch (err) {
			console.error("Could not read the file! Check .\\logs\\latest.logs for details");
			logs.error(LogFormats.formatError(err, "Error when reading file!"));
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
			console.error("Could not read the file! Check .\\logs\\latest.logs for details");
			logs.error(LogFormats.formatError(err, "Failed to read file!"));
			return [];
		}
	}

	static removeHeader(rawTransactionList) {
		rawTransactionList.shift();
		return rawTransactionList;
	}
}

module.exports = {
	CSVParser: CSVParser,
	JSONParser: JSONParser,
	XMLParser: XMLParser,
};
