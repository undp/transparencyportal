import { h, Component } from 'preact';
import style from './style';
import { numberToCurrencyFormatter } from '../../utils/numberFormatter';

export default class AllThemesBar extends Component {
	renderBottomRow = () => {
		let projectDetails = this.props.data;
		return (
			<section class={style.rowBottom}>
				<article class={style.columnLeft}>
					<div class={style.all_theme_content}>
						<div class={style.content_value}>{projectDetails && projectDetails.budget ? numberToCurrencyFormatter(projectDetails.budget, 2) : '-'}</div>
						<div class={style.content_key}>{'Total Budget'}</div>
					</div>
					<div class={style.all_theme_content}>
						<div class={style.content_value}>{projectDetails && projectDetails.expense ? numberToCurrencyFormatter(projectDetails.expense, 2) : '-'}</div>
						<div class={style.content_key}>{'Total Expense'}</div>
					</div>
				</article>
			</section>
		);
	}

	render() {

		return (
			<article className={this.props.selected === -1 ? style.isActive : style.isInActive} onClick={() => this.props.selectRow(this.props.index)}>
				{this.renderBottomRow(this.props.data)}
			</article>
		);
	}
}

