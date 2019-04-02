import { h, Component } from 'preact';
import style from './style';
import { numberToCurrencyFormatter, formatPercentage } from "../../utils/numberFormatter";
export default class RegularOtherLegend extends Component {

	render() {
		return (
			<div>
				{
					this.props.data.map((item, index) => (
						<div class={style.regularOtherItem} key={index}>
							<span>
								<span class={style.total_contribution}>{numberToCurrencyFormatter(item.total_contribution, 2)}</span>
								<span class={style.percentage}>{`(${formatPercentage(item.percentage)}%)`}</span>
							</span>
							<span class={style.fundType}>{item.fund_type}</span>
						</div>
					))
				}
			</div>
		);
	}
}