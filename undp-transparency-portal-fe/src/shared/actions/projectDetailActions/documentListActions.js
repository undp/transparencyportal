/////////////////////// Fetch Project Document List //////////////////////////
import Api from '../../../lib/api';
export const PROJECT_DOCUMENT_LIST = {
	start: 'fetch_start/project_document_list',
	end: 'fetch_end/project_document_list',
	success: 'fetch_success/project_document_list',
	failed: 'fetch_failed/project_document_list'
};
export const DOCUMENT_LIST_FILTERED = {
	start: 'fetch_start/document_list_filtered',
	swap: 'update_document_cache/document_list_filtered',
	end: 'fetch_end/document_list_filtered',
	success: 'fetch_success/document_list_filtered',
	failed: 'fetch_failed/document_list_filtered'
};
export const projectDocumentListFetchStart = () => ({
	type: PROJECT_DOCUMENT_LIST.start
});

export const projectDocumentListFetchEnd = () => ({
	type: PROJECT_DOCUMENT_LIST.end
});

export const projectDocumentListFetchSuccess = (data,categoryList) => (
	{
		type: PROJECT_DOCUMENT_LIST.success,
		data,
		categoryList
	});

export const projectDocumentListFetchFailed = (error) => ({
	type: PROJECT_DOCUMENT_LIST.failed,
	error
});

export const documentListFilteredFetchStart = () => ({
	type: DOCUMENT_LIST_FILTERED.start
});

export const documentListFilteredFetchEnd = () => ({
	type: DOCUMENT_LIST_FILTERED.end
});

export const documentListFilteredFetchSuccess = (data) => (
	{
		type: DOCUMENT_LIST_FILTERED.success,
		data
	});

export const documentListFilteredFetchFailed = (error) => ({
	type: DOCUMENT_LIST_FILTERED.failed,
	error
});

export const swapDocumentListInit = (data) => ({
	type: DOCUMENT_LIST_FILTERED.swap,
	data
});


export const createDocumentCategoryList = (dataArray) => {
	let array = [];
	dataArray.forEach((item) => {
		if (array.length !== 0) {
			let flag = true;
			array.forEach((data) => {
				if (data.label === item.category_name) {
					flag = false;
				}
			});
			if (flag) {
				array.push({
					label: item.category_name,
					value: item.category
				});
			}
		}
		else {
			array.push({
				label: item.category_name,
				value: item.category
			});
		}

	});
	return array;
};


export const fetchProjectDocumentList = (id) => (dispatch, getState) => {
	dispatch(projectDocumentListFetchStart());
	return Api.get(Api.API_PROJECT_DOCUMENT_LIST(id)).then(resp => {

		if (resp.data && resp.success) {
			dispatch(projectDocumentListFetchEnd());
			let categoryList = createDocumentCategoryList(resp.data.data);

			dispatch(projectDocumentListFetchSuccess(resp.data,categoryList));
			dispatch(swapDocumentListInit(resp.data));
		}
		else {
			dispatch(projectDocumentListFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectDocumentListFetchEnd());
		dispatch(projectDocumentListFetchFailed());
	});
};


export const updateProjectDocumentList = (id, category) => (dispatch, getState) => {
	dispatch(documentListFilteredFetchStart());
	!category?category='':null;
	return Api.get(Api.API_PROJECT_DOCUMENT_LIST_FILTERED(id, category)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(documentListFilteredFetchEnd());
			dispatch(documentListFilteredFetchSuccess(resp.data));
		}
		else {
			dispatch(documentListFilteredFetchEnd());
		}
	}).catch((exception) => {
		dispatch(documentListFilteredFetchEnd());
		dispatch(documentListFilteredFetchFailed());
	});
};
export const swapDocumentList = () => (dispatch, getState) => {
	let projectDetail = getState().projectDetail.document_list;
	dispatch(swapDocumentListInit(projectDetail));
};
