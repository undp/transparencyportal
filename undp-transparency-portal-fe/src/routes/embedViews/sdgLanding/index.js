import { h, Component } from 'preact';
import { connect } from 'preact-redux';         // Themes Top Budget Sources, Top Recipient Offices

import { fetchSdgSunburstData } from '../../../components/sdgLandingPage/actions';
import PreLoader from '../../../components/preLoader';
import SunburstChart from '../../../components/sunburstChart';
import style from './style';


class EmbedSdgLandingView extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }


    componentWillMount() {
        this.props.fetchSdgSunburstData(this.props.currentYear)
    }

    componentWillReceiveProps(nextProps) {
    }
    handleOnClick = (e) => {
		if (e.size && e.size != 1) { }
	}
	onTargetClick = (e) => {
		if (e.name) {
			let targetIds = e.name.replace('Target', '').trim().split('.');
            window.open('/sdg/targets/' + targetIds[0] + '/' + targetIds[1], '_blank');
		}
	}
	onSDGClick = (e) => {
		if (e.parent.name.includes('SDG')) {
            window.open('/sdg/' + e.parent.code + '/' + e.parent.fullName, '_blank');
		}
	}
    render(props, {}) {
        return (
            <div>
               {
                   (this.props.title !== 'false') ?
                   <div class={style.titleWrapper}>
                        Sustainable Development Goals
                    </div>
                    :null
               }
                {
                    (this.props.summary !== 'false') ?
                    <div>
                        <span class={style.SDGdisclaimer}>
                            The Sustainable Development Goals (SDGs) are a universal call to action to end poverty, protect the planet and ensure that all people enjoy peace and prosperity. The SDGs continue to guide UNDP policy and funding until 2030. As the lead United Nations development agency, UNDP is uniquely placed to help implement the Goals through our work in some 170 countries and territories.
                        </span>
				    </div>
                    :null
                }
					{
						!this.props.sdgSunburstData.loading ?
						<div class={style.sunburstChartContainer}>
							<SunburstChart
							chart_id="sdg_sunburst_chart_embed"
							width={1250}
                            height={600}
                            embed={'true'}
							backButtonTop={style.backButtonTop}
                            data={this.props.sdgSunburstData.data}
                            handleOnClick={this.handleOnClick}
                            onTargetClick={this.onTargetClick}
                            onSDGClick={this.onSDGClick}
							/>
						</div>
						:
						<div style={{ position: 'relative', height: 344 }}>
							<PreLoader /> 
						</div>
					}
                </div>
        )
    }
}


const mapStateToProps = (state) => {
    const sdgSunburstData = state.sdgSunburstData,
        currentYear = state.yearList.currentYear;
		
	return {
        sdgSunburstData,
        currentYear
	};
};
const mapDispatchToProps = (dispatch) => ({
    fetchSdgSunburstData: (year) => dispatch(fetchSdgSunburstData(year))
});


export default connect(mapStateToProps, mapDispatchToProps)(EmbedSdgLandingView);
