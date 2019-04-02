/******************** Number-abbreviate to currency ***********************/
export function numberToCurrencyFormatter(input, decimals,chart) {
	let exp, rounded, suffixes = ['K', 'M', 'B', 'T', 'P', 'E'], prefix = '$';
	if( input < 0 ) {
		prefix = '-$'
	}
	
	input = Math.abs(input);
	if (window.isNaN(input)) {
		return null;
	}
	if (input < 1000) {
		return prefix + input;
	}
	exp = Math.floor(Math.log(input) / Math.log(1000));
	if (exp > 2) exp = 2;
	rounded = (input / Math.pow(1000, exp)).toFixed(decimals);
	chart===1 ? (rounded = rounded % 1 === 0 ? parseFloat(rounded).toFixed(0) : rounded) :null ;
	return (prefix + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffixes[exp - 1]);
}

/**************** Numbers with thousands separators *************************/
export function numberToCommaFormatter(input) {
	return (parseInt(input,10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}

/**************** Number To Dollar Formatter ********************************/
export function numberToDollarFormatter(input) {
	let prefix = '$';
	if( input < 0 ) {
		prefix = '-$'
	}
	input = Math.abs(parseInt(input,10));
	return (prefix + input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}

/**************** RoundOff Function *****************************************/
export function roundTo(number, digits) {
	let multiplier = Math.pow(10, digits),
		adjustedNum = number * multiplier,
		truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
	return truncatedNum / multiplier;
}
export function hasNumber(string) {
	return /\d/.test(string);
}
export function formatPercentage(percentage) {
	return Number(percentage).toFixed(1).toString().replace('.0', '');
}