class Account {
	constructor(name) {
		this.name = name;
		this.balance = 0;
		this.transactionHistory = [];
		this.errors = [];
	}
}
module.exports = Account;
