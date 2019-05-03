/**************** open Embed Links In New Tab *************************/
import Api from '../lib/api';
export const openInNewTab = (url,callbk,param='_blank') => {
	try {
		const win = window.open(url,param);
		if (win) {
			callbk();
		}
		else {
			throw new Error('window-open-error');
		}
	}
	catch (err) {
		if (err === 'window-open-error') {
			//handle window open error
		}
	}
};

export const getAPIBaseUrRl = (dataSet, key) => {
	return Api.S3_BASE_URL;
};

export const DownloadUrlGenerator = (path) => Api.DOWNLOAD_PDF(path);

export const PreviewUrlGenerator = (path) => Api.API_BASE + path;

export const aggregateCalculator = (dataSet, key) => {
	let total = 0;
	dataSet.forEach((item, index) => {
		total = total + parseFloat(item[key]);
	});
	return total;
};
export const getSSCMarkerColor = (type) => {
	let colors = [{ type: 1, color: '#0099FF' }, { type: 2, color: '#CC0000' }, { type: 3, color: '#FF6600' } ],
		item = colors[ _.findIndex(colors, { 'type' : type }) ]
	return item.color; 
};
export const getUniqueLatLngArray = (array) => {
	return _.unique(array, function (e) {
		return e.lat && e.lng;
	});
};

export const DownloadCSVUrlGenerator = (path) => Api.DOWNLOAD_CSV(path);