import { h, Component } from 'preact';
import {
    numberToCurrencyFormatter,
    numberToCommaFormatter
} from '../../../utils/numberFormatter'
import style from './style'

export default class YearSummary extends Component {
    constructor(props) {
        super(props);
        this._TogglePrev = this._TogglePrev.bind(this);
        this._ToggleNext = this._ToggleNext.bind(this);
        this.state = {
            yearSummary: this.props.data.data ? this.props.data.data : {},
            yearArray: this.props.projectTimeline.year ? this.props.projectTimeline.year : [],
            yearCount: 0
        }
    }
    componentWillMount() {
        let year = this.state.yearArray.length && this.state.yearArray[0]
        // this.props.onUpdateYear(year);
        year && this.props.fetchYearSummary(year);
        // this.props.fetchThemeSummaryData(year);
        // this.props.fetchDonorFundListData(year);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.projectTimeline.year.length != this.props.projectTimeline.year.length) {
            this.setState({yearArray: nextProps.projectTimeline.year
            })
            this.props.fetchYearSummary(nextProps.projectTimeline.year[0]);
        }
        this.setState({yearSummary: nextProps.data.data})
    }
    _ToggleNext() {

        this.setState({
            yearCount: this.state.yearCount - 1,
        }, () => {
            // this.props.onUpdateYear(this.state.yearArray[this.state.yearCount])

            this.props.fetchYearSummary(this.state.yearArray[this.state.yearCount]);
            // this.props.fetchThemeSummaryData(this.state.yearArray[this.state.yearCount]);
            // this.props.fetchDonorFundListData(this.state.yearArray[this.state.yearCount]);
            this.props.setMapCurrentYear(this.state.yearArray[this.state.yearCount]);
        })
    }

    _TogglePrev() {

        this.setState({
            yearCount: this.state.yearCount + 1,
        }, () => {
            // this.props.onUpdateYear(this.state.yearArray[this.state.yearCount])
            this.props.fetchYearSummary(this.state.yearArray[this.state.yearCount]);
            // this.props.fetchThemeSummaryData(this.state.yearArray[this.state.yearCount]);
            // this.props.fetchDonorFundListData(this.state.yearArray[this.state.yearCount]);
            this.props.setMapCurrentYear(this.state.yearArray[this.state.yearCount]);
        })
    }

    smoothScroll = (target) => {
        var scrollContainer = target;
        do { //find scroll container
            scrollContainer = scrollContainer.parentNode;
            if (!scrollContainer) return;
            scrollContainer.scrollTop += 1;
        } while (scrollContainer.scrollTop == 0);

        var targetY = 0;
        do { //find the top of target relatively to the container
            if (target == scrollContainer) break;
            targetY += target.offsetTop;
        } while (target = target.offsetParent);

        let scroll = function (c, a, b, i) {
            i++; if (i > 30) return;
            c.scrollTop = a + (b - a) / 30 * i;
            setTimeout(function () { scroll(c, a, b, i); }, 20);
        }
        // start scrolling
        scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0);
    }
    render() {
        let { selectedIndex, yearSummary, yearCount, yearArray } = this.state,
            data = yearSummary,
            summaryLength = Object.keys(yearSummary).length

        const TOGGLE_PREV_DISABLED = (yearCount === yearArray.length - 1),
            TOGGLE_NEXT_DISABLED = (yearCount === 0)
        return (
            (summaryLength ?
                <section class={style.annualSection}>
                    <div class={style.yearSlider}>
                        <button
                            disabled={TOGGLE_PREV_DISABLED}
                            class={TOGGLE_PREV_DISABLED ? style.inActivePrevious : style.previous}
                            onClick={() => this._TogglePrev()}
                        >{' '}</button>
                        <span class={style.annualHeading}>{yearArray[yearCount]}</span>
                        <button
                            disabled={TOGGLE_NEXT_DISABLED}
                            class={TOGGLE_NEXT_DISABLED ? style.inActiveNext : style.next}
                            onClick={() => this._ToggleNext()}
                        >{' '}</button>
                    </div>
                    <div class={style.annualFigure}>
                        <article class={style.graphSection} onclick={() => this.smoothScroll(document.getElementById('explore_section'))}>
                            <div class={style.graphContent}>
                                <span class={style.value}>{data.budget ? numberToCurrencyFormatter(data.budget, 2) : numberToCurrencyFormatter(0)}</span>
                                <span class={style.description}>Budget</span>
                            </div>

                        </article>

                        <article class={style.graphSection} onclick={() => this.smoothScroll(document.getElementById('explore_section'))}>
                            <div class={style.graphContent}>
                                <span class={style.value}>{data.expense ? numberToCurrencyFormatter(data.expense, 2) : numberToCurrencyFormatter(0)}</span>
                                <span class={style.description}>Expense</span>
                            </div>

                        </article>

                        <article class={style.graphSection} onclick={() => this.smoothScroll(document.getElementById('explore_section'))}>
                            <div class={style.graphContent}>
                                <span class={style.value}>{data.countries && numberToCommaFormatter(data.countries)}</span>
                                <span class={style.description}>Countries</span>
                            </div>

                        </article>

                        <article class={style.graphSection}>
                            <a href={`/projects`}>
                                <div class={style.graphContent}>
                                    <span class={style.value}>{data.projects ? numberToCommaFormatter(data.projects) : 0}</span>
                                    <span class={style.description}>Projects</span>
                                </div>
                            </a>
                        </article>

                        <article class={style.graphSection}>
                            <a href={`/donors`}>
                                <div class={style.graphContent}>
                                    <span class={style.value}>{data.donors ? numberToCommaFormatter(data.donors) : 0}</span>
                                    <span class={style.description}>Donors</span>
                                </div>
                            </a>
                        </article>
                    </div>
                </section>:null)
        )
    }
}



