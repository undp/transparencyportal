import { h, Component } from "preact";
import style from "./style";
import { connect } from "preact-redux";
import commonConstants from '../../utils/constants';
import {
	updateYearList,
	setCurrentYear
} from "../../shared/actions/getYearList";
import { setMapCurrentYear } from "../../shared/actions/mapActions";
import { filterArrayByStartYear } from '../../utils/commonActionUtils'

class EmbedSection extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pageSize: this.props.endYear ? Math.min(this.props.endYear,this.props.year[0]): this.props.year[0],
			modalState: false
		};
	}

	handleEnterSelect(event, data) {
		if (event.keyCode == "13")
			this.handleModalClick(data)
	}


	generatePaginationList = paginationProps => {
		return paginationProps.components.pageList;
	};

	generatePageSizeList = paginationProps => {
		let yearList = !this.props.startYear ?  this.props.yearList.list : filterArrayByStartYear(this.props.yearList.list,this.props.startYear,this.props.endYear)

		return yearList.map((data, index) => {
			return (
				<li  
					tabIndex="0"
					onkeyup={(e) => this.handleEnterSelect(e, data)}
					onClick={() => {
						this.handleModalClick(data);
					}}
				>
					<span>{data}</span>
				</li>
			);
		});
	};

	switchModalState = () => {
		this.setState(prevState => ({
			modalState: !prevState.modalState
		}));
	};

	handleModalClick = year => {
		this.setState({ pageSize: year, modalState: false });
		this.props.setCurrentYear(year);
		this.props.setMapCurrentYear(year);
	};

	handleClickOutside = e => {
		if (this.node && this.node.contains(e.target)) {
			return;
		}
		if (this.state.modalState && !this.dropDown.contains(e.target)) {
			this.switchModalState();
		}
	};
	
	componentWillMount() {
		this.props.updateYearList(this.props.endYear? Math.min(this.props.endYear,this.props.year[0]):undefined);
	}

	componentDidMount() {
		!this.props.disableDropdown &&
			window.addEventListener("mousedown", this.handleClickOutside);
		window.addEventListener("touchstart", this.handleClickOutside);
		window.addEventListener("resize", this.updateWindowDimensions);
	}

	componentWillReceiveProps(nextProps){
		nextProps.currentYear && this.props.currentYear !== nextProps.currentYear ? this.setState({ pageSize: nextProps.currentYear, modalState: false }) : null;
	}

	componentWillUnmount() {
		window.removeEventListener("mousedown", this.handleClickOutside);
		window.removeEventListener("touchstart", this.handleClickOutside);
		window.removeEventListener("resize", this.updateWindowDimensions);
	}

	updateWindowDimensions = () => {
		this.setState({ width: window.innerWidth, height: window.innerHeight });
	};
	render({ paginationProps }, { pageSize, modalState },) {
		return (
			<div class={this.props.marker ? (this.props.marker === 'embed&export' ?style.markerButtonsWrapper : style.markerYearFilter): (this.props.ssc?style.sscButtonsWrapper:style.buttonsWrapper)}>
				{!this.props.disableDropdown ? (
					<div
						class={style.yearWrapper}
						ref={node => {
							this.node = node;
						}}
					>
						<div
							className={style.dropDownWrapper}
							onClick={this.switchModalState}
						>
							<span id={style.pageSize}>{pageSize}</span>
						</div>
						{modalState ? (
							<div
								className={style.pageSizeModal}
								ref={node => (this.dropDown = node)}
							>
								<ul>{this.generatePageSizeList(paginationProps)}</ul>
							</div>
						) : null}
					</div>
				) : null}
				{
					!this.props.disableEmbedExport ?
						<span>
							{
								this.props.hideExport === 'true'? 
									null
									:
									<span class={style.buttons} onClick={() => this.props.showExportModal && this.props.showExportModal()}>
										<b>Export</b>
									</span>
							}
							{
								this.props.hideEmbed === 'true'?
									null
									:
									<span onClick={() => { this.props.onClickEmbed ? this.props.onClickEmbed() : null}} class={style.buttons}>
										<b>Embed</b>
									</span>
							}
						</span>
						:   null
				}
			</div>
		);
	}
}
const mapStateToProps = state => {
	let yearList = state.yearList;
	if(state.tabData.tabSelected === 'signature' || state.breadCrumb.title === 'Signature Solutions'){
		var tempArray = _.map(state.yearList.list, function(o) {
			if (o >= commonConstants.SIGNATURE_SOLUTION_YEAR) return o;
		});
		yearList.list = _.without(tempArray, undefined);
	}
	const { year } = state.projectTimeline;
	return {
		yearList,
		year
	};
};
const mapDispatchToProps = dispatch => {
	return {
		updateYearList: (year) => dispatch(updateYearList(year)),
		setCurrentYear: year => dispatch(setCurrentYear(year)),
		setMapCurrentYear: year => dispatch(setMapCurrentYear(year))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(EmbedSection);
