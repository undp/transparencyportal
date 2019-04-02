import {
    OPERATING_UNITS_SEARCH,
    OPERATING_UNITS_SEARCH_BAR,
    UPDATE_SEARCH_RESULT,
    CLEAR_SEARCH_RESUlt,
    UPDATE_SEARCH_TEXT,
    UPDATE_SEARCH_RESULT_SEARCH_BAR,
    UPDATE_SEARCH_DONOR_TEXT,
    UPDATE_SEARCH_COUNTRY_FIELD,
    CLEAR_SEARCH_COUNTRY_FIELD,
    UPDATE_DROP_LIST_SEARCH_TEXT,
    UPDATE_TEMP_SEARCH_RESULT,
    UPDATE_SEARCH_THEMES,
    UPDATE_SEARCH_SDG
} from '../actions';

const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    searchResultLoading:false,
    searchCountryField:'',
    searchThemesField:'',
    searchSdgField:'',
    searchBarResultLoading:false,
    searchResult: [],
    searchResultTemp:{
        key:{
            countryFieldKey:'',
            sdgFieldKey:'',
            themesFieldKey:''
        },
        data:[]
    },
    searchResultSearchBar: [],
    searchText: "",
    searchDonorText: ""
}




export default (state = defaultState, action) => {
    switch (action.type) {
        case OPERATING_UNITS_SEARCH.start:
            return {
                ...state,
                searchResultLoading: true
            }

        case OPERATING_UNITS_SEARCH.end:
            return {
                ...state,
                searchResultLoading: false
            }

        case OPERATING_UNITS_SEARCH.failed:
            return {
                ...state,
                error: action.errors
            }

            //----------------------
              case OPERATING_UNITS_SEARCH_BAR.start:
            return {
                ...state,
                searchBarResultLoading: true
            }

        case OPERATING_UNITS_SEARCH_BAR.end:
            return {
                ...state,
                searchBarResultLoading: false
            }

        case OPERATING_UNITS_SEARCH_BAR.failed:
            return {
                ...state,
                error: action.errors
            }
            //----------------------

            case UPDATE_SEARCH_COUNTRY_FIELD:
            return {
                ...state,
                searchCountryField: action.data
            }

            case UPDATE_SEARCH_THEMES:
            return {
                ...state,
                searchThemesField: action.data
            }
            case UPDATE_SEARCH_SDG:
            return {
                ...state,
                searchSdgField: action.data
            }

            case CLEAR_SEARCH_COUNTRY_FIELD:
            return {
                ...state,
                searchCountryField:'',
                searchThemesField:'',
                searchSdgField:''
            }



        case UPDATE_SEARCH_RESULT:
            return {
                ...state,
                searchResult: action.data
            }

        case UPDATE_SEARCH_RESULT_SEARCH_BAR:
            return {
                ...state,
                searchResultSearchBar: action.data
            }

    
        case CLEAR_SEARCH_RESUlt:
            return {
                searchResult: []
            }

        case UPDATE_SEARCH_TEXT:
            return {
                ...state,
                searchText: action.text
            }

            case UPDATE_SEARCH_DONOR_TEXT:
            return {
                ...state,
                searchDonorText: action.text
            }

            case UPDATE_TEMP_SEARCH_RESULT:
            return {
                ...state,
                searchResultTemp:{
                    ...state.searchResultTemp,
                    data:action.data,
                    key:{
                        ...state.searchResultTemp.key,
                        countryFieldKey:action.countryFieldKey,
                        sdgFieldKey:action.sdgFieldKey,
                        themesFieldKey:action.themesFieldKey

                    }
                }
            }

        default:
            return state;
    }
}