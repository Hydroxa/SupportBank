const Command = require("./cCommand");
const printTable = require("./printTable");
const logs = require("log4js").getLogger("commands");

const validCommands = {
	setBank: setBank,
	list: new Command(list, "Lists details about an account. Run without parameters for usage"),
	help: new Command(help, "Displays this message!"),
	import: new Command(importFile, "Imports the file provided"),
};
module.exports = validCommands;

let bank;

function setBank(bankArg) {
	bank = bankArg;
}

function importFile(args) {
	const fileName = args.join(" ");
	const fs = require("fs");
	if (fs.existsSync(fileName)) {
		logs.debug("File existed");
		let transactionsImportedAmt = bank.loadTransactionsFromFiles([fileName]);
		console.log(`Imported ${transactionsImportedAmt} transactions`);
		logs.info(`Imported ${transactionsImportedAmt} transactions`);
	} else {
		console.log("Cannot import: Could not find file. Did you make a typo?");
		logs.warn("File did not exist");
	}
}

function help() {
	console.log("-=≡[ Valid Commands ]≡=-");
	for (let command in validCommands) {
		if (validCommands[command] instanceof Command) {
			console.log("\t" + command + " - " + validCommands[command].description);
		}
	}
	console.log("-=≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡=-");
}

function list(args) {
	if (!args[0]) {
		console.log(
			"Usage: \n\tlist all    - Lists all accounts and their balance\n\tlist errors - Lists all accounts and their errors\n\tlist <name> - Lists all transaction details about a specified account"
		);
	} else if (args[0].toLowerCase() === "all") {
		HelperMethods.listAll();
	} else if (args[0].toLowerCase() === "errors") {
		HelperMethods.listErrors();
	} else {
		const name = args.join(" ");
		HelperMethods.listName(name);
	}
}

class HelperMethods {
	static listName(name) {
		const logs = require("log4js").getLogger("bank");
		logs.debug(`User requested to see details for "${name}"`);
		if (name.toLowerCase() in bank.accounts) {
			const account = bank.accounts[name.toLowerCase()];
			console.log(`Displaying details for "${account.name}"`);
			console.log("----");
			console.log(
				`${account.name} has £${account.balance.toFixed(2)} and is part of ${account.transactionHistory.length} transaction${
					account.transactionHistory.length == 1 ? ".\n" : "s.\n"
				}`
			);
			console.log("Transactions -=≡≡≡≡≡≡≡≡≡");

			printTable(["Date", "From", "To", "Reason", "Amount"], account.transactionHistory, (transaction) => {
				return [
					transaction.date.toDateString(),
					transaction.from,
					transaction.to,
					transaction.reason,
					transaction.from == account.name ? (-transaction.amount).toFixed(2) : transaction.amount.toFixed(2),
				];
			});

			if (account.errors.length > 0) {
				console.log("\nThis user has some malformed transactions.");
				console.log("\nMalformed Transactions -=≡≡≡≡≡≡≡≡≡");

				printTable(["Date", "From", "To", "Reason", "Amount"], account.errors, (transaction) => {
					return [
						transaction.date,
						transaction.from,
						transaction.to,
						transaction.reason,
						transaction.from == account.name ? "-" + transaction.amount : transaction.amount,
					];
				});
			}
		} else {
			console.log(`The user \"${name}" was not found within the database.`);
		}
	}

	static listAll() {
		const names = [];
		for (let name in bank.accounts) {
			names.push(name);
		}

		printTable(["Name", "Balance"], names, (item) => {
			return [bank.accounts[item].name, bank.accounts[item].balance.toFixed(2)];
		});
	}

	static listErrors() {
		const names = [];
		for (let name in bank.accounts) {
			names.push(name);
		}

		printTable(["Name", "Errors"], names, (item) => {
			return [bank.accounts[item].name, bank.accounts[item].errors.length.toString()];
		});
	}
}
