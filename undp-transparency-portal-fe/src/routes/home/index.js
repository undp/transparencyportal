/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/********************** Custom Components **********************/
import HomeHeader from '../../components/homeHeader';
import ArticleItem from '../../components/articleItem';
import Tabs from '../../components/TabSection';
import Sankey from '../../components/sankey';
import MakeImpact from '../../components/makeImpact';
import Footer from '../../components/footer';

/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/********************** Redux Action Files *********************/
import { updateSearchText } from '../../shared/actions/searchActions';
import { clearSearchCountryField,
	 searchResult,
	  searchOperatingUnitsListData,
	  upDateBudgetSourceField
	} from '../../components/nestedDropList/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';

/************************ Style files  *************************/
import style from './style';
class Home extends Component {
	getSankeyYear = (year) => {
		this.setState({ sankeyYear: year });
	}

	getBugetType = (type) => {
		const bugetType = type ? 'budget' : 'expense';
		this.setState({ bugetType });
	}

	constructor(props) {
		super(props);
		this.state = {
			sankeyYear: this.props.yearList.list[0],
			bugetType: 'budget'
		};
	}

	componentWillMount() {
		this.props.clearSearchCountryField();
		this.props.searchOperatingUnitsListData();
	}

	componentDidMount() {
		this.props.onChangeRoute('UNDP Transparency Portal');
		window.scrollTo(0, 0);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.mapData.yearTimeline.mapCurrentYear !== this.props.mapData.yearTimeline.mapCurrentYear) {
			this.props.searchOperatingUnitsListData();
		}
	}

	componentWillUnmount() {
		this.props.clearSearchCountryField();
	}

	render(props,{ sankeyYear,  bugetType }) {
		const title = 'UNDP Transparency Portal',
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
		return (
			<div>
				<Helmet title={title}
					meta={[
						{ name: 'description', content: description },
						{ property: 'og:title', content: title },
						{ property: 'og:description', content: description },
						{ property: 'twitter:title', content: title },
						{ property: 'twitter:description', content: description }
					]}
				/>
				<HomeHeader active="profile"
					updateSearchText={this.props.updateSearchText}
					searchAllResult={this.props.searchAllResult}
				/>
				<div class={style.wrapper}>
					<ArticleItem title={'Explore'}
						description={'Learn more about where and how UNDP is making a difference around the globe. Search by location, donor country, our focus, signature solution or Sustainable Development Goal.'}
					/>
					<Tabs
						sankeyYear={sankeyYear}
						bugetType={bugetType}
					/>
				</div>
				<div class={style.financial_flow}>
					<ArticleItem title={'Financial Flow'}
						description={'Find out where UNDP’s resources come from, where they go and how they are changing people’s lives.'}
					/>
					<Sankey
						getSankeyYear={this.getSankeyYear}
						getBugetType={this.getBugetType}
					/>
				</div>
				<div class={style.makeImpact}>
					<MakeImpact />
				</div>
				<Footer />
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	searchAllResult: state.searchAllResult,
	mapData: state.mapData,
	yearList: state.yearList
});

const mapDispatchToProps = (dispatch) => ({
	updateSearchText: data => dispatch(updateSearchText(data)),
	searchOperatingUnitsListData: (searchParam, key) => dispatch(searchOperatingUnitsListData(searchParam, key)),
	clearSearchCountryField: () => dispatch(clearSearchCountryField()),
	searchResult: (searchParam, key) => dispatch(searchResult(searchParam, key)),
	onChangeRoute: (title) => dispatch(onChangeRoute(title))
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);