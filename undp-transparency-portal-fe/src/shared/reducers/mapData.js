/************************* Redux Actions ************************/
import { GLOBAL_MAP_DATA } from '../actions/mapActions/globalMapData';
import { DONORS_MAP_DATA } from '../actions/mapActions/donorsMapData';
import { PROJECT_DETAIL_MAP_DATA } from '../actions/mapActions/projectDetailMapData';
import { PROJECT_LIST_MAP_DATA } from '../actions/mapActions/projectListMapData';
import { THEMES_MAP_DATA } from '../actions/mapActions/themesMapData';
import { SIGNATURES_MAP_DATA } from '../actions/mapActions/signatureMapData';
import { SDG_MAP_DATA } from '../actions/mapActions/sdgMapData';
import { RECIPIENT_PROFILE_MAP_DATA } from '../actions/mapActions/recipientProfileMapData';
import { OUTPUTS_MAP_DATA } from '../actions/mapActions/fetchMapOutputs';
import { DONOR_OUTPUTS_MAP_DATA } from '../actions/mapActions/fetchMapOutputs';
import { DONOR_PROFILE_MAP_DATA } from '../actions/mapActions/donorProfileMapData';
import { MAP_YEAR_TIMELINE } from '../actions/mapActions/yearTimeline';
const defaultState = {
	outputData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	donorOutputData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	yearTimeline: {
		list: [],
		loading: false,
		error: {
			message: '',
			code: ''
		},
		mapCurrentYear: null
	},
	globalMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	donorsMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	projectDetailMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	projectListMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: [],
		regionalCenter: false
	},
	themesMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	sdgMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	recipientMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	donorProfileMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	},
	signatureMapData: {
		loading: false,
		error: {
			message: '',
			code: ''
		},
		data: []
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case GLOBAL_MAP_DATA.start:
			return {
				...state,
				globalMapData: {
					...state.globalMapData,
					loading: true
				}
			};

		case GLOBAL_MAP_DATA.end:
			return {
				...state,
				globalMapData: {
					...state.globalMapData,
					loading: false
				}
			};

		case GLOBAL_MAP_DATA.success:
			return {
				...state,
				globalMapData: {
					...state.globalMapData,
					data: action.data,
					error: defaultState.error
				}
			};

		case GLOBAL_MAP_DATA.failed:
			return {
				...state,
				globalMapData: {
					...state.globalMapData,
					error: action.errors
				}
			};
			////////////////////////////// DONORS MAP DATA ///////////////////////////////////////
		case DONORS_MAP_DATA.start:
			return {
				...state,
				donorsMapData: {
					...state.donorsMapData,
					loading: true
				}
			};

		case DONORS_MAP_DATA.end:
			return {
				...state,
				donorsMapData: {
					...state.donorsMapData,
					loading: false
				}
			};

		case DONORS_MAP_DATA.success:
			return {
				...state,
				donorsMapData: {
					...state.donorsMapData,
					data: action.data,
					error: defaultState.error
				}
			};

		case DONORS_MAP_DATA.failed:
			return {
				...state,
				donorsMapData: {
					...state.donorsMapData,
					error: action.errors
				}
			};
			////////////////////////////// THEMES MAP DATA ///////////////////////////////////////
		case THEMES_MAP_DATA.start:
			return {
				...state,
				themesMapData: {
					...state.themesMapData,
					loading: true
				}
			};

		case THEMES_MAP_DATA.end:
			return {
				...state,
				themesMapData: {
					...state.themesMapData,
					loading: false
				}
			};

		case THEMES_MAP_DATA.success:
			return {
				...state,
				themesMapData: {
					...state.themesMapData,
					data: action.data,
					error: defaultState.error
				}
			};

		case THEMES_MAP_DATA.failed:
			return {
				...state,
				themesMapData: {
					...state.themesMapData,
					error: action.errors
				}
			};

			////////////////////////////// SDG MAP DATA ///////////////////////////////////////
		case SDG_MAP_DATA.start:
			return {
				...state,
				sdgMapData: {
					...state.sdgMapData,
					loading: true
				}
			};

		case SDG_MAP_DATA.end:
			return {
				...state,
				sdgMapData: {
					...state.sdgMapData,
					loading: false
				}
			};

		case SDG_MAP_DATA.success:
			return {
				...state,
				sdgMapData: {
					...state.sdgMapData,
					data: action.data,
					error: defaultState.error
				}
			};

		case SDG_MAP_DATA.failed:
			return {
				...state,
				sdgMapData: {
					...state.sdgMapData,
					error: action.errors
				}
			};

			////////////////////////////// PROJECT DETAIL MAP DATA ///////////////////////////////////////
		case PROJECT_DETAIL_MAP_DATA.start:
			return {
				...state,
				projectDetailMapData: {
					...state.projectDetailMapData,
					loading: true
				}
			};

		case PROJECT_DETAIL_MAP_DATA.end:
			return {
				...state,
				projectDetailMapData: {
					...state.projectDetailMapData,
					loading: false
				}
			};

		case PROJECT_DETAIL_MAP_DATA.success:
			return {
				...state,
				projectDetailMapData: {
					...state.projectDetailMapData,
					data: action.data,
					error: defaultState.error
				}
			};

		case PROJECT_DETAIL_MAP_DATA.failed:
			return {
				...state,
				projectDetailMapData: {
					...state.projectDetailMapData,
					data: action.data,
					error: action.errors
				}
			};
			////////////////////////////// PROJECT LIST MAP DATA ///////////////////////////////////////
		case PROJECT_LIST_MAP_DATA.start:
			return {
				...state,
				projectListMapData: {
					...state.projectListMapData,
					loading: true
				}
			};

		case PROJECT_LIST_MAP_DATA.end:
			return {
				...state,
				projectListMapData: {
					...state.projectListMapData,
					loading: false
				}
			};

		case PROJECT_LIST_MAP_DATA.success:
			return {
				...state,
				projectListMapData: {
					...state.projectListMapData,
					data: action.data,
					regionalCenter: action.regionalCenter,
					error: defaultState.error
				}
			};

		case PROJECT_LIST_MAP_DATA.failed:
			return {
				...state,
				projectListMapData: {
					...state.projectListMapData,
					error: action.errors
				}
			};
			////////////////////////////// RECIPIENT PROFILE MAP DATA ///////////////////////////////////////
		case RECIPIENT_PROFILE_MAP_DATA.start:
			return {
				...state,
				recipientMapData: {
					...state.recipientMapData,
					loading: true
				}
			};

		case RECIPIENT_PROFILE_MAP_DATA.end:
			return {
				...state,
				recipientMapData: {
					...state.recipientMapData,
					loading: false
				}
			};

		case RECIPIENT_PROFILE_MAP_DATA.success:
			return {
				...state,
				recipientMapData: {
					...state.recipientMapData,
					data: action.data,
					error: defaultState.error
				}
			};

		case RECIPIENT_PROFILE_MAP_DATA.failed:
			return {
				...state,
				recipientMapData: {
					...state.recipientMapData,
					data: action.data,
					error: action.errors
				}
			};
			////////////////////////////// RECIPIENT PROFILE MAP DATA ///////////////////////////////////////
		case DONOR_PROFILE_MAP_DATA.start:
			return {
				...state,
				donorProfileMapData: {
					...state.donorProfileMapData,
					loading: true
				}
			};

		case DONOR_PROFILE_MAP_DATA.end:
			return {
				...state,
				donorProfileMapData: {
					...state.donorProfileMapData,
					loading: false
				}
			};

		case DONOR_PROFILE_MAP_DATA.success:
			return {
				...state,
				donorProfileMapData: {
					...state.donorProfileMapData,
					data: action.data,
					error: defaultState.error
				}
			};

		case DONOR_PROFILE_MAP_DATA.failed:
			return {
				...state,
				donorProfileMapData: {
					...state.donorProfileMapData,
					data: action.data,
					error: action.errors
				}
			};
			////////////////////////////// OUTPUT MAP DATA ///////////////////////////////////////
		case OUTPUTS_MAP_DATA.start:
			return {
				...state,
				outputData: {
					...state.outputData,
					loading: true
				}
			};

		case OUTPUTS_MAP_DATA.end:
			return {
				...state,
				outputData: {
					...state.outputData,
					loading: false
				}
			};

		case OUTPUTS_MAP_DATA.success:
			return {
				...state,
				outputData: {
					...state.outputData,
					data: action.data,
					error: defaultState.error
				}
			};

		case OUTPUTS_MAP_DATA.failed:
			return {
				...state,
				outputData: {
					...state.outputData,
					data: action.data,
					error: action.errors
				}
			};
		case OUTPUTS_MAP_DATA.reset:
			return {
				...state,
				outputData: {
					...state.outputData,
					data: []
				}
			};
		//////////////////////////////////DONOR OUTPUTS//////////////////////////////////////
		case DONOR_OUTPUTS_MAP_DATA.start:
			return {
				...state,
				donorOutputData: {
					...state.donorOutputData,
					loading: true
				}
			};

		case DONOR_OUTPUTS_MAP_DATA.end:
			return {
				...state,
				donorOutputData: {
					...state.donorOutputData,
					loading: false
				}
			};

		case DONOR_OUTPUTS_MAP_DATA.success:
			return {
				...state,
				donorOutputData: {
					...state.donorOutputData,
					data: action.data,
					error: defaultState.error
				}
			};

		case DONOR_OUTPUTS_MAP_DATA.failed:
			return {
				...state,
				donorOutputData: {
					...state.donorOutputData,
					data: action.data,
					error: action.errors
				}
			};
			////////////////////////////// YEAR TIMELINE /////////////////////////////////////////
		case MAP_YEAR_TIMELINE.start:
			return {
				...state,
				yearTimeline: {
					...state.yearTimeline,
					loading: true
				}
			};

		case MAP_YEAR_TIMELINE.end:
			return {
				...state,
				yearTimeline: {
					...state.yearTimeline,
					loading: false
				}
			};

		case MAP_YEAR_TIMELINE.success:
			return {
				...state,
				yearTimeline: {
					...state.yearTimeline,
					list: action.data,
					error: defaultState.error
				}
			};

		case MAP_YEAR_TIMELINE.failed:
			return {
				...state,
				yearTimeline: {
					...state.yearTimeline,
					error: action.errors
				}
			};
		case MAP_YEAR_TIMELINE.setYear:
			return {
				...state,
				yearTimeline: {
					...state.yearTimeline,
					mapCurrentYear: action.year
				}
			};
		default:
			return state;

		////////////////////////////// SIGNATURE MAP DATA ///////////////////////////////////////
		case SIGNATURES_MAP_DATA.start:
			return {
				...state,
				signatureMapData: {
					...state.signatureMapData,
					loading: true
				}
			};

		case SIGNATURES_MAP_DATA.end:
			return {
				...state,
				signatureMapData: {
					...state.signatureMapData,
					loading: false
				}
			};

		case SIGNATURES_MAP_DATA.success:
			return {
				...state,
				signatureMapData: {
					...state.signatureMapData,
					data: action.data,
					error: defaultState.error
				}
			};

		case SIGNATURES_MAP_DATA.failed:
			return {
				...state,
				signatureMapData: {
					...state.signatureMapData,
					error: action.errors
				}
			};
	}
};