import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import List from '../../components/listView'
import style from './style';
import ProgressBar from '../../components/progressBar'
import { numberToCurrencyFormatter } from '../../utils/numberFormatter'
import { getSDGImageFromCode } from '../../utils/commonActionUtils'

export default class SideBarItem extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			styles: {
				alloted_budget: {
					color: this.props.data.color,
					fontSize: 18,
					fontWeight: 600,
					textTransform: 'uppercase'
				},
			},
		}
	}
	componentWillReceiveProps(nextProps) {

		this.setState({
			styles: {
				alloted_budget: {
					color: nextProps.data.color,
					fontSize: 18,
					fontWeight: 600,
					textTransform: 'uppercase'
				},
			}
		})
	}
    renderTopRow = (item) => {
		var sdg_src = item.sdg_code && getSDGImageFromCode(item.sdg_code),
			ssIcon = item.signature_solution ? item.ss_id === '0' ? '/assets/icons/placeHolder.svg' : this.props.apiBase+'/media/ss-icons/SS-'+item.ss_id+'.svg': '';
		
    	return (
    		<section class={style.row}>
    			<article class={style.columnLeft}>  
    				{(item.sdg_code || item.signature_solution) && <div style={item.signature_solution ? 'float:left': ''} class={style.imageWrapper}><img class={style.sdg_image} src={item.signature_solution ? ssIcon : `/assets/icons/${sdg_src}`} alt="sdg image"  /></div>}
    				<div class={item.theme_name ? style.themesWrapper: style.sdgWrapper}>
    					<div class={style.theme_wrapper}>
    						{item.theme_name && this.props.tabSelected === 'themes' &&
								<a href={`/themes/${item.sector}/${item.theme_name}`} 
								target={this.props.embed?"_blank":""} title={item.theme_name} class={style.theme_name}>
								{item.theme_name}</a>
							}
    						{item.donor_name &&
								<span class={style.theme_name}>{item.donor_name}</span>}
							{item.sdg_name && <a href={`/sdg/${item.sdg_code}/${item.sdg_name}`} 
							target={this.props.embed?"_blank":""} class={style.theme_name}>{item.sdg_name}</a>}
							{item.signature_solution && <a title={item.signature_solution} href={`/signature/${item.ss_id}/${item.signature_solution}`} 
							target={this.props.embed?"_blank":""} class={style.theme_name}>{item.signature_solution}</a>}
    						<span class={style.theme_point}>{`(${item.total_projects})`}</span>
    					</div>
    					<section class={style.rowMiddle}>
    						<article class={style.columnLeft} >
    							<div class={style.percentageFill}>
    								<ProgressBar
    									tabSelected={this.props.tabSelected}
    									percentage={item.share_percent}
    									color={item.color} />

    							</div>
    						</article>

    						<div class={style.arrowDesktop}>
    							<article class={style.columnRight}
    								onClick={() => this.handleLangChange()}>
									{
										this.props.embed ? null:
										<span class={style.theme_next} />
									}
    								
    							</article>
    						</div>
    						<div class={style.arrowMobile}>
    							<article class={style.columnRight}
    								onClick={() => {
										this.props.selectMap &&	this.props.selectMap()
									}}>
									{
										this.props.embed ? null:
										<span class={style.theme_map} />
									}
    							</article>
    						</div>

    					</section>
    				</div>
    			</article>

    		</section>
    	);
    }

    renderMiddleRow = (item) => {

    	return (
    		<div class={style.textMiddleRow}>
    			{(item.theme_name && this.props.tabSelected === 'themes') &&
					<p class={style.percentText}>{'of the total budget allotted to this Focus'}</p>}
				{(item.theme_name && this.props.tabSelected === 'signature') &&
                    <p class={style.percentText}>{'of the total budget allotted to this Signature Solution'}</p>}
    			{item.sdg_name &&
                    <p class={style.percentText}>{'of the total budget allotted to this SDG'}</p>}
    		</div>
    	);
    }

    handleLangChange = () => {
    	var flag = true

     this.props.onSelectLanguage &&	this.props.onSelectLanguage(flag);
    }

    renderBottomRow = (item) => {
    	return (
    		<section class={style.rowBottom}>
    			<article class={style.columnLeft}>
    				<div class={style.theme_content}>
    					<div style={this.state.styles.alloted_budget}>{item.budget ? numberToCurrencyFormatter(item.budget, 2) : numberToCurrencyFormatter(0)}</div>
    					<div class={style.content_key}>{'Budget'}</div>
    				</div>
    				<div class={style.theme_content}>
    					<div class={style.content_value}>{item.expense ? numberToCurrencyFormatter(item.expense, 2) : numberToCurrencyFormatter(0)}</div>
    					<div class={style.content_key}>{'Expense'}</div>
    				</div>
    			</article>
    		</section>
    	);
    }

    render() {
    	const selectedRow = this.props.data.sdg_name ? this.props.data.sdg_code : this.props.data.sector;
    	let type = this.props.data.sdg_name ? "sdg" : "sector";
    	return (
    		<article className={this.props.selected ? style.isActive : style.isInActive}
				onClick={(e) => { e.stopPropagation();
				this.props.selectRow && this.props.selectRow(selectedRow, this.props.index, type) 
				 
				 }}>
    			{this.renderTopRow(this.props.data)}
    			{this.renderMiddleRow(this.props.data)}
    			{this.renderBottomRow(this.props.data)}
    		</article>
    	);
    }
}