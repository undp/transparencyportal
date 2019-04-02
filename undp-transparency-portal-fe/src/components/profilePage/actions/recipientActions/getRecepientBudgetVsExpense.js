import Api from '../../../../lib/api';
import d3 from 'd3';
export const RECEPIENT_BUDGET_VS_EXPENSE = {
    start: 'fetch_start/donor_budget_vs_expense',
    end: 'fetch_end/donor_budget_vs_expense',
    success: 'fetch_success/donor_budget_vs_expense',
    failed: 'fetch_failed/donor_budget_vs_expense',
    clear: 'clear/donor_budget_vs_expense'
}



export const recepientBudgetVsExpenseFetchStart = () => ({
    type: RECEPIENT_BUDGET_VS_EXPENSE.start
})

export const recepientBudgetVsExpenseFetchEnd = () => ({
    type: RECEPIENT_BUDGET_VS_EXPENSE.end
})
export const recepientBudgetVsExpenseFetchClear = () => ({
    type: RECEPIENT_BUDGET_VS_EXPENSE.clear
})

export const recepientBudgetVsExpenseFetchFetchSuccess = (data) => (
    {
        type: RECEPIENT_BUDGET_VS_EXPENSE.success,
        data
    })

export const recepientBudgetVsExpenseFetchFetchFailed = (error) => ({
    type: RECEPIENT_BUDGET_VS_EXPENSE.failed,
    error
})

const calcTotalBudgetExpense = (data)=>{
    var totalBudget = 0,
        totalExpense = 0,
        total = 0;
    data.forEach((item)=>{
        totalBudget = totalBudget + parseFloat(item.theme_budget);
        totalExpense = totalExpense + parseFloat(item.theme_expense);
    })

    total = totalBudget + totalExpense;

    return total;
}

const calcHighestValue = (data) =>{
   let frmmtedBudgetArray = [],
    frmmtedExpenseArray = [],
    frmttdBudget = 0,
    frmttdExpense = 0,
    budgetMax = 0,
    expenseMax = 0;
    data.forEach((element)=>{
        frmttdBudget = parseFloat(element.theme_budget?element.theme_budget:0);
        frmttdExpense = parseFloat(element.theme_expense?element.theme_expense:0);
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
            element.short_name = element.sector_name;
            element.total_budget = element.theme_budget;
            element.total_expense = element.theme_expense;
            element.color =  element.sector_color;  
            element.budgetPercentage = total==0?0: ( parseFloat(element.theme_budget)/ total)*100;
            element.expensePercentage = total ==0?0: (parseFloat(element.theme_expense)/total)*100;
        });
    }

}




export const fetchRecepientBudgetVsExpense = (code, year) => {
    return (dispatch) => {
        dispatch(recepientBudgetVsExpenseFetchStart())
        if (code != '' && year != null) {
            return Api.get(Api.API_RECIPIENT_BUDGET_VS_EXPENSE(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(recepientBudgetVsExpenseFetchEnd())
                    // const total = calcTotalBudgetExpense(resp.data);
                    const highestValue = calcHighestValue(resp.data);
                    if(highestValue === 0 ){
                        dispatch(recepientBudgetVsExpenseFetchFetchSuccess([]))
                        
                    }
                    else{
                        parseBudgetVsExpense(resp.data,highestValue);
                        dispatch(recepientBudgetVsExpenseFetchFetchSuccess(resp.data))
                    }
                    
                  
                } else {
                    dispatch(recepientBudgetVsExpenseFetchFetchFailed())
                }
            }).catch((exception) => {
                dispatch(recepientBudgetVsExpenseFetchEnd())
                dispatch(recepientBudgetVsExpenseFetchFetchFailed(exception))
            });
        }
        else {
            dispatch(recepientBudgetVsExpenseFetchClear())
            dispatch(recepientBudgetVsExpenseFetchEnd())
        }
    }
}



