import { MARKER_DETAIL } from '../actions/projectDetailActions/markerDetailsAction';

const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	},
	output_list_markers: {
		data: []
	}

};

export default (state = defaultState, action) => {
	switch (action.type) {
		case MARKER_DETAIL.start:
			return {
				...state,
				loading: true
			};

		case MARKER_DETAIL.end:
			return {
				...state,
				loading: false
			};

		case MARKER_DETAIL.success:
			var data = JSON.parse(JSON.stringify(state.output_list_markers.data));
			data[action.index] = action.data;
			return {
				...state,
				output_list_markers: {
					data
				},
				error: defaultState.error
			};
			// return {
			// 	...state,
            //     data: action.data,
			// 	error: defaultState.error
			// };

		case MARKER_DETAIL.failed:
			return {
				...state,
				error: action.errors
            };
        default: 
            return{
                ...state
            }
            
	}
};