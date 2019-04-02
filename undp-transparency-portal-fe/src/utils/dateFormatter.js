
/************************* Third party Library ****************************/
import moment from 'moment';

/************************ DATE_MONTH_YEAR Formatter ***********************/
export function getFormmattedDate(date) {
	let m = moment(date).format('DD MMMM YYYY');
	return m;
}