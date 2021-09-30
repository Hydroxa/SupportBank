class Transaction {
	constructor(obj) {
		if (typeof obj === "string") {
			const serialised = obj;
			const properties = serialised.split(",");
			const dateComponents = properties[0].split("/");
			this.date = new Date(dateComponents[2], dateComponents[1], dateComponents[0]);
			this.from = properties[1];
			this.to = properties[2];
			this.reason = properties[3];
			this.amount = parseFloat(properties[4]);
		} else {
			const json = obj;
			this.date = new Date(json["Date"]);
			this.from = json["From"];
			this.to = json["To"];
			this.reason = json["Narrative"];
			this.amount = parseFloat(json["Amount"]);
		}
	}
}
module.exports = Transaction;
