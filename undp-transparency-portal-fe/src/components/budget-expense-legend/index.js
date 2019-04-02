import style from './style';
const BudgetExpenseLegend = () => (
	<div class={style.legend_container}>
		<span class={style.legend_item}>
			<span class={style.budget_legend_block} />
			<span class={style.legend_text}>Budget</span>
		</span>
		<span class={style.legend_item}>
			<span class={style.expense_legend_block} />
			<span class={style.legend_text}>Expense</span>
		</span>
	</div>
);

export default BudgetExpenseLegend;