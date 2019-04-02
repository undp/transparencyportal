import Api from '../../../../lib/api';
import d3 from 'd3';
export const RECIPIENT_BUDGET_VS_EXPENSE_SDG = {
    start: 'fetch_start/budget_vs_expense_sdg',
    end: 'fetch_end/budget_vs_expense_sdg',
    success: 'fetch_success/budget_vs_expense_sdg',
    failed: 'fetch_failed/budget_vs_expense_sdg',
    clear: 'clear/budget_vs_expense_sdg'
}



export const recepientBudgetVsExpenseSdgFetchStart = () => ({
    type: RECIPIENT_BUDGET_VS_EXPENSE_SDG.start
})

export const recepientBudgetVsExpenseSdgFetchEnd = () => ({
    type: RECIPIENT_BUDGET_VS_EXPENSE_SDG.end
})
export const recepientBudgetVsExpenseSdgFetchClear = () => ({
    type: RECIPIENT_BUDGET_VS_EXPENSE_SDG.clear
})

export const recepientBudgetVsExpenseSdgFetchSuccess = (data) => (
    {
        type: RECIPIENT_BUDGET_VS_EXPENSE_SDG.success,
        data
    })

export const recepientBudgetVsExpenseSdgFailed = (error) => ({
    type: RECIPIENT_BUDGET_VS_EXPENSE_SDG.failed,
    error
})




const calcHighestValue = (data) =>{
   let frmmtedBudgetArray = [],
    frmmtedExpenseArray = [],
    frmttdBudget = 0,
    frmttdExpense = 0,
    budgetMax = 0,
    expenseMax = 0;
    data.forEach((element)=>{
        frmttdBudget = parseFloat(element.sdg_budget?element.sdg_budget:0);
        frmttdExpense = parseFloat(element.sdg_expense?element.sdg_expense:0);
        frmmtedBudgetArray = [...frmmtedBudgetArray,frmttdBudget];
        frmmtedExpenseArray = [...frmmtedExpenseArray,frmttdExpense];
    })
    budgetMax= d3.max(frmmtedBudgetArray);
    expenseMax = d3.max(frmmtedExpenseArray);
  return budgetMax>expenseMax?budgetMax:expenseMax
}


export const parseBudgetVsExpense = (data,total) =>{
    if(data.length !==0){
        data.forEach((element) => {
            element.sector_name = element.sdg_name            ;
            element.theme_budget = element.sdg_budget;
            element.theme_expense = element.sdg_expense;
            element.total_budget = element.sdg_budget;
            element.total_expense = element.sdg_expense;
            element.color =  element.color;  
            element.budgetPercentage = ( parseFloat(element.theme_budget)/ total)*100;
            element.expensePercentage = (parseFloat(element.theme_expense)/total)*100;
        });
    }

}



// budgetPercentage
// expensePercentage
// sector
// sector_color
// sector_name
// short_name
// theme_budget
// theme_expense
// total_budget
// total_expense


// color
// sdg_budget
// sdg_code
// sdg_expense
// sdg_name







export const fetchRecepientBudgetVsExpenseSdg = (code, year) => {
    return (dispatch) => {
        dispatch(recepientBudgetVsExpenseSdgFetchStart())
        if (code != '' && year != null) {
            return Api.get(Api.API_RECIPIENT_BUDGET_VS_EXPENSE_SDG(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(recepientBudgetVsExpenseSdgFetchEnd())
                    // const total = calcTotalBudgetExpense(resp.data);
                    const highestValue = calcHighestValue(resp.data);
                    if(highestValue === 0){
                        dispatch(recepientBudgetVsExpenseSdgFetchSuccess([]))
                        
                    }else{
                        parseBudgetVsExpense(resp.data,highestValue);
                        dispatch(recepientBudgetVsExpenseSdgFetchSuccess(resp.data))
                    }
                    
                  
                } else {
                    dispatch(recepientBudgetVsExpenseSdgFetchEnd())
                    dispatch(recepientBudgetVsExpenseSdgFailed())
                }
            }).catch((exception) => {
                dispatch(recepientBudgetVsExpenseSdgFetchEnd())
                dispatch(recepientBudgetVsExpenseSdgFailed(exception))
            });
        }
        else {
            dispatch(recepientBudgetVsExpenseSdgFetchClear())
            dispatch(recepientBudgetVsExpenseSdgFetchEnd())
        }
    }
}



