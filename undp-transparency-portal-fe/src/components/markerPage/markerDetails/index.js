/************************* Preact Files ************************/
import { h, Component } from 'preact';
import style from './style.scss';
import GroupedbarChart from '../../grouped-bar-chart';
import BudgetExpenseLegend from '../../budget-expense-legend';
import NoDataTemplate from '../../no-data-template';
import PreLoader from '../../preLoader';
import { Scrollbars } from 'react-custom-scrollbars';

export default class MarkerDetails extends Component{ 
	generateSubLevels(element){
		if (element.description_details === '') {
			let cellData = element.description_title.map((item)=> {
				return (
					<section>
						<span class={style.dataTitle}>
							<img src="../../../assets/icons/dot.png" class={style.bullet}/>
							<span class={style.titleText}>{item.level_two_marker_title}</span>
						</span> 
						<span class={style.dataDetails}> {item.level_two_marker_description}</span>
					</section>	
				);
			});
			return cellData;
		} else {
			return (<span class={style.dataDetails}>  {element.description_details}</span>);
		}
	}
	generateRows(data,marker){
		let rows = null;
		if (marker && data.type){
			if (marker.id===2){
				rows = data.type.map((element,index) => {
					return ( 
					<section key={index} class={style.row}>
						<section class={style.cell}>
							<Scrollbars class={style.scroll} 
								 renderTrackHorizontal={props => <div {...props}  style={{display:"none"}}/>}
								 renderThumbHorizontal={props => <div {...props}  style={{display:"none"}}/>}
							>
								<section class={style.data}>
									<section class={style.dataTitle}>
										<img src="../../../assets/icons/dot.png" class={style.bullet}/>
										<span class={style.titleText}>{element.type_title}</span>
									</section>
									<span class={style.dataDetails}>{element.type_details}</span>
								</section>
							</Scrollbars >
						</section>
						<section class={style.cell}>
							<Scrollbars class={style.scroll} 
								 renderTrackHorizontal={props => <div {...props}  style={{display:"none"}}/>}
								 renderThumbHorizontal={props => <div {...props}  style={{display:"none"}}/>}
							>
								<section class={style.data}>
									{
										this.generateSubLevels(element)
									}
								</section>
							</Scrollbars>
						</section>
					</section>);
				});
			} else {
				
				rows = data.type.map((element,index) => {
					return (
						<section key={index} class={style.row}>
							<section class={style.cell}>
							<Scrollbars class={style.scroll2}
								renderTrackHorizontal={props => <div {...props}  style={{display:"none"}}/>}
								renderThumbHorizontal={props => <div {...props}  style={{display:"none"}}/>}
							>
								<section class={style.data}>
									<span class={style.dataTitle2}>{element.type_title}</span>
								</section>
							</Scrollbars>
							</section>
							<section class={style.cell}>
							<Scrollbars class={style.scroll2}
								renderTrackHorizontal={props => <div {...props}  style={{display:"none"}}/>}
								renderThumbHorizontal={props => <div {...props}  style={{display:"none"}}/>}
							>
								<section class={style.data}>
									{
									(element.description_details.constructor == Array)? 
										element.description_details.map((item) => {
											return (
												<section class={style.listSection}>
													<img src="../../../assets/icons/dot.png" class={style.bullet2} />
													<span class={style.textTitle2}>{item}</span>
												</section>
											)
										})
									 : (element.description_details ==="")?
									 		element.description_title.map((item) => {
												return (
												<section class={style.listSection}>
													<img src="../../../assets/icons/dot.png" class={style.bullet2} />
													<span class={style.textTitle2}>{item}</span>
												</section>
											)})
									 	:	<span class={style.textTitle2}> {element.description_details}</span>}
								</section>
							</Scrollbars>
							</section>
						</section>);
					
				});
			}
		}
		return rows;
	}
    render(){

		const budgetSources = (this.props.chartData.data.budget_sources) ?
								this.props.chartData.data.budget_sources
								: [];
		const topRecipientOffices = (this.props.chartData.data.top_recipient_offices) ?
										this.props.chartData.data.top_recipient_offices
										:[];
	
        return (
            <section >
					<section class={this.props.hideMarkerDescTable? style.hide : style.table}>
						<section class={style.tableHeader} >
							<section class={style.tableHeaderSection}>
								<span class={style.tableHeaderData}> Type </span>
							</section>
							<section class={style.tableHeaderSection}>
								<span class={style.tableHeaderData}> Description </span>
							</section>
						</section>
						<section class={style.tableBody} >
							{	
								(!this.props.data.loading) ?
									(this.props.data.type && this.props.data.type.length !==0) ? 
										this.generateRows(this.props.data,this.props.marker)
									:   <NoDataTemplate />
								:
								<div style={{ position: 'relative', height: 344 }}>
									<PreLoader />
								</div>
							}
						</section>
					</section>
					<section>
					<div class={style.chartWrapper}>
						<div class={style.top_budget_sources_wrapper}>
							<span class={style.chartHead}>
								<span>Top 10 Donors</span>
								<BudgetExpenseLegend />
							</span>

							{
							!this.props.chartData.loading ?
								<div>
									{
									(budgetSources.length > 0) ?
									<div class={style.budget_sources_wrapper}>
										<GroupedbarChart
											chart_id="marker_budget_sources"
											width={1250}
											height={500}
											min_height={540}
											data={budgetSources}
											label={'short_name'}
											tspanSize={'12px'}
											textSize={'12px'}
										/>
									</div>
									:
									<NoDataTemplate />
									}
								</div>
								:
								<div style={{ position: 'relative', height: 344 }}>
									<PreLoader />
								</div>
							}
						</div>
					</div>
					{
					this.props.country === 'global' ? 
						<div class={style.chartWrapper}>
							<div class={style.top_budget_sources_wrapper}>
								<span class={style.chartHead}>
									<span>Top 10 Recipient Offices</span>
									<BudgetExpenseLegend />
								</span>
								{
								!this.props.chartData.loading ?
									(topRecipientOffices.length > 0)?
										<div class={style.budget_sources_wrapper}>
											<GroupedbarChart
												chart_id="sdg_profile_top_recipient_offices"
												width={1250}
												height={500}
												min_height={540}
												data={topRecipientOffices}
												label={'iso3'}
												tspanSize={'12px'}
												textSize={'12px'}
											/>
										</div>
										:
										<NoDataTemplate />
									:
									<div style={{ position: 'relative', height: 344 }}>
										<PreLoader />
									</div>
								}
							</div>
						</div>
					:	null
					}
				</section>
			</section>
        );
    }
}