if (require("fs").existsSync("logs/latest.log")) require("fs").renameSync("logs/latest.log", `logs/${getDateAndTime()}.log`);

const LogFormats = require("./cLogFormats");
const Bank = require("./cBank");
const validCommands = require("./commands");
const log4js = require("log4js");
const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});
readline.on("pause", commandHandler);
readline.on("close", () => logs.debug("-= INSTANCE END =-\n\n"));

log4js.configure({
	appenders: {
		commandHandler: { type: "file", filename: "logs/latest.log" },
		bank: { type: "file", filename: "logs/latest.log" },
		parsing: { type: "file", filename: "logs/latest.log" },
		accounts: { type: "file", filename: "logs/latest.log" },
		commands: { type: "file", filename: "logs/latest.log" },
	},
	categories: {
		default: { appenders: ["commandHandler"], level: "debug" },
	},
});

const logs = log4js.getLogger("commandHandler");
logs.debug("Hello, World! Logger has intialised");

const bank = new Bank();
const transactionFilePath = "./Transactions/";

function getDateAndTime() {
	const now = new Date();
	return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} @ ${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`;
}

function commandHandler(transactionCount) {
	if (typeof transactionCount === "number") console.log(`Loaded ${transactionCount} transactions`);

	readline.question("> ", (cmdInput) => {
		logs.debug(`User input command "${cmdInput}"`);
		console.log();
		const params = cmdInput.split(" ");
		logs.debug(`Found parameters as: ${params}`);
		try {
			if (params[0].toLowerCase() in validCommands) {
				logs.debug("Executing command..");

				const time = Date.now();
				validCommands[params[0].toLowerCase()].func(params.slice(1));
				const now = Date.now();
				logs.debug(`Command execution complete (${now - time < 1 ? "<1" : now - time}ms)`);
			} else {
				console.log('That was not a valid command.\nUse "help" to see a list of all valid commands!');
				logs.debug("Command was not found in dictionary");
			}
		} catch (err) {
			console.error("An error occurred when executing the command! See latest.log for details.");
			const errContext = {
				Params: params,
				CommandInput: cmdInput,
				ValidCommands: validCommands,
			};
			logs.error(LogFormats.formatError(err, `Error occurred in the execution of ${cmdInput}`, errContext));
		}
		readline.pause();
	});
}

validCommands.setBank(bank);
const transactionFiles = require("fs").readdirSync(transactionFilePath);
for (let i = 0; i < transactionFiles.length; i++) transactionFiles[i] = transactionFilePath + "/" + transactionFiles[i];
logs.debug(`Discovered files in folder: ${transactionFiles}`);
commandHandler(bank.loadTransactionsFromFiles(transactionFiles));
