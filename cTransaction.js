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
			this.amount = Number(properties[4]);
		} else {
			const json = obj;
			this.date = new Date(json["Date"]);
			this.from = json["FromAccount"];
			this.to = json["ToAccount"];
			this.reason = json["Narrative"];
			this.amount = Number(json["Amount"]);
		}
	}

	isMalformed() {
		return isNaN(this.date.getTime()) || isNaN(this.amount) || typeof this.from !== "string" || typeof this.to !== "string" || typeof this.reason !== "string";
	}
}
module.exports = Transaction;
