import { h, Component } from 'preact';
import style from './style';
export default class VerticalFlagList extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			showtooltip: '',
			tooltipData: '',
			country_name: '',
			tooltipPosition: [0, 0]
		}
	}
	componentWillMount() {

	}
	componentWillReceiveProps(nextProps) {

	}
	showTooltip(e, data){
		this.setState({ showtooltip: true, country_name: data, tooltipPosition: [e.clientX, e.clientY] });
	  }
	  tooltipOut = (data) =>  {
			this.setState({ showtooltip: false });
		}
	render(props) {
		return (
			<div class={style.top_container}>
				<span class={style.header}>
					<span>Our Approaches</span>
				</span>
				<div class={style.tableWrapper}>    
					<ul class={style.list}>
					{
						props.data.map((item, index) =>
						<li class={index === (props.data.length - 1) ? `${style.lastLi}` : `${style.li}`}>
							<span class={style.legend_item}>
								<span class={item.type === 1 ? `${style.knowledge_legend_block}`: item.type === 3 ? `${style.partnership_legend_block}`: `${style.capacity_legend_block}`} />
								<span class={`${style.legend_text}`}>{item.title}</span>
							</span>
							<span style={item.description.toLocaleLowerCase().trim() === item.title.toLocaleLowerCase().trim() ? 'display:none':'display:block'} class={style.desc}>{item.description}</span>
							<ul class={style.flagList}>
							{
								item.countries.map((country, inde) =>
								<li class={style.flagli}>
									<img onMouseOver={(e)=> this.showTooltip(e, country.country_name)}
									onMouseOut={()=> this.tooltipOut(this.props.data)} 
									class={style.flagImg} src={country.country_iso3 ? this.props.apiBase+'/media/flag_icons/'+country.country_iso3+'.svg' : '/assets/images/Empty.svg'}></img>
								</li>
								)
							}
							</ul>
						</li>
						)
					}
					</ul>
				</div>
				<span class={this.state.showtooltip ? 
							`${style.tooltipDonors} ${style.otherTooltip}`
							: style.tooltipDisplay}
							style={{top: `${this.state.tooltipPosition[1]}px`, left: `${this.state.tooltipPosition[0]}px`}}
						>
				<span>{this.state.country_name}</span>
				</span>
			</div>
		);
	}
}