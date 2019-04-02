import { h, Component } from 'preact';
import { numberToCurrencyFormatter } from '../../utils/numberFormatter'
import { roundTo } from '../../utils/numberFormatter'
import style from './style'

export default class ContributionIndicator extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            styles: {
                progressBar: {
                    backgroundColor: '#16537d',
                    width: this.contribution_percentage + '%',
                },
                legendBlock: {
                    backgroundColor: '#16537d',
                },
                legendLabelText: {
                    marginLeft: 10,
                    display: 'table-cell'
                }


            },
            data: this.props.data
        },

            this.contribution_percentage = 0,
            this.total_contribution = 0;
    }
    componentDidMount() {
        this.computePercentageContribution();
    }
    componentWillReceiveProps(nextProps) {
        this.computePercentageContribution();
    }
    computePercentageContribution = () => {
        if (this.props.data.length) {
            var result = this.props.data.filter(function (obj) {
                return obj.fund_type == 'Regular Resources';
            });

            if (result.length) {
                this.contribution_percentage = result[0].percentage,
                    this.total_contribution = result[0].total_contribution
            }
            else {
                this.contribution_percentage = 0,
                    this.total_contribution = 0
            }
        }
        this.setState({
            styles: {
                progressBar: {
                    backgroundColor: '#16537d',
                    width: this.contribution_percentage + '%',
                },
                legendBlock: {
                    backgroundColor: '#16537d',
                }
            }
        })

    }

    render() {
        var percentage = roundTo(this.contribution_percentage, 1);
        let percentageShow;
        if(percentage === 0) {
            percentageShow ='0'
        }
        else if(percentage >0 && percentage <1) {
            percentageShow = '>1'
        }
        else {
            percentageShow = percentage
        }
        return (
            <div>
                <div class={`${style.contribution_wrapper} ${this.props.contributionSliderWrapper}`}>
                    <span class={style.individual_contribution}>{numberToCurrencyFormatter(this.total_contribution, 2)}</span>
                    <span class={style.contribution_percentage}>({percentageShow}%)</span>
                </div>
                <div class={style.progress}>
                    <div style={this.state.styles.progressBar} class={style.progressBar}></div>
                    <div class={style.bar_step} style="left: 0%">
                        <div class={style.label_percent}>0%</div>
                        <div class={style.label_line}></div>
                    </div>
                    <div class={style.bar_step} style="left: 20%">
                        <div class={style.label_percent}>20%</div>
                        <div class={style.label_line}></div>
                    </div>
                    <div class={style.bar_step} style="left: 40%">
                        <div class={style.label_percent}>40%</div>
                        <div class={style.label_line}></div>
                    </div>
                    <div class={style.bar_step} style="left: 60%">
                        <div class={style.label_percent}>60%</div>
                        <div class={style.label_line}></div>
                    </div>
                    <div class={style.bar_step} style="left: 80%">
                        <div class={style.label_percent}>80%</div>
                        <div class={style.label_line}></div>
                    </div>
                    <div class={style.bar_step} style="left: 100%">
                        <div class={style.label_percent}>100%</div>
                        <div class={style.label_line}></div>
                    </div>
                </div>

                <div class={style.legendCenter}>
                    <div
                        class={style.legend}>
                        <div class={style.legendLabel}>
                            <div style={this.state.styles.legendBlock} class={style.legendBlock}>
                            </div>
                        </div>
                        <span class={style.legendLabelText}>
                            {this.props.legendText}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}

