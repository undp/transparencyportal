import { h, Component } from 'preact';
import { numberToCurrencyFormatter } from '../../utils/numberFormatter';
import style from './style';
import DonutChart from '../donutChart';
import GroupedBarChart from './components/groupedBarChart';
import NoDataTemplate from '../no-data-template'
import PreLoader from '../preLoader'
import BudgetExpenseLegend from '../budget-expense-legend'



export default class DonutBarCharts extends Component {
   
    render() {
        if(this.props.barChartData.data ){
            if (this.props.barChartData.data.length>0) {
                if (this.props.barChartData.data[0].sdg_code) {
                    this.props.barChartData.data = this.props.barChartData.data.map((element) => {
                        let data = {
                            ...element,
                            total_budgetNumber: parseFloat(element.total_budget)
                        }
                        return data;
                    })
                    let others = _.remove(this.props.barChartData.data, (element) =>{
                        return element.sdg_code  === "0";
                      });
                    let sortedArray =this.props.barChartData.data.sort((item1,item2)=> {
                        return item1.total_budgetNumber < item2.total_budgetNumber ? 1 : item2.total_budgetNumber < item1.total_budgetNumber? -1 :0;
                    })
                    others.length > 0 ?sortedArray.push(others[0]):null;
                    this.props.barChartData.data = sortedArray;
;
                }  
            } 
        }
        this.props.sdg==='true' &&  this.props.donutData.data ? 
            this.props.donutData.data = this.props.donutData.data.map(element => {
                return {
                    ...element,
                    budget: element.sdg_budget
                } 
            })
        :   null;
        return (
            <div class={style.wrapper}>
                {
                    this.props.donutData.loading ?
                        <div class={style.preLoaderWrapper}>
                            <PreLoader />
                        </div> :
                        this.props.donutData.data.length !== 0 ?
                            <div class={style.donutChartWrapper}>
                                <div class={style.headerWrapper}>% of Budget
                                </div>
                                <div class={style.donuttopWrapper}>
                                <DonutChart
                                    data={this.props.donutData.data}
                                    legendData={[
                                        {
                                        },
                                        {
                                        }
                                    ]}
                                    chartWidth={456}
                                    chartHeight={456}
                                    chart_id={this.props.donutChartId}
                                    textFieldStyle={ this.props.recipientProfile==='true' ? style.recipientProfileChartHeaderInfo : (this.props.textFieldSDGStyle ? this.props.textFieldSDGStyle : style.textFieldStyle)}
                                    textWrapperStyle={style.textWrapperStyle}
                                    donor_wrapper_styles={style.donorWrapperStyle}
                                    displayLegend={'false'}
                                    displayRegularLegend={'false'}
                                />
                                </div>
                            </div> :
                            <div class={style.noDataTemplateWrapper}>
                                <NoDataTemplate />
                            </div>




                }

                {
                    this.props.barChartData.loading ?
                        <div class={style.preLoaderWrapper}>
                            <PreLoader />
                        </div> :
                        this.props.barChartData.data.length !== 0 ?
                            <div class={style.barChartWrapper}>
                            <div class={style.headerWrapper}>Budget - Expense
                            <BudgetExpenseLegend /></div>

                                <GroupedBarChart
                                    label1={'Budget'}
                                    label2={'Expense'}

                                    data={this.props.barChartData.data}
                                />
                            </div> : <div class={style.noDataTemplateWrapper}>
                                <NoDataTemplate />
                            </div>
                }
            </div>

        )


    }
}
