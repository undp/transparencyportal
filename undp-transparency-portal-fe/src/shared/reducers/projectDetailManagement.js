
/************************* Redux Actions ************************/
import { PROJECT_BASIC_DATA } from '../actions/projectDetailActions/basicDataActions';
import { PROJECT_TIME_LINE } from '../actions/projectDetailActions/timeLineActions';
import { PROJECT_BUDGET_SOURCE } from '../actions/projectDetailActions/budgetSourceActions';
import { PROJECT_BUDGET_UTILIZATION } from '../actions/projectDetailActions/budgetUtilization';
import { PROJECT_DOCUMENT_LIST } from '../actions/projectDetailActions/documentListActions';
import { DOCUMENT_LIST_FILTERED } from '../actions/projectDetailActions/documentListActions';
import { PROJECT_OUTPUT_LIST } from '../actions/projectDetailActions/outputListActions';
import { PROJECT_OUTPUT_RESULTS } from '../actions/projectDetailActions/outputResultsActions';
import { PROJECT_OUTPUT_DETAIL } from '../actions/projectDetailActions/outputDetailActions';
import { PROJECT_PURCHASE_ORDERS } from '../actions/projectDetailActions/purchaseOrderActions';
import { PROJECT_GALLERY } from '../actions/projectDetailActions/projectGallery';
import { PROJECT_DATA_CLEAR } from '../actions/projectDetailActions/clearProjectDataActions'; 
const defaultState = {
	loading: false,
	project: {},
	error: {
		message: '',
		code: ''
	},
	budget_source: [],
	budget_utilization: {},
	document_list: {
		loading: false,
		categoryList: []
	},
	document_list_filtered: {
		loading: false
	},
	output_results: {},
	output_list: {},
	time_line: {},
	purchase_orders: {
		loading: false
	},
	picture_gallery: {
		loading: false,
		data: []
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		/////////////////////// PROJECT_BASIC_DATA //////////////////////////
		case PROJECT_BASIC_DATA.start:
			return {
				...defaultState,
				loading: true
			};

		case PROJECT_BASIC_DATA.end:
			return {
				...state,
				loading: false
			};

		case PROJECT_BASIC_DATA.success:
			return {
				...state,
				project: action.data,
				error: defaultState.error
			};

		case PROJECT_BASIC_DATA.failed:
			return {
				...state,
				error: action.errors
			};
			/////////////////////// PROJECT_BUDGET_SOURCE //////////////////////////
		case PROJECT_BUDGET_SOURCE.start:
			return {
				...state,
				loading: true
			};

		case PROJECT_BUDGET_SOURCE.end:
			return {
				...state,
				loading: false
			};

		case PROJECT_BUDGET_SOURCE.success:
			return {
				...state,
				budget_source: action.data,
				error: defaultState.error
			};

		case PROJECT_BUDGET_SOURCE.failed:
			return {
				...state,
				error: action.errors
			};
			/////////////////////// PROJECT_BUDGET_UTILIZATION //////////////////////////
		case PROJECT_BUDGET_UTILIZATION.start:
			return {
				...state,
				loading: true
			};

		case PROJECT_BUDGET_UTILIZATION.end:
			return {
				...state,
				loading: false
			};

		case PROJECT_BUDGET_UTILIZATION.success:
			return {
				...state,
				budget_utilization: action.data,
				error: defaultState.error
			};

		case PROJECT_BUDGET_UTILIZATION.failed:
			return {
				...state,
				error: action.errors
			};
			/////////////////////// PROJECT_DOCUMENT_LIST //////////////////////////
		case PROJECT_DOCUMENT_LIST.start:
			return {
				...state,
				document_list: {
					...state.document_list,
					loading: true
				}

			};

		case PROJECT_DOCUMENT_LIST.end:
			return {
				...state,
				document_list: {
					...state.document_list,
					loading: false
				}
			};

		case PROJECT_DOCUMENT_LIST.success:
			return {
				...state,
				document_list: {
					...state.document_list,
					...action.data,
					categoryList: action.categoryList

				},
				error: defaultState.error
			};

		case PROJECT_DOCUMENT_LIST.failed:
			return {
				...state,
				error: action.errors
			};
			/////////////////////// PROJECT_OUTPUT_LIST //////////////////////////
		case PROJECT_OUTPUT_LIST.start:
			return {

				...state,
				output_list: {
					...state.output_list,
					loading: true

				}
			};

		case PROJECT_OUTPUT_LIST.end:
			return {
				...state,
				output_list: {
					...state.output_list,
					loading: false

				}
			};

		case PROJECT_OUTPUT_LIST.success:
			return {
				...state,
				output_list: {
					...state.output_list,
					...action.data
				},
				error: defaultState.error
			};

		case PROJECT_OUTPUT_LIST.failed:
			return {
				...state,
				error: action.errors
			};
			/////////////////////// PROJECT_OUTPUT_RESULTS //////////////////////////
		case PROJECT_OUTPUT_RESULTS.start:
			return {
				...state,
				loading: true
			};

		case PROJECT_OUTPUT_RESULTS.end:
			return {
				...state,
				loading: false
			};

		case PROJECT_OUTPUT_RESULTS.success:
			var data = JSON.parse(JSON.stringify(state.output_list.data));
			data[action.index].output_results = action.data[0];
			return {
				...state,
				output_list: {
					...state.output_list,
					data
				},
				error: defaultState.error
			};

		case PROJECT_OUTPUT_RESULTS.failed:
			return {
				...state,
				error: action.errors
			};
			/////////////////////// PROJECT_OUTPUT_DETAIL //////////////////////////
		case PROJECT_OUTPUT_DETAIL.start:
			return {
				...state,
				loading: true
			};

		case PROJECT_OUTPUT_DETAIL.end:
			return {
				...state,
				loading: false
			};

		case PROJECT_OUTPUT_DETAIL.success:
			var data = JSON.parse(JSON.stringify(state.output_list.data));
			data[action.index].output_detail = action.data[0];
			return {
				...state,
				output_list: {
					...state.output_list,
					data
				},
				error: defaultState.error
			};

		case PROJECT_OUTPUT_DETAIL.failed:
			return {
				...state,
				error: action.errors
			};
		
			/////////////////////// PROJECT_TIMELINE //////////////////////////
		case PROJECT_TIME_LINE.start:
			return {
				...state,
				loading: true
			};

		case PROJECT_TIME_LINE.end:
			return {
				...state,
				loading: false
			};

		case PROJECT_TIME_LINE.success:
			return {
				...state,
				time_line: action.data,
				error: defaultState.error
			};

		case PROJECT_TIME_LINE.failed:
			return {
				...state,
				error: action.errors
			};
			/////////////////////// DOCUMENTS_FILTERED //////////////////////////
		case DOCUMENT_LIST_FILTERED.start:
			return {
				...state,
				document_list_filtered: {
					...state.document_list_filtered,
					loading: true
				}
			};

		case DOCUMENT_LIST_FILTERED.end:
			return {
				...state,
				document_list_filtered: {
					...state.document_list_filtered,
					loading: false
				}
			};

		case DOCUMENT_LIST_FILTERED.success:
			return {
				...state,
				document_list_filtered: {
					...state.document_list_filtered,
					...action.data
				},
				error: defaultState.error
			};

		case DOCUMENT_LIST_FILTERED.swap:
			return {
				...state,
				document_list_filtered: action.data
			};

		case DOCUMENT_LIST_FILTERED.failed:
			return {
				...state,
				error: action.errors
			};
		default:
			return state;
			////////////////// PROJECT PURCHASE_ORDERS //////////////////////

		case PROJECT_PURCHASE_ORDERS.start:
			return {
				...state,
				purchase_orders: {
					...state.purchase_orders,
					loading: true
				}

			};

		case PROJECT_PURCHASE_ORDERS.end:
			return {
				...state,
				purchase_orders: {
					...state.purchase_orders,
					loading: false
				}
			};

		case PROJECT_PURCHASE_ORDERS.success:
			return {
				...state,
				purchase_orders: {
					...state.purchase_orders,
					...action.data
				},
				error: defaultState.error
			};

		case PROJECT_PURCHASE_ORDERS.failed:
			return {
				...state,
				error: action.errors
			};
		case PROJECT_DATA_CLEAR.clear: {
			return defaultState;
		}
		////////////////// PROJECT PICTURE_GALLERY //////////////////////

		case PROJECT_GALLERY.start:
			return {
				...state,
				picture_gallery: {
					...state.picture_gallery,
					loading: true
				}

			};

		case PROJECT_GALLERY.end:
			return {
				...state,
				picture_gallery: {
					...state.picture_gallery,
					loading: false
				}
			};

		case PROJECT_GALLERY.success:
			return {
				...state,
				picture_gallery: {
					...state.picture_gallery,
					data: action.pictureList
				},
				error: defaultState.error
			};

		case PROJECT_GALLERY.failed:
			return {
				...state,
				error: action.errors
			};
	}
};