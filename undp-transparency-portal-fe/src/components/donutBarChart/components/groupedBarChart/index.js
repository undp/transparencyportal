import { h, Component } from 'preact';
import List from '../../../../components/listView';
import BarChartItem from '../barChartItem';
import style from './style';

export default class GroupedBarChart extends Component {
	constructor(props, context) {
		super(props, context);
	}

	renderRow = (item, index) => {
		return (<BarChartItem
			label1={this.props.label1}
			label2={this.props.label2}
			data={item.item}
			index={index}
		/>)
	}

	render() {
		return (
			<div class={style.wrapper}>
				<div class={style.list_wrapper}>
					{this.props.data && this.props.data.length ?
						<div>
							<div class={style.legendOuterWrapper}>
								<div class={style.legendInnerWrapper}>
								</div>
							</div>
							<List
								data={this.props.data}
								renderItem={this.renderRow}
							/>
						</div>
						:
						<span class={style.noResults}>No Results</span>
					}
				</div>

			</div>
		);
	}
}

