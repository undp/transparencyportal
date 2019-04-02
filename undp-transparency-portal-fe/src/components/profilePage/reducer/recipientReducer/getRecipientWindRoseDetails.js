import { RECIPIENT_WIND_ROSE } from '../../actions/recipientActions/getRecipientWindRoseDetails'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: [],
    sectorColor: '',
    initialSector:'',
    year:''
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case RECIPIENT_WIND_ROSE.start:
            return {
                ...defaultState,
                loading: true
            }

        case RECIPIENT_WIND_ROSE.end:
            return {
                ...state,
                loading: false
            }

        case RECIPIENT_WIND_ROSE.success:
            return {
                ...state,
                data: action.data,
                initialSector:action.initialSector,
                sectorColor: action.sectorColor,
                year:action.year,
                error: defaultState.error
            }

        case RECIPIENT_WIND_ROSE.failed:
            return {
                ...state,
                error: action.errors
            }
        default:
            return state;
    }
}