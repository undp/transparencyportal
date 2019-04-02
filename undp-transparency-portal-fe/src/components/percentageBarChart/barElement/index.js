import { h, Component } from 'preact';
import style from './style';
import { numberToCurrencyFormatter } from '../../../utils/numberFormatter';

export default class BarElement extends Component {
	constructor(props) {
        super(props);
        this.state = {
			showtooltip: '',
			tooltipData: '',
			tooltipPosition:[0, 0]
		}
	}

	tooltipHover = (e, data) =>  {
		this.setState({ showtooltip: true, tooltipData: data, tooltipPosition:[e.clientX, e.clientY] });
	}

	tooltipOut = (data) =>  {
		this.setState({ showtooltip: false });
	}
	
	renderPercentageBar = (data) => {
		return (
			<div class={style.barChart}>
				<div class={`${style.displayTextWrapper} ${style.mobile_responsive}`}>
					<div class={style.title}>
						<a class={style.donorName}
						target={this.props.embed?"_blank":""}
						href={`/profile/${data.donor_code}/donorprofile`}target>{data.name}</a>
					</div>
				</div>
				<div class={style.container}>
					<div class={style.innerChartWrapper} style={{ width: data.target_percentage + '%' }}></div>
					<div class={style.percentText}>{Math.round( data.target_percentage * 10 ) / 10 }%</div>
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
		return (
			<div class={style.barChartBlock}>
				<div class={`${style.displayTextWrapper} ${style.desktop_responsive}`}>
					<div class={style.title}>
						<a class={style.donorName} href={`/sdg/targets/${data.target_id.replace('.','/')}`}>Target {data.target_id}</a>
					</div>
				</div>
				{this.renderPercentageBar(data)}
				<section class={style.bgdEpxSection}>
					<article class={style.bgdEpxArticle}>
						<div class={style.bgtDiv}>
							<div>Budget: 
								<span class={style.boldnumber}>{numberToCurrencyFormatter(data.target_budget, 2)}</span>
							</div>
						</div>
						<div class={style.expDiv}>
							<div>Expense: 
								<span class={style.boldnumber}>{numberToCurrencyFormatter(data.target_expense, 2)}</span>
							</div>
						</div>
					</article>
				</section>
			</div>
		);
	}
}