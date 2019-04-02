import { h, Component } from 'preact';
import style from './style';
export default class DonutChartLegend extends Component {
	render() {
		return (
			<div class={style.legend_wrapper}>
				{
					this.props.legendData.map((item, index) => (
						<div class={style.legendText}>
							<div class={style.legendColor} style={{ backgroundColor: '#' + item.color }} />
							<div class={`${style.legendLabel} ${this.props.legendLabel}`}>{item.fund_stream ? item.fund_stream : item.fund_type}</div>
						</div>
					))
				}
			</div>
		);
	}
}