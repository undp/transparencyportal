/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import { route } from 'preact-router';

/************************* Custom Component Files ************************/
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import CommonHeader from '../../components/commonHeader';
import ProjectFilter from '../../components/projectFilter';
import PreLoader from '../../components/preLoader';
import NoDataTemplate from '../../components/no-data-template';
import Footer from '../../components/footer';

/**********************  Third party libraries x**********************/
import Helmet from 'preact-helmet';

/************************* Redux Action Files ************************/
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { searchAllResults } from '../../shared/actions/searchActions.js';
import { updateYearList } from '../../shared/actions/getYearList.js';
import { updateSearchText } from '../../shared/actions/searchActions';
import PaginationPanelSearch from '../../components/paginationPanelSearch';
import { fetchOperatingUnitsListData } from '../../shared/actions/commonDataActions';
import { updateFilters } from '../../shared/actions/commonDataActions';
import { fetchProjectDetailsOnSelection } from '../../shared/actions/projectDetailActions';
import { clearSearchCountryField, searchResult, searchOperatingUnitsListData } from '../../components/nestedDropList/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';
/************************* Style Files ************************/
import style from './style';

class SearchResults extends Component {
	setPageHeader() {
		const title = 'Search Results';
		this.props.onChangeRoute(title);
		this.props.setPageHeader({
			title,
			breadcrumb: [
				{
					id: 1,
					title: 'Home',
					link: '/'
				}, {
					id: 2,
					title
				}
			]
		});
	}

	onChangePageSize = (size) => {
		this.searchFilterChange('pageSize', size);
	}

	onChangePageIndex = (index) => {
		this.searchFilterChange('pageIndex', index);
	}

	removeItemFromFilter = (item) => {
		let array = [...this.state.filterArray];
		let newFilterArray = array.filter((data) => {
			if (data.selectedGenre === item.selectedGenre && data.selectedValue === item.selectedValue) {
				return false;
			}
			else {
				return true;
			}
		});

		let shortenedArray = this.state.filterObj[item.selectedGenre].filter((data) => data.value !== item.selectedValue);
		this.setState({
			filterArray: newFilterArray,
			filterObj: {
				...this.state.filterObj,
				[item.selectedGenre]: shortenedArray,
				pageIndex: 1
			}
		}, () => {
			this.props.searchAllResults(this.state.filterObj);
		});
	}

	createFilterArray = (type, value) => [...this.state.filterArray, {
		selectedGenre: type,
		selectedLabel: value.label,
		selectedValue: value.value
	}]


	filterDuplication = (type, value) => {
		let flag = true;
		if (this.state.filterObj[type].length !== 0) {
			this.state.filterObj[type].forEach((item, index) => {
				if (item.value === value.value) {
					flag = false;
				}
			});
		}
		return flag;
	}

	updateFilter = (type, value) => {
		if (type !== 'search' && type !== 'pageIndex' && type !== 'pageSize') {
			if (this.filterDuplication(type, value)) {
				let newArray = this.createFilterArray(type, value);
				if (value !== '') {
					this.setState({
						filterArray: newArray,
						filterObj: {
							...this.state.filterObj,
							[type]: value === null || value === undefined ? [...this.state.filterObj[type]] : [value, ...this.state.filterObj[type]],
							pageIndex: 1
						}
					}, () => {
						this.props.searchAllResults(this.state.filterObj);
					});
				}
			}
		}
		else if (type === 'pageIndex') {
			this.setState({
				filterObj: {
					...this.state.filterObj,
					[type]: value === null || value === undefined ? '' : value
				}
			}, () => {
				this.props.searchAllResults(this.state.filterObj);
			});
		}
		else {
			this.setState({
				filterObj: {
					...this.state.filterObj,
					[type]: value === null || value === undefined ? '' : value,
					pageIndex: 1
				}
			}, () => {
				this.props.searchAllResults(this.state.filterObj);
			});
		}
	}

	generateText = () => {
		let pageIndex = this.state.filterObj.pageIndex,
			pageSize = this.state.filterObj.pageSize,
			totalCount = this.props.searchAllResult.totalCount,
			startIndex = 0,
			endIndex = 0;

		if (totalCount > 0) {
			startIndex = (pageIndex - 1) * pageSize + 1;
			endIndex = totalCount < pageSize * pageIndex ? totalCount : pageSize * pageIndex;

		}
		return {
			startIndex,
			endIndex
		};
	}

	searchFilterChange = (type, value) => {
		this.updateFilter(type, value);
	}

	onClickTitle = (element) => {
		let url = '/projects/' + element.project_id;
		route(url);
		this.props.fetchProjectDetailsOnSelection(element.project_id);
	}

	createMarkup(data) {
		return { __html: data };
	}

	constructor(props) {
		super(props);
		this.state = {
			filterObj: {
				country: [],
				themes: [],
				sources: [],
				sdgs: [],
				search: this.props.searchAllResult.searchText,
				year: [],
				pageIndex: 1,
				pageSize: 10

			},
			filterArray: []
		};
	}

	componentWillMount() {
		this.props.updateYearList();
		this.props.searchAllResults(this.state.filterObj);
		this.props.clearSearchCountryField();
		this.props.searchOperatingUnitsListData(null, null, '');
		this.props.updateFilters(undefined,undefined,undefined,undefined,undefined,1);
	}

	componentDidMount = () => {
		window.scrollTo(0, 0);
		this.setPageHeader();
	}
	componentWillUnmount() {
		this.props.updateSearchText('');
		this.props.clearSearchCountryField();
	}


	render({ router, searchAllResult }, state) {
		const { startIndex, endIndex } = this.generateText(),
			title = 'Search Results | UNDP Transparency Portal',
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
				<CommonHeader title="Search Results"
					searchAllResult={this.props.searchAllResult}
					updateSearchText={this.props.updateSearchText}
					page={'search'}
					enableBanner
					searchFilterChange={(type, value) => this.searchFilterChange(type, value)}
				/>
				<div class={style.breadCrumbWrapper}>
					<UrlBreadCrumb routeArray={router.routeArray} />
				</div>
				{
					searchAllResult.loading && <PreLoader />
				}
				<div class={style.searchContainer}>
					<ProjectFilter
						cascadedFocusFilter={true}
						updateSearchText={this.props.updateSearchText}
						searchAllResult={this.props.searchAllResult}
						removeItemFromFilter={this.removeItemFromFilter}
						searchResult
						filterElements={this.state.filterArray}
						searchFilterChange={(type, value) => this.searchFilterChange(type, value)}
						clearFilters={(type) => this.clearFilters(type)} />
				</div>
				<div class={style.filterSection}>
					<span class={style.filterText}>Showing {startIndex} - {endIndex} Results of {this.props.searchAllResult.totalCount}</span>
				</div>
				<section class={style.contentWrapper}>
					<ul>
						{searchAllResult.data && searchAllResult.data.length !== 0 ?
							searchAllResult.data.map((el, index) => (
								<li>
									<h4 class={style.searchItemTitle}><a href={'/projects/' + el.project_id}>{el.title}</a></h4>
									<span dangerouslySetInnerHTML={this.createMarkup(el.description)} />
								</li>
							))
							:
							<NoDataTemplate />
						}
					</ul>
				</section>
				<div class={style.filterSection}>
					<PaginationPanelSearch
						onChangePageSize={this.onChangePageSize}
						onChangePageIndex={this.onChangePageIndex}
						searchFilterChange={this.searchFilterChange}
						pageIndex={this.state.filterObj.pageIndex}
						pageSize={this.state.filterObj.pageSize}
						pageCount={this.props.searchAllResult.totalCount}
					/>
				</div>
				<div />
				<Footer />
			</div>

		);
	}
}

const mapStateToProps = (state) => ({
	router: state.router,
	searchAllResult: state.searchAllResult,
	yearList: state.yearList,
	sdgData: state.sdgData,
	mapData: state.mapData

});

const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data)),
	searchAllResults: data => dispatch(searchAllResults(data)),
	updateYearList: data => dispatch(updateYearList(data)),
	updateSearchText: data => dispatch(updateSearchText(data)),
	fetchProjectDetailsOnSelection: data => dispatch(fetchProjectDetailsOnSelection(data)),
	fetchOperatingUnitsListData: data => dispatch(fetchOperatingUnitsListData(data)),
	clearSearchCountryField: () => dispatch(clearSearchCountryField()),
	searchResult: (searchParam, key) => dispatch(searchResult(searchParam, key)),
	updateFilters: (unit, theme, sdg, donor, year,appendOthers) => dispatch(updateFilters(unit, theme, sdg, donor, year,appendOthers)),
	searchOperatingUnitsListData: (searchParam, key, year) => dispatch(searchOperatingUnitsListData(searchParam, key, year))


});

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
