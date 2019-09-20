/////////////////////// Fetch Project Basic Data //////////////////////////
import Api from '../../../lib/api';

export const PROJECT_PURCHASE_ORDERS = {
	start: 'fetch_start/project_purchase_orders',
	end: 'fetch_end/project_purchase_orders',
	success: 'fetch_success/project_purchase_orders',
	failed: 'fetch_failed/project_purchase_orders'
};

export const projectPurchaseOrdersFetchStart = () => ({
	type: PROJECT_PURCHASE_ORDERS.start
});

export const projectPurchaseOrdersFetchEnd = () => ({
	type: PROJECT_PURCHASE_ORDERS.end
});

export const projectPurchaseOrdersFetchSuccess = (data) => (
	{
		type: PROJECT_PURCHASE_ORDERS.success,
		data
	});

export const projectPurchaseOrdersFetchFailed = (error) => ({
	type: PROJECT_PURCHASE_ORDERS.failed,
	error
});

export const fetchProjectPurchaseOrders = (id) => (dispatch, getState) => { 
	dispatch(projectPurchaseOrdersFetchStart());
	return Api.get(Api.API_PROJECT_PURCHASE_ORDERS(id)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(projectPurchaseOrdersFetchEnd());
			dispatch(projectPurchaseOrdersFetchSuccess(resp.data));
		}
		else {
			dispatch(projectPurchaseOrdersFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectPurchaseOrdersFetchEnd());
		dispatch(projectPurchaseOrdersFetchFailed());
	});
};

export const PurchaseOrderPagination = (API,cb)=>(dispatch, getState) => {
	dispatch(projectPurchaseOrdersFetchStart()); 
	return Api.get(API).then(resp => {
		if (resp.data && resp.success) {
			if(cb)cb(resp.data)
			dispatch(projectPurchaseOrdersFetchEnd());
		}
		else {
			dispatch(projectPurchaseOrdersFetchEnd());
		}
	}).catch((err) => {
		dispatch(projectPurchaseOrdersFetchEnd());
		console.log("err",err)
	});

 }
