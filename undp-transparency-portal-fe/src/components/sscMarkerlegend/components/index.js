import style from './style';
const SscMarkerlegend = () => (
	<div class={style.legend_container}>
		<span class={style.legend_item}>
			<span class={style.capacity_legend_block} />
			<span class={`${style.legend_text} ${style.capacity_text}`}>Capacity builder</span>
		</span>
		<span class={style.legend_item}>
			<span class={style.knowledge_legend_block} />
			<span class={`${style.legend_text} ${style.knowledge_text}`}>Knowledge broker</span>
		</span>
		<span class={style.legend_item}>
			<span class={style.partnership_legend_block} />
			<span class={`${style.legend_text} ${style.partnership_text}`}>Partnership facilitator</span>
		</span>
	</div>
);

export default SscMarkerlegend;