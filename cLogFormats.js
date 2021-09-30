class LogFormats {
	static formatError(error, context, values) {
		return `\n-= Exception =-\n${context}\n(${error.code}) : "${error.message}"\n\n-=Stack Trace =-\n${error.stack}\n${
			values !== undefined ? `\n -= Value Dump = -\n${values}` : ""
		}`;
	}
}

module.exports = LogFormats;
