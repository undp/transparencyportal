import { h, Component } from 'preact';
import style from './style';
import { connect } from "preact-redux";
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/minimal-example.css';
import { Scrollbars } from 'react-custom-scrollbars';

import { filterText } from './constant'
class CascadedSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSelect: false,
            showSelectWidth: 0,
            themeIndex: '',
            themeName: ''
        };
    }

    componentDidMount() {
        this.setState({
            showSelectWidth: this.dropDownWrapper.offsetWidth
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

    openSelect() {
        this.setState({ showSelect: true,
                        themeIndex: '',
                        themeName: '' });
    }

    selectSector = (data) => {
        this.setState({
            showSelect: false
        })
        this.props.sectorFilter({ ...data, ...{ value: data.code, label: data.sector } })
    }

    renderList = () => {
        const data = this.state.themeIndex !== '' ? this.props.sectorList.data.sector[this.state.themeName]:[],
            midPoint = this.state.themeIndex !== ''?Math.ceil(data.length/2): 0,
            leftArray = this.state.themeIndex !== '' ? ((midPoint >= 3 )? data.slice(0,midPoint) :data):[],
            rightArray = this.state.themeIndex !== '' ? ((midPoint >= 3 )? data.slice(midPoint) :[]):[];
        return (
            <div class={style.dropDownlistWrapper}
                style={{ width: this.dropDownWrapper.offsetWidth - 2 }}>
                <div>
                    <div class={style.dropDownUl}>
                        <Scrollbars
                            renderTrackHorizontal={props =>
                                <div {...props} className="track-horizontal" />}>
                            <Accordion>
                                {this.generateSectorList()}
                            </Accordion>
                        </Scrollbars>
                    </div>
                    {
                    this.state.themeIndex !== '' && screen.width > 769?
                        <section class={style.accordionBody}>
                            <Scrollbars
                                renderTrackHorizontal={props =><div {...props} className="track-horizontal" />}>
                                { 
                                <section style={{ display: 'flex' }} class={style.accordionItemList}>
                                    <section>
                                    {
                                    leftArray.map((data, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className={style.sector_wrapper}
                                                onClick={() => this.selectSector(data)}>
                                                <span className={style.sector_text}>{data.sector}</span>
                                            </div>
                                            );
                                        })
                                    }
                                    </section>
                                    <section>
                                    {
                                    rightArray.map((data, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className={style.sector_wrapper}
                                                onClick={() => this.selectSector(data)}>
                                                <span className={style.sector_text}>{data.sector}</span>
                                            </div>
                                        );
                                    })
                                    }
                                    </section>
                                </section>
                                }
                            </Scrollbars>
                            
                        </section>
                    :   null
                    }
                </div>
            </div>
        )
    }
    onThemeSelect = (keyIndex,keyName) => {
        this.setState(prevState => ({
            themeIndex: prevState.themeIndex === keyIndex ? '' : keyIndex,
            themeName: prevState.themeName === keyName ? '' : keyName
        }));
    }
    generateSectorList = () => {
        const sectors = this.props.sectorList.data.sector;
        const { themeIndex } = this.state;
        return Object.keys(sectors).map((keyName, keyIndex) => {
            return (
                <AccordionItem key={keyIndex} onClick={() => this.onThemeSelect(keyIndex,keyName)}>
                    <AccordionItemTitle className={themeIndex === keyIndex ? `${style.accordion__title} ${style.item__active}` :style.accordion__title}>
                        <h3 className={style.item__title}>
                            <span className={style.sectorName}>{filterText[keyName].key}</span>
                            <div className={themeIndex === keyIndex ?
                                style.accordion__arrow__up : style.accordion__arrow__down}></div>
                        </h3>
                        <div className={style.item__description}>{filterText[keyName].description}</div>

                    </AccordionItemTitle>
                   {
                       screen.width <= 769 ?
                       <AccordionItemBody className={style.accordion__body}>
                            {   sectors[keyName].map((data, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={style.sector_wrapper}
                                        onClick={() => this.selectSector(data)}>
                                        <span className={style.sector_text}> {data.sector} </span>
                                    </div>
                                );
                            })}
                        </AccordionItemBody>
                        :null
                   }
                </AccordionItem>
            )
        })
    };

    render() {
        const { label, placeHolder, filterClass, labelStyle } = this.props
        return (
            <div class={`${style.filters} ${filterClass}`}>
                <span class={`${style.labelStyle} ${labelStyle}`}
                    style={labelStyle}>{label}</span>
                <div class={style.dropDownOuterWrapper}
                    ref={node => this.filter = node}>
                    <div class={this.state.showSelect ?
                        style.dropdownOverlay : null}
                        style={{ width: this.state.showSelectWidth }}></div>
                    <div ref={node => this.dropDownWrapper = node}
                        onClick={() => this.openSelect()}
                        class={`${style.dropDownWrapper}`} >
                        <span class={style.dropDownItem}>
                            {placeHolder}
                        </span>
                        <div class={style.updownArrow}></div>
                    </div>
                    {this.state.showSelect ? this.renderList() : null}
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => {
    const sectorList = state.sectorListData;
    return {
        sectorList
    };
};


export default connect(mapStateToProps)(CascadedSelect);