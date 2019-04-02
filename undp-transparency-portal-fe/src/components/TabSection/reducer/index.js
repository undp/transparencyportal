import {
    TAB_DATA,
    ON_TAB_SWITCH,
    ON_UPDATE_DONOR_FILTER,
    ON_UPDATE_THEME_FILTER,
    ON_UPDATE_COUNTRYREGION_FILTER,
    ON_UPDATE_SDG_FILTER,
    ON_UPDATE_YEAR,
    ON_UPDATE_SIGNATURE_FILTER
} from '../actions'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    themes: [],
    tabSelected: 'country',
    donorFilter: {

    },
    countryRegionFilter: {
        country: {

        }
    },
    sdgFilter: {

    },
    themeFilter: {

    },
    currentYear: ""
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case TAB_DATA.start:
            return {
                ...state,
                loading: true
            }

        case TAB_DATA.end:
            return {
                ...state,
                loading: false
            }

        case TAB_DATA.success:
            return {
                ...state,
                themes: action.data,
                error: defaultState.error
            }

        case TAB_DATA.failed:
            return {
                ...state,
                error: action.errors
            }

        case ON_TAB_SWITCH:
            return {
                ...state,
                tabSelected: action.tabType
            }


        case ON_UPDATE_DONOR_FILTER:
            return {
                ...state,
                donorFilter:
                    {
                        ...state.donorFilter,
                        [action.key]: action.data
                    }
            }


        case ON_UPDATE_THEME_FILTER:
            return {
                ...state,
                themeFilter:
                    {
                        ...state.themeFilter,
                        [action.key]: action.data
                    }
            }

        case ON_UPDATE_SIGNATURE_FILTER:
            return {
                ...state,
                signatureFilter:
                    {
                        ...state.signatureFilter,
                        [action.key]: action.data
                    }
            }

        case ON_UPDATE_COUNTRYREGION_FILTER:
            return {
                ...state,
                countryRegionFilter:
                    {
                        ...state.countryRegionFilter,
                        [action.key]: action.data
                    }
            }

        case ON_UPDATE_SDG_FILTER:
            return {
                ...state,
                sdgFilter:
                    {
                        ...state.sdgFilter,
                        [action.key]: action.data
                    }
            }

        case ON_UPDATE_YEAR:
            return {
                ...state,
                currentYear: action.year
            }


        default:
            return state;
    }
}