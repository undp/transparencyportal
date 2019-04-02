
/**************************** Preact files ******************************/
import { h, Component } from 'preact';
import style from './style';
import SunburstChart from '../../../components/sunburstChart';
import PreLoader from '../../preLoader';
import NoDataTemplate from '../../no-data-template';

export default class SdgLandingPage extends Component {

	handleOnClick = (e) => {
		if (e.size && e.size != 1) { }
	}
	onTargetClick = (e) => {
		if (e.name) {
			let targetIds = e.name.replace('Target', '').trim().split('.');
			window.location = '/sdg/targets/' + targetIds[0] + '/' + targetIds[1];
		}
	}
	onSDGClick = (e) => {
		if (e.parent.name.includes('SDG')) {
			window.location = '/sdg/' + e.parent.code + '/' + e.parent.fullName;
		}
	}

	constructor(props, context) {
		super(props, context);
	}

	componentWillMount() {
		this.props.fetchSdgSunburstData(this.props.currentYear);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.currentYear !== this.props.currentYear) {
			this.props.fetchSdgSunburstData(nextProps.currentYear);
		}
	}

	render(props) {
		return (
			<div class={style.profile_page_container}>
				<div class={style.wrapper}>
					<p class={style.SDGdisclaimer}>
						The Sustainable Development Goals
						(SDGs) are a universal call to action to end
						poverty, protect the planet and ensure
						that all people enjoy peace and
						prosperity.
						The SDGs continue to guide UNDP policy
						and funding until 2030. As the lead United
						Nations development agency, UNDP is
						uniquely placed to help implement the
						Goals through our work in some 170
						countries and territories.
					</p>
					{
						!this.props.sdgSunburstData.loading ?
							<div class={style.sunburstParent}>
								{this.props.sdgSunburstData.data.children && this.props.sdgSunburstData.data.children.length ?
									<div class={`${style.sunburstChartContainer} ${style.sunburstParent}`}>
										<SunburstChart chart_id="sdg_sunburst_chart"
											width={screen.width >= 650 ? 1600 : screen.width >= 550 ? 1200 : 1000}
											height={600}
											data={this.props.sdgSunburstData.data}
											handleOnClick={this.handleOnClick}
											onTargetClick={this.onTargetClick}
											onSDGClick={this.onSDGClick}
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
		);
	}
}