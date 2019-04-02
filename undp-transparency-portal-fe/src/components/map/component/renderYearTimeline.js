import { h, Component } from 'preact';
import style from './style';

export default class YearLegend extends Component {
    constructor(props) {
        super(props);
        
        this.currentYear = _.findIndex(this.props.data, (element) => {
            return element === this.props.mapCurrentYear;
        });
        this.currentYearIndex = this.props.mapCurrentYear;
        let currentEndIndex = Math.min(((Math.floor(this.currentYear/5)+1)*5 )-1,this.props.data.length-1);

        this.state = {
            yearSelected: this.currentYearIndex,
            disablePrev: (this.currentYear !== -1)? currentEndIndex -4 === 0: false ,
            disableNext: (this.currentYear !== -1)? currentEndIndex === this.props.data.length-1 : true ,
            startIndex: currentEndIndex - 4,
            endIndex: currentEndIndex,
            year: this.props.data
        }
    }

    componentWillReceiveProps(nextProps) {
        if (! _.isEqual(_.sortBy(this.props.data), _.sortBy(nextProps.data ))) {
            let currentYear = _.findIndex(nextProps.data,(element) => { 
                return element === nextProps.mapCurrentYear;
            });
            let start, end;
            end =Math.min(((Math.floor(currentYear/5)+1)*5) -1,nextProps.data.length-1);
            end < 0 ? end = nextProps.data.length-1: null;
            start = end- 4;
            this.setState({
                yearSelected: nextProps.mapCurrentYear,
                startIndex: start,
                endIndex: end,
                disablePrev: start===0,
                disableNext: end === nextProps.data.length-1,
                year: nextProps.data
            })
        }
        this.initialFlag = false;
        if (this.props.mapCurrentYear != nextProps.mapCurrentYear) {
            if(nextProps.data.length > 5){
                let currentYear = _.findIndex(nextProps.data,(element)=> { 
                    return element === nextProps.mapCurrentYear;
                });
                // if(currentYear < 0 ){
                //     currentYear = nextProps.data.length-1;
                //     this.props.setYear(nextProps.data[currentYear]);
                // }
                let rangeEnd = Math.min(((Math.floor(currentYear/5)+1)*5 )-1,nextProps.data.length-1);
                rangeEnd < 0 ? rangeEnd = nextProps.data.length-1 : null;
                const rangeStart = rangeEnd -4;
                this.setState({ yearSelected: nextProps.mapCurrentYear,
                    endIndex: rangeEnd,
                    startIndex: rangeStart,
                    disablePrev: rangeStart === 0,
                    disableNext: rangeEnd === (nextProps.data.length-1)
                });
            } else {
                this.setState({ yearSelected: nextProps.mapCurrentYear });
            }    
        }
    }
    yearChange = (change, value) => {
        let { startIndex, endIndex, year, yearSelected, disablePrev, disableNext } = this.state;
        if(year.length > 5){
            if (change == 'prev' && !disablePrev) {
                startIndex -= 1;
                endIndex -= 1;
                disableNext = false;
                startIndex == 0 ? disablePrev = true : disablePrev = false;
            }
            else if (change == "next" && !disableNext) {
                endIndex += 1;
                startIndex += 1;
                disablePrev = false
                endIndex == year.length - 1 ? disableNext = true : disableNext = false;
            }
            else return
            this.setState({
                startIndex,
                endIndex,
                disablePrev,
                disableNext
            })  
        }
    }
    renderYearItem = (year, index, yearSelected) => {
    
        if (index >= this.state.startIndex && index <= this.state.endIndex) {
            return (
                <li key={index} class={yearSelected === year ? style.active : null} onClick={(e) => this.props.setYear(year)}>{year}</li>
            )
        }
        else
            return null;
    }
    render(props, { disablePrev, disableNext, startIndex, endIndex, yearSelected, year }) {
       
        const currentYear = _.findIndex(year,(element) => { 
            return element === yearSelected;
        });

        const rangeEnd = Math.min(((Math.floor(currentYear/5)+1)*5 )-1,year.length-1);
        const rangeStart = rangeEnd -4;



        disablePrev = (year.length < 6)? true : disablePrev ;
        disableNext = (year.length < 6)? true : disableNext ;
        return (
            <ul class={style.yearLegend}>
                <li onClick={() => this.yearChange('prev')}><span class={disablePrev ? `${style.arrowLeft} ${style.disableArrowLeft}` : `${style.arrowLeft}`}></span></li>
                {
                    year.map((year, index) => {
                        {
                            return this.renderYearItem(year, index, yearSelected);  
                        }
                    })
                }
                <li onClick={() => this.yearChange('next')}><span class={disableNext ? `${style.arrowRight} ${style.disableArrowRight}` : `${style.arrowRight}`}></span></li>
            </ul>
        )
    }
}