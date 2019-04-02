/* eslint-disable react/sort-comp */
/* eslint-disable keyword-spacing */
import { h, Component } from 'preact';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { Scrollbars } from 'react-custom-scrollbars';
import PreLoader from '../preLoader';
import style from './style';

export default class DropDown extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedValue: this.props.selectedValue || '',
			labelValue: this.props.selectedLabel || '',
			showSelect: false,
			dataList: this.props.options || [],
			filteredList: this.props.options || [],
			closeBtnActive: false,
			showSelectWidth: 0
		};
	}

	componentWillMount() {
		if (this.props.selectedValue !== '' && this.props.selectedValue !== undefined) {
			this.setState({
				closeBtnActive: true
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.options !== nextProps.options) {
			this.setState({
				dataList: nextProps.options,
				filteredList: nextProps.options
			});
		}
		if (nextProps.selectedValue !== this.props.selectedValue) {
			if (nextProps.selectedValue !== '' && nextProps.selectedValue !== undefined) {
				
				this.setState({
					closeBtnActive: true,
					labelValue: nextProps.selectedLabel
				});
			}
		}
	}
	openSelect() {
		this.setState({ showSelect: true });
	}

	_generateOptions(options, key) {
		if (options && options.length) {
			return options;
		}
	}
	handleChange(newValue) {
		this.setState({ closeBtnActive: true, labelValue: newValue.label, selectedValue: newValue.value, showSelect: false });
		this.props.handleClick && this.props.handleClick(newValue);
	}
	componentDidMount() {
		this.setState({
			showSelectWidth:this.dropDownWrapper.offsetWidth === 0 ? '100%' :this.dropDownWrapper.offsetWidth
		});
		document.addEventListener('mousedown', (e) => this.handleClickOutside(e));
		document.addEventListener('touchstart', (e) => this.handleClickOutside(e));
	}
	componentWillUnmount() {
		document.removeEventListener('mousedown', (e) => this.handleClickOutside(e));
		document.removeEventListener('touchstart', (e) => this.handleClickOutside(e));
	}

    // ---------------------------------- preserve false for droplists in Search Page ----------------------------------->>>

    handleClickOutside = (e) => {
    	if (this.state.showSelect && !this.filter.contains(e.target)) {
    		this.setState({ showSelect: false });
    	}
    }


    inputRenderer = (params) => {
    	return (
    		<div style={{ textAlign: 'center' }} >
    			<input class={style.searchBar} placeholder={"Search"} />
    		</div>
    	);
    }
    menuRenderer = (params) => {
    	// use default renderer in a hacky way
    	const menu = Select.defaultProps.menuRenderer(params);
    	return (
    		<div class={style.filterMenu}>
    			<Scrollbars
    				renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
    				{menu}
    			</Scrollbars>
    		</div>
    	);
    };

    renderList = (dataList) => {
    	return (
    		<div class={style.dropDownlistWrapper} style={{ width: this.dropDownWrapper.offsetWidth - 2 }}>

    			<div class={style.searchWrapper}>
    				<div style={{ width: this.dropDownWrapper.offsetWidth, textAlign: 'center' }} >
    					<input class={style.searchBar} style={{ width: this.dropDownWrapper.offsetWidth - 45 }} id="mysearch" type="search" placeholder={"Search"} onInput={(e) => { this.handleOnInputChange(e, this.state.dataList); }} />
    				</div>
    				{
    					this.props.loading?
    						<div class={style.preLoaderWrapper}><PreLoader /></div>
    					:	dataList && dataList.length !== 0 ? <div class={style.dropDownUl}>
    							<Scrollbars renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
    								<ul class={style.innerListWrapper}>
    									{this.generateInnerList(dataList)}
    								</ul>
    							</Scrollbars>
    						</div> : <div class={style.dropDownUl}>
    							<div class={style.noResultWrapper}><div>No Results</div></div>
    						</div>
    				}

    			</div>
    		</div>
    	);
    }

    handleClickClose = () => {
    	this.setState({
    		labelValue: '',
    		inputval: '',
    		selectedValue: '',
    		closeBtnActive: false
    	}, () => {
    		this.props.handleClick('');
    	});
    }

    returnSdgIcon = (data) => {
    	return  <img alt={`sdg No.${data.code}`} src={`/assets/icons/sdg-icons/sdg-small-${data.code}.png`} class={style.listItemIcon}  />;
    }
    generateInnerList = (dataList) => {
    	if (dataList && dataList.length)
    		return dataList.map((data) => {
    			return <li tabIndex="0" class={this.props.isCountry ? `${style.countryListItem}` : `${style.listItem}`} onkeyup={(e) => this.handleEnterSelect(e, data)} onClick={() => { this.handleChange(data); }}>
    				{
    					this.props.listIcons &&
                        this.returnSdgIcon(data)
					}
					{this.props.isCountry ? 
						<img src={this.props.baseURL+'/media/flag_icons/' + data.level_3_code+'.svg'} onError={(e)=>{ e.target.src = '/assets/images/Empty.svg'}} class={style.flagIcon}/>
						:
						null
					}
					<span class={style.listItemValue}>{data.label}</span>
    			</li>;
    		});
    }

    handleEnterSelect(event, data) {
    	if (event.keyCode == "13")
    		this.handleChange(data);
    }

    handleOnInputChange = (e, dataList) => {
    	if (e.target.value === '') {
    		this.setState({
    			filteredList: this.state.dataList
    		});
    	}
    	else {
    		let currentText = e.target.value.toUpperCase();
    		let filteredData = dataList.filter((item) => {
    			return (item.label.toUpperCase().indexOf(currentText) !== -1);
    		});
    		this.setState({
    			filteredList: filteredData
    		});
    	}
    }


    // ------------ preserve false for droplists in Search Page ----- No Close Btn Needed------------>>>
    renderIcon = () => {
    	if (this.state.closeBtnActive) {
    		if (this.props.preserve && this.props.preserve == 'false') {
    			return (
    				<div class={style.updownArrow}></div>
    			);
    		}
    		else {
    			return (
    				<div onClick={() => { this.handleClickClose(); }} class={style.closetab}></div>
    			);
    		}
    	} else {

    		return (
    			<div class={style.updownArrow}></div>
    		);

    	}
    }


    render({ label, placeHolder, filterClass, dropDownClass, list, labelStyle, options }, state) {
    	placeHolder = placeHolder ? placeHolder : 'select';
		const displayLabel = this.state.labelValue === '' ? placeHolder : this.state.labelValue;
		
		return (
    		<div class={!this.props.newclass ? `${style.filters} ${filterClass}`:`${style.filters2} ${filterClass} ${this.props.filters2}`}>
    			<span class={this.props.marker ? `${style.labelStyle} ${labelStyle}  ${style.markerTypeLabel}` : `${style.labelStyle} ${labelStyle}`} style={labelStyle}>{label}</span>
    			<div class={`${style.dropDownOuterWrapper} ${this.props.l2dropDownOuterWrapper}`} ref={node => this.filter = node} >
    				<div class={this.state.showSelect ? style.dropdownOverlay : null} style={{ width: screen.width < 771 ? '100%': this.state.showSelectWidth }} />
    				<div ref={node => this.dropDownWrapper = node} onClick={() => this.openSelect()} class={!this.props.marker ? this.props.sscDropdown ? `${style.sscDropdown}` : `${style.dropDownWrapper} ${dropDownClass}` : `${style.markerTypeDropDown}`} >

    					<span class={this.props.label === 'Document Category' ? style.documentItem : style.dropDownItem}>
    						{
    							this.props.preserve && this.props.preserve === 'false' ? placeHolder : displayLabel
    						}
    					</span>
    					{
    						this.renderIcon()
    					}

    				</div>
    				{
    					this.state.showSelect ? this.renderList(this.state.filteredList) : null
    				}

    			</div>
    		</div>
    	);
    }

}
