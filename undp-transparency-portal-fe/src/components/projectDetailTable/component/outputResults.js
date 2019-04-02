import { h, Component } from 'preact';
import PreLoader from '../../preLoader'
import style from './style';
import {
    numberToCurrencyFormatter,
    numberToCommaFormatter
} from '../../../utils/numberFormatter'
import { Scrollbars } from 'react-custom-scrollbars';

export default class OutputResults extends Component {
    constructor(props) {
        super(props)
        this.state = {
            yearSpan: [],
            activeYear: null,
            activeOutput: {
                target: [],
                actual: []
            }
        }
    }
    parseData(modalData) {
        this.output = modalData.result_periods.map((item, index) => {
            return {
                year: new Date(item.period_start).getFullYear(),
                actual: item.actual != null ? item.actual.split('\n') : '',
                target: item.target != null ? item.target.split('\n') : ''
            }
        })
        this.setState({
            yearSpan: modalData.result_period_span,
            activeYear: modalData.result_period_span[0],
            activeOutput: this.output[0]
        })
    }

    switchBtn = (year) => {
        let activeOutput = this.output.filter((item, index) => {
            return item.year == year
        })
        this.setState({ activeYear: year, activeOutput: activeOutput[0] })
    }
    componentWillReceiveProps(nextProps) {
        nextProps.data && this.parseData(nextProps.data)
    }
    componentDidMount() {
        this.props.data && this.parseData(this.props.data)
    }
    render({ data }, { yearSpan, activeYear, activeOutput }) {
        let indicators = data && data.indicator_description ? data.indicator_description.split('\n') : []
        let baseline = data && data.baseline_comment ? data.baseline_comment.split('\n') : []
        return (
            <div class={style.modal}>
                <section className={style.outerContainer}>
                    <div className={style.modalContainer}>
                        <header class={style.headerWrapper}>
                            <h3 className={style.resultsHeader}>Results</h3>
                            <span className={style.closeBtn} onClick={() => this.props.onCloseModal()} ></span>
                        </header>
                        {
                            this.props.data ?
                                <div class={style.modalContent}>

                                    <Scrollbars>
                                        <section class={style.desktop}>
                                            <section className={style.yearWrapper}>
                                                {
                                                    this.state.yearSpan.map((year, index) => {
                                                        return (
                                                            <button className={style.yearBtn + ' ' + (year == activeYear ? style.activeYear : '')}
                                                                onClick={() => { this.switchBtn(year) }}>
                                                                {year}
                                                            </button>)
                                                    })
                                                }
                                            </section>
                                        </section>
                                        <div class={style.results_container}>

                                            <div class={style.results_item}>
                                            <div class={style.results_container_wrapper}>
                                                <div class={style.detailWrapper}>
                                                    <div class={style.topHeading}>
                                                        <h4>{'Indicators'}</h4>
                                                    </div>
                                                    <ul class={style.detailsSection}>
                                                        {indicators.length>0?

                                                            indicators.map((item, indexItem) => {
                                                                return (
                                                                    <li>
                                                                        <span class={style.textValue}>{item}</span>
                                                                    </li>
                                                                )
                                                            })
                                                            :
                                                            <span class={style.textValue}>{'No data available'}</span>
                                                        }
                                                    </ul>
                                                </div>
                                                <div class={style.detailWrapper}>
                                                    <div class={style.topHeading}>
                                                        <h4>{'Baseline'}</h4>
                                                    </div>
                                                    <ul class={style.detailsSection}>
                                                        {baseline.length> 0?
                                                            baseline.map((item, indexItem) => {
                                                                return (
                                                                    <li>
                                                                        <span class={style.textValue}>{item}</span>
                                                                    </li>
                                                                )
                                                            })
                                                            :
                                                            <span class={style.textValue}>{'No data available'}</span>
                                                        }
                                                    </ul>
                                                </div>
                                                </div>
                                            </div>
                                            <div class={style.results_item}>
                                                <section class={style.mobile}>
                                                    <section className={style.yearWrapper}>
                                                        {
                                                            this.state.yearSpan.map((year, index) => {
                                                                return (
                                                                    <button className={style.yearBtn + ' ' + (year == activeYear ? style.activeYear : '')}
                                                                        onClick={() => { this.switchBtn(year) }}>
                                                                        {year}
                                                                    </button>)
                                                            })
                                                        }
                                                    </section>
                                                </section>
                                                <footer className={style.footerContainer}>
                                                    <div className={style.footerDataWrapper}>
                                                        <h4>Target</h4>
                                                        <ul class={style.detailsSection}>
                                                            {activeOutput.target.length > 0 ?
                                                                activeOutput.target.map((item, indexItem) => {
                                                                    return (
                                                                        <li>
                                                                            <span class={style.textValue}>{item}</span>
                                                                        </li>
                                                                    )
                                                                })
                                                                :
                                                                <span class={style.textValue}>{'No data available'}</span>
                                                            }
                                                        </ul>
                                                    </div>
                                                    <div className={style.footerDataWrapper}>
                                                        <h4>Result</h4>
                                                        <ul class={style.detailsSection}>
                                                            {activeOutput.actual.length > 0 ?

                                                                activeOutput.actual.map((item, indexItem) => {
                                                                    return (
                                                                        <li>
                                                                            <span class={style.textValue}>{item}</span>
                                                                        </li>
                                                                    )
                                                                })
                                                                :<span class={style.textValue}>{'No data available'}</span>
                                                            }
                                                        </ul>
                                                    </div>
                                                </footer>
                                            </div>
                                            </div>

                                    </Scrollbars>
                                </div> : <div class={style.preloaderWrapper}><PreLoader /></div>
                        }

                    </div>
                </section>
            </div>
        );
    }
}