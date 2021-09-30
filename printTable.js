function printTable(fields, items, itemFunc) {
	const verticalSegment = "┃";
	const horizontalSegment = "━";
	const crossSegment = "╋";

	const segments = {
		verticalSegment: verticalSegment,
		horizontalSegment: horizontalSegment,
		crossSegment: crossSegment,
	};

	const columnWidths = getColumnWidths(items, fields, itemFunc);
	const tableHeaderFooter = getHeader(fields, columnWidths, segments);
	const tableBody = getBody(items, itemFunc, columnWidths, segments);

	console.log(`${tableHeaderFooter.header}\n${tableHeaderFooter.separator}\n${tableBody}${tableHeaderFooter.separator}`);
}

module.exports = printTable;

function getBody(items, itemFunc, columnWidths, segments) {
	const verticalSegment = segments.verticalSegment;

	let output = "";
	for (let i = 0; i < items.length; i++) {
		const displayItems = itemFunc(items[i]);
		output += verticalSegment;
		for (let o = 0; o < displayItems.length; o++) {
			output += displayItems[o].padEnd(columnWidths[o] + 1) + verticalSegment;
		}
		output += "\n";
	}

	return output;
}

function getHeader(fields, columnWidths, segments) {
	const verticalSegment = segments.verticalSegment;
	const horizontalSegment = segments.horizontalSegment;
	const crossSegment = segments.crossSegment;

	let header = verticalSegment;
	let separator = crossSegment;
	for (let i = 0; i < fields.length; i++) {
		const field = fields[i];
		if (field.length > columnWidths[i]) columnWidths[i] = field.length;
		header += field.padEnd(columnWidths[i] + 1) + verticalSegment;
		separator += horizontalSegment.repeat(columnWidths[i] + 1) + crossSegment;
	}

	return {
		header: header,
		separator: separator,
	};
}

function getColumnWidths(items, fields, itemFunc) {
	const columnWidths = [];

	for (let i = 0; i < items.length; i++) {
		const displayItems = itemFunc(items[i]);
		for (let o = 0; o < displayItems.length; o++) {
			if (columnWidths.length < o + 1 || columnWidths[o] < displayItems[o].length) {
				columnWidths[o] = displayItems[o].length;
			}
		}
	}

	for (let i = 0; i < columnWidths.length; i++) {
		if (columnWidths[i] < fields[i].length) {
			columnWidths[i] = fields[i].length;
		}
	}
	return columnWidths;
}
