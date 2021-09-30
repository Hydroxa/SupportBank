class MalformedTransaction {
	constructor(obj) {
		if (typeof obj === "string") {
			const serialised = obj;
			const properties = serialised.split(",");
			this.date = properties[0];
			this.from = properties[1];
			this.to = properties[2];
			this.reason = properties[3];
			this.amount = properties[4];
		} else {
			this.date = json["Date"];
			this.from = json["From"];
			this.to = json["To"];
			this.reason = json["Narrative"];
			this.amount = json["Amount"];
		}
	}

	getMalformedParts() {
		const errors = [];

		const dateComponents = this.date.split("/");
		const tryDate = new Date(dateComponents[2], dateComponents[1], dateComponents[0]);
		if (isNaN(tryDate.getTime())) {
			errors.push("date");
		}

		if (isNaN(parseFloat(this.amount))) {
			errors.push("amount");
		}

		return errors;
	}

	getMalformationAnalysis() {
		try {
			const malformed = this.getMalformedParts();
			let output = "";
			for (let i = 0; i < malformed.length; i++) {
				output = `${malformed[i]}: ${this[malformed[i]]}\n`;
			}
			return {
				success: true,
				message: output,
			};
		} catch (err) {
			return {
				success: false,
				message: `Analysis failed - ${err}`,
			};
		}
	}
}
module.exports = MalformedTransaction;
