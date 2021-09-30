const Account = require("./cAccount");
const MalformedTransaction = require("./cMalformedTransaction");
const Parsers = require("./dataParsers");
const logs = require("log4js").getLogger("bank");
const LogFormats = require("./cLogFormats");

class Bank {
	constructor() {
		this.accounts = {};
	}
	doTransaction(transaction) {
		if (!(transaction.from.toLowerCase() in this.accounts)) {
			logs.error("Sender was not found in the bank in transaction of ${transaction.amount} from ${transaction.from} to ${transaction.to}");
			console.log("ERROR: Sender was not found in the bank");
			console.log("Transaction was not completed.");
		} else if (!(transaction.to.toLowerCase() in this.accounts)) {
			logs.error("Recipient was not found in the bank in transaction of ${transaction.amount} from ${transaction.from} to ${transaction.to}");
			console.log("ERROR: Recipient was not found in the bank");
			console.log("Transaction was not completed.");
		} else {
			if (transaction instanceof MalformedTransaction) {
				logs.warn(
					`Transaction of ${transaction.amount} from ${transaction.from} to ${transaction.to} was malformed and was written to the error list. Attempting analysis..`
				);
				const result = transaction.getMalformationAnalysis();

				if (result.success) logs.info(result.message);
				else {
					const errorContext = {
						Transaction: transaction,
						AnalysisResult: result,
					};
					logs.error(LogFormats.formatError(result.message, "Could not analyse malformation of the transaction", errorContext));
				}
				this.accounts[transaction.from.toLowerCase()].errors.push(transaction);
				this.accounts[transaction.to.toLowerCase()].errors.push(transaction);
			} else {
				this.accounts[transaction.from.toLowerCase()].balance -= transaction.amount;
				this.accounts[transaction.to.toLowerCase()].balance += transaction.amount;
				this.accounts[transaction.from.toLowerCase()].transactionHistory.push(transaction);
				this.accounts[transaction.to.toLowerCase()].transactionHistory.push(transaction);
			}
		}
	}

	createUsersFromTransaction(transaction) {
		if (!(transaction.to.toLowerCase() in this.accounts)) {
			this.accounts[transaction.to.toLowerCase()] = new Account(transaction.to);
		}
		if (!(transaction.from.toLowerCase() in this.accounts)) {
			this.accounts[transaction.from.toLowerCase()] = new Account(transaction.from);
		}
	}

	loadTransactionsFromFiles(files) {
		console.log("Loading transactions..");

		let transactionCount = 0;
		let malformedCount = 0;
		try {
			for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
				try {
					var filePath = files[fileIdx];
					console.log("Loading " + filePath);
					logs.info(`Loading transaction file "${filePath}"`);
					var transactions = [];
					if (filePath.endsWith(".csv")) {
						transactions = Parsers.CSVParser.parseTransactionsFromFile(filePath);
					} else if (filePath.endsWith(".json")) {
						transactions = Parsers.JSONParser.parseTransactionsFromFile(filePath);
					} else if (filePath.endsWith(".xml")) {
						transactions = Parsers.XMLParser.parseTransactionsFromFile(filePath);
					} else {
						console.log(`The file type of ${filePath} is not supported`);
						logs.warn(`Attempted to load an unsupported file extension at "${filePath}"`);
						continue;
					}
					for (const transaction of transactions) {
						this.createUsersFromTransaction(transaction);
						this.doTransaction(transaction);
						if (transaction instanceof MalformedTransaction) ++malformedCount;
					}
					transactionCount += transactions.length;
				} catch (err) {
					console.warn(`Failed to load transactions from "${filePath}". Check latest.log for details`);
					const errorContext = {
						Current_FilePath: filePath,
						Transactions: transactions,
						FilesPaths: files,
					};
					logs.error(LogFormats.formatError(err, `Failed to load transactions from "${filePath}"`, errorContext));
				}
			}
		} catch (err) {
			console.error(`Fatal error when loading transactions from files. Retained ${transactionCount} transactions`);
			const errorContext = {
				Current_FilePath: filePath,
				Transactions: transactions,
				FilesPaths: files,
			};
			logs.error(LogFormats.formatError(err, "Fatal error when loading transactions", errorContext));
		}

		return {
			transactions: transactionCount,
			malformed: malformedCount,
		};
	}
}
module.exports = Bank;
