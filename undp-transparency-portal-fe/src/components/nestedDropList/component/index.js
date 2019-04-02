import { h, Component } from 'preact';
import style from './style';
import AccordionIcon from '../../../assets/icons/accordion-arrow.png';
import PlusIcon from '../../../assets/icons/plus.png'
import MinusIcon from '../../../assets/icons/substract.png'
import {getAPIBaseUrRl} from '../../../utils/commonMethods'

export default class Accordion extends Component {
    constructor(props) {
        super(props);
        this.baseURL = getAPIBaseUrRl();
        this.state = {
            accrdnState: true
        }
    }
    generateInnerList = (dataList) => {
        if(this.props.donor ) {
            return dataList.map((data) => {

                let flagURL = data.donor_lvl !=='OTH' ? this.baseURL+'/media/flag_icons/' + data.level_3_code+'.svg' : '/assets/images/Empty.svg' ;
                return <li tabIndex="0" class={`${style.listItemCountry}`} onkeyup={(e)=>this.handleEnterSelect(e, data)} onClick={() => { this.handleInnerItemCLick(data) }}>
                     <img src={flagURL} onError={(e)=>{ e.target.src = '/assets/images/Empty.svg'}} class={style.flagIcon}/>
                     <span class={style.country_name}>{data.name}</span>
                </li>
            })
        } else {
            return dataList.map((data) => {
                // let flagURL = this.props.baseURL+'/media/flag_icons/'+data.code+'.svg';
                let flagURL =  data.donor_lvl !=='OTH' ? this.baseURL+'/media/flag_icons/' + data.level_3_code+'.svg' : '/assets/images/Empty.svg' ;
                return <li tabIndex="0" class={`${style.listItemCountry}`} onkeyup={(e)=>this.handleEnterSelect(e, data)} onClick={() => { this.handleInnerItemCLick(data) }}>
                     <img src={flagURL} onError={(e)=>{ e.target.src = '/assets/images/Empty.svg'}} class={style.flagIcon}/>
                     <span class={style.country_name}>{data.name}</span>
                </li>
            })
        }
       
    }

    handleEnterSelect(event, data) {
        if(event.keyCode=="13")
            this.handleInnerItemCLick(data)
    }

    handleInnerItemCLick = (data) => {
        this.props.handleChange(data)
    }


    renderClickOnCondition = (data) => {

        let innerList = data.organisations ? data.organisations : data.countries
        return (data.type === '1' && (data.organisations.length !== 0) || data.countries.length) ?
            <div class={this.state.accrdnState ? `${style.outerItem}` : `${style.outerItem} ${style.outerItemHover}`} >

                <div tabIndex="0" onkeyup={(e)=>this.handleEnterSelect(e, data)} onClick={() => this.handleInnerItemCLick(data)} class={style.labelWrapper}>{data.name}</div>
                <div onClick={() => this.handleOuterItemClick()} class={style.imageWrapper}>
                </div>
                {
                    this.state.accrdnState && data.type === '1' ?
                        <ul class={style.innerListWrapper}>
                            {this.generateInnerList(innerList)}
                        </ul> : null
                }
                {
                    data.countries ?
                     <ul class={style.innerListWrapper}>
                        {this.generateInnerList(innerList)}
                    </ul> :null
            }
            </div>
            :

            <div class={this.state.accrdnState ? `${style.outerItem}` : `${style.outerItem} ${style.outerItemHover}`} >
                <div onClick={() => this.handleInnerItemCLick(data)} class={style.labelWrapper}>{data.name}</div>
            </div>

    }

    render({ data }, { accrdnState }) {
        return (
            this.renderClickOnCondition(data)
        )
    }
}




