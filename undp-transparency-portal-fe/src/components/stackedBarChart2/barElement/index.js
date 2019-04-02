import { h, Component } from 'preact';
import style from './style';
import { numberToDollarFormatter } from '../../../utils/numberFormatter';
import { getAPIBaseUrRl } from '../../../utils/commonMethods';

export default class BarElement extends Component {
	constructor(props) {
        super(props);
        this.state = {
			showtooltip: '',
			tooltipData: '',
			tooltipPosition:[0, 0]
		}
	}

	calculatePerc = (data) => {
		let regularPerc = (data.regular / data.contribution) * 100,
			otherPerc = (data.other / data.contribution) * 100;
		return {
			regularPerc,
			otherPerc
		};
	}

	tooltipHover = (e, data) =>  {
		this.setState({ showtooltip: true, tooltipData: data, tooltipPosition:[e.clientX, e.clientY] });
	}

	tooltipOut = (data) =>  {
		this.setState({ showtooltip: false });
	}
	
	renderPercentageBar = (data) => {
		const { regularPerc, otherPerc } = this.calculatePerc(data),
		regular = numberToDollarFormatter(data.regular),
		other = numberToDollarFormatter(data.other),
		imgSrc = this.props.donors==='true' ? `${getAPIBaseUrRl()}/media/flag_icons/${data.donor_code}.svg`: '';
		return (
			<div class={style.barChart}>
				<div class={this.props.donors? `${style.displayTextWrapper} ${style.mobile_responsive} ${style.donorLegendMobile}` :`${style.displayTextWrapper} ${style.mobile_responsive}`}>
					{
						this.props.donors?
							<img src={imgSrc} alt={'logo'} class={style.donorFlag}  onError={(e)=>{ e.target.src = '../../../assets/images/Empty.svg'}} />
						:	null 
					}
					<div>
						<div class={style.title}>
							<a class={style.donorName}
							target={this.props.embed?"_blank":""}
							href={`/profile/${data.donor_code}/donorprofile`}target>{data.name}</a>
						</div>
						<div class={style.contribution}>{numberToDollarFormatter(data.contribution)}</div>
					</div>
				</div>
				<div class={style.innerChartWrapper} style={{ width: data.perc + '%' }}>
					<div onMouseOver={(e)=> this.tooltipHover(e, regular)} class={style.regular} style={{ width: `${regularPerc}%` }} onMouseOut={()=> this.tooltipOut(regular)} />
					<div onMouseOver={(e)=> this.tooltipHover(e, other)} class={style.other} style={{ width: `${otherPerc}%` }} onMouseOut={()=> this.tooltipOut(other)}/>
				</div>
				<span 
					class={this.state.showtooltip ? 
					`${style.tooltipDonors} ${style.otherTooltip}`
					: style.tooltipDisplay}
					style={{top: `${this.state.tooltipPosition[1]}px`, left: `${this.state.tooltipPosition[0]}px`}}
				>
					{this.state.tooltipData}
				</span>
			</div>
		);
	}

	render({ data }, state) {
		const imgSrc = this.props.donors==='true' ? `${getAPIBaseUrRl()}/media/flag_icons/${data.donor_code}.svg`: '';
		return (
			<div class={style.container}>
				<div class={this.props.donors? `${style.displayTextWrapper} ${style.desktop_responsive} ${style.donorLegend}`:`${style.displayTextWrapper} ${style.desktop_responsive} `}>
					{
						this.props.donors?
								<img src={imgSrc} alt={'logo'} class={style.donorFlag}  onError={(e)=>{ e.target.src = '../../../assets/images/Empty.svg'}} />
						: null 
					}
					<div>
						<div class={style.title}>
							<a class={style.donorName} href={`/profile/${data.donor_code}/donorprofile`}>{data.name}</a>
						</div>
						<div class={style.contribution}>{numberToDollarFormatter(data.contribution)}</div>
					</div>
				</div>
				{this.renderPercentageBar(data)}
			</div>
		);
	}
}