const Bank = require("./cBank");
const validCommands = require("./commands");
const log4js = require("log4js");
const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});
readline.on("pause", commandHandler);

log4js.configure({
	appenders: {
		commandHandler: { type: "file", filename: "logs/debug.log" },
		bank: { type: "file", filename: "logs/debug.log" },
		parsing: { type: "file", filename: "logs/debug.log" },
		accounts: { type: "file", filename: "logs/debug.log" },
		list: { type: "file", filename: "logs/debug.log" },
		export: { type: "file", filename: "logs/debug.log" },
		import: { type: "file", filename: "logs/debug.log" },
	},
	categories: {
		default: { appenders: ["commandHandler"], level: "debug" },
	},
});
const logs = log4js.getLogger("commandHandler");
logs.debug("Hello, World! Logger has intialised");

const bank = new Bank();

function commandHandler(transactionCount) {
	if (typeof transactionCount === "number") console.log(`Loaded ${transactionCount} transactions`);

	readline.question("> ", (cmdInput) => {
		logs.debug(`User input command "${cmdInput}"`);
		console.log();
		const params = cmdInput.split(" ");
		logs.debug(`Found parameters as ${params}`);
		if (params[0].toLowerCase() in validCommands) {
			logs.debug("Executing command..");
			const time = Date.now();
			validCommands[params[0].toLowerCase()].func(params.slice(1));
			logs.debug(`Command execution complete (${Date.now() - time < 1 ? "<1" : Date.now() - time}ms)`);
		} else {
			console.log('That was not a valid command.\nUse "help" to see a list of all valid commands!');
			logs.debug("Command was not found in dictionary");
		}

		readline.pause();
	});
}

validCommands.setBank(bank);
bank.loadTransactionsFromFiles(["Transactions2014.csv", "DodgyTransactions2015.csv"], commandHandler);
logs.debug("-= INSTANCE END =-\n\n");
