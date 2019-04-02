import {
    DONOR_DATA,
    UPDATE_DONOR_TOTAL_DATA,
    UPDATE_DONOR_REGULAR_DATA,
    UPDATE_DONOR_OTHER_DATA,
    DONOR_TOTAL_DATA_FETCH_START,
    DONOR_OTHER_DATA_FETCH_START,
    DONOR_REGULAR_DATA_FETCH_START,
    DONOR_TOTAL_DATA_FETCH_END,
    DONOR_OTHER_DATA_FETCH_END,
    DONOR_REGULAR_DATA_FETCH_END
} from '../actions'


const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: {},
    totalData: {},
    regularData: {},
    otherData: {},
    totalDataLoading: false,
    regularDataLoading: false,
    otherDataLoading: false

}

export default (state = defaultState, action) => {
    switch (action.type) {
        case DONOR_DATA.start:
            return {
                ...state,
                loading: true
            }

        case DONOR_DATA.end:
            return {
                ...state,
                loading: false
            }

        case DONOR_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case DONOR_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case UPDATE_DONOR_TOTAL_DATA:
            return {
                ...state,
                totalData: {
                    ...action.data
                }

            }
        case UPDATE_DONOR_REGULAR_DATA:
            return {
                ...state,
                regularData: {
                    ...action.data
                }
            }
        case UPDATE_DONOR_OTHER_DATA:
            return {
                ...state,
                otherData: {
                    ...action.data
                }
            }

        case DONOR_TOTAL_DATA_FETCH_START:
            return {
                ...state,
                totalDataLoading: true
            }
        case DONOR_OTHER_DATA_FETCH_START:
            return {
                ...state,
                otherDataLoading: true,
            }
        case DONOR_REGULAR_DATA_FETCH_START:
            return {
                ...state,
                regularDataLoading: true

            }

        case DONOR_TOTAL_DATA_FETCH_END:
            return {
                ...state,
                totalDataLoading: false
            }

        case DONOR_OTHER_DATA_FETCH_END:
            return {
                ...state,
                otherDataLoading: false
            }

        case DONOR_REGULAR_DATA_FETCH_END:
            return {
                ...state,
                regularDataLoading: false
            }

        default:
            return state;

    }
}







