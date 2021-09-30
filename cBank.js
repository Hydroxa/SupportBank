const Account = require("./cAccount");
const MalformedTransaction = require("./cMalformedTransaction");
const Parsers = require("./dataParsers");
const logs = require("log4js").getLogger("bank");

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
				else logs.error(result.message);

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

	loadTransactionsFromFiles(files, callback) {
		console.log("Loading transactions..");

		let transactionLength = 0;
		try {
			for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
				const filePath = files[fileIdx];
				console.log("Loading " + filePath);
				let transactions = [];
				if (filePath.endsWith(".csv")) {
					transactions = Parsers.CSVParser.parseTransactionsFromFile(filePath);
				}
				transactionLength += transactions.length;
				for (let i = 0; i < transactions.length; i++) {
					this.createUsersFromTransaction(transactions[i]);
					this.doTransaction(transactions[i]);
				}
			}
		} catch (err) {
			console.error(err);
		} finally {
			callback(transactionLength);
		}
	}
}
module.exports = Bank;
