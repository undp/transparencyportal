import { RECIPIENT_DOCUMENTS } from '../../actions/recipientActions/getRecipientDocuments'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: [],
    categoryList:[]
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case RECIPIENT_DOCUMENTS.start:
            return {
                ...state,
                loading: true
            }

        case RECIPIENT_DOCUMENTS.end:
            return {
                ...state,
                loading: false
            }

        case RECIPIENT_DOCUMENTS.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error,
                categoryList: action.categoryList
            }

        case RECIPIENT_DOCUMENTS.failed:
            return {
                ...state,
                error: action.errors
            }
        default:
            return state;
    }
}