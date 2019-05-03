import style from './style';
import {
	TOOLTIP_LABEL,
	SDG_OTHERS
} from '../../constants';

const SDGLegend = (props) => {
	
	return (
		<div class={style.sdgLegend}>
			{props.data.map((item, index) => (
				<div class={`${style.sdgItem} ${props.sdgTooltip === TOOLTIP_LABEL ? style.rightSDG : style.leftSDG}`} key={index} >
					<span style={{ color: '#' + item.color }} class={style.sdgPercent}>
						{Number(item.size.percentage).toFixed(1)}%
					</span>
					<span class={style.sdgImage}
						style={item.code !== SDG_OTHERS ?
							{ backgroundColor: '#' + item.color }
							: null}
					>
						<img class={item.code !== SDG_OTHERS ? style.imageItem : style.othersItem}
							src={props.baseURL+`${item.image}`}
						/>
					</span>
					{item.code === SDG_OTHERS ?
						<span id={`${props.sdgTooltip}-${index}`} class={style.sdgName}> {item.fullName} </span> :
						<a id={`${props.sdgTooltip}-${index}`}
							href={`/sdg/${item.code}/${item.fullName}`}
							target={props.embed ? '_blank' : '_self'}
						>
							<span class={style.sdgName}>{item.fullName}</span>
						</a>
					}
				</div>
			))}
			<div id={props.sdgTooltip} class={style.sdgTooltip} />
		</div>
	);
}
    ;

export default SDGLegend;