/************************ is All Percentage Zero ***********************/
export function isAllPercentageZero(key, array) {
	return array.every((item, index, array) => item[key] === 0);
}

/********************** Get Theme ID from Theme Name *******************/
export function getThemeIDByName(themeArray, sectorName) {
	let result = themeArray.filter(theme => theme.sector === sectorName);
	return result.code;
}

/********************* Check if two objects are same *******************/
export function objectsAreSame(x, y) {
	let ifNonEmpty = x.length > 0 && y.length > 0;
	let objectsAreSame = !!ifNonEmpty;
	if (ifNonEmpty) {
		for (let propertyName in x) {
			if (x[propertyName] !== y[propertyName]) {
				objectsAreSame = false;
				break;
			}
		}
	}
	return objectsAreSame;
}

/******************* Get SDG Image From sdgCode ************************/
export function getSDGImageFromCode(sdgCode) {
	let sdgSrc = 'SDG-' + sdgCode + '.svg';
	return sdgSrc;
}


/********************Filter Year for Year Timeline in Map***************/
export function filterArrayByStartYear(yearArray, startYear,endYear) {

    const result = yearArray.filter( (year) => {
		if (endYear){
			return year >= startYear && year <=endYear;
		} else{
			return year >=startYear
		} 		
	})
	return result;
}
/**************** Render Custom Meta Data Description ********************/
export function shortenText(text, maxLength) {
	let ret = text;
	if (ret.length > maxLength) {
		ret = ret.substr(0,maxLength-3) + '...';
	}
	return ret;
}

/**************** Get Browser Information  ********************/
export function getBrowserInformation() {
	navigator.sayswho= (function(){
		let ua= navigator.userAgent, tem,
			M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		if (/trident/i.test(M[1])){
			tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
			return 'IE '+(tem[1] || '');
		}
		if (M[1]=== 'Chrome'){
			tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
			if (tem!== null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
		}
		M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
		if ((tem= ua.match(/version\/(\d+)/i))!== null) M.splice(1, 1, tem[1]);
		return M.join(' ');
	})();
	return (navigator.sayswho);
}


// get the key
export function getApiKey() {
	const _day = new Date().getDate();

	if (_day < 5) {
		return 'pk.eyJ1IjoidW5kcG9yZyIsImEiOiJjaWc5cmJmcWwwMDRxdjJrcjgxbnczaThvIn0.J-5uk4LED0EgvK1raqCJmg'
	} else if (_day < 10) {
		return 'pk.eyJ1IjoicmF0aGVlc2hxYiIsImEiOiJja2V1enI2dTAydnl5MzJvOGI5YzFtMmxyIn0.OAwY5IxXm6n1u809Vi7WeA'
	}
	else if (_day < 15) {
		return 'pk.eyJ1IjoiYXJtcml6YSIsImEiOiJZSWRGbmtrIn0.WLpZFo1llqXvg04wz12a5Q'
	}
	else if (_day < 20) {
		return 'pk.eyJ1IjoiemFpcmVoIiwiYSI6ImNrcDVpaGN3ejBiYjQyb3BlcmcxOW1yczEifQ.T372nofozuGd98yYAlPI-A'
	}
	else if (_day < 25) {
		return 'pk.eyJ1IjoiYXJtcml6YTQ0NDQiLCJhIjoiY2twNmtmdzA0MDU5djJ2bXRmc2lxZGY3ZyJ9.y_-VlkCS4QRcXVFCbDF31Q'
	}
	else {
		return 'pk.eyJ1IjoiYXJtcml6YTQiLCJhIjoiY2tldjdkNW1uMDI5bzJ6cDloejBrdGsycCJ9.JiW486rjr39AMr4kIpizyg'
	}
}
