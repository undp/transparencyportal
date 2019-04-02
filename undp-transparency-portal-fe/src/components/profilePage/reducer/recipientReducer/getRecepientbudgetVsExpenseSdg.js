import { RECIPIENT_BUDGET_VS_EXPENSE_SDG } from '../../actions/recipientActions/getRecepientbudgetVsExpenseSdg';
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: []
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case RECIPIENT_BUDGET_VS_EXPENSE_SDG.start:
            return {
                ...defaultState,
                loading: true
            }

        case RECIPIENT_BUDGET_VS_EXPENSE_SDG.end:
            return {
                ...state,
                loading: false
            }

        case RECIPIENT_BUDGET_VS_EXPENSE_SDG.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case RECIPIENT_BUDGET_VS_EXPENSE_SDG.failed:
            return {
                ...state,
                error: action.errors
            }
        case RECIPIENT_BUDGET_VS_EXPENSE_SDG.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}