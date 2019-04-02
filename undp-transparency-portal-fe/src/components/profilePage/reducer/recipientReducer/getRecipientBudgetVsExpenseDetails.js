import { RECEPIENT_BUDGET_VS_EXPENSE } from '../../actions/recipientActions/getRecepientBudgetVsExpense';
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
        case RECEPIENT_BUDGET_VS_EXPENSE.start:
            return {
                ...defaultState,
                loading: true
            }

        case RECEPIENT_BUDGET_VS_EXPENSE.end:
            return {
                ...state,
                loading: false
            }

        case RECEPIENT_BUDGET_VS_EXPENSE.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case RECEPIENT_BUDGET_VS_EXPENSE.failed:
            return {
                ...state,
                error: action.errors
            }
        case RECEPIENT_BUDGET_VS_EXPENSE.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}