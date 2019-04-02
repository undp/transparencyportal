import { h, Component } from 'preact';
import style from './style';

export default class TabCollection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabSelected: props.selected != undefined || props.list[0]
        }
    }
    componentWillReceiveProps(nextProps) {
        nextProps.selected != this.props.tabSelected && this.setState({ tabSelected: nextProps.selected })
    }
    handleClick = (item) => {
        this.setState({ tabSelected: item })
        this.props.tabChange(item)
    }
    render({ list, listClass, elementClass, childClass }, { tabSelected }) {

        return (
            <ul class={`${style.list} ${listClass}`}>
                {
                    list.map((item, index) => (
                        <li class={`${style.listElement} ${elementClass}`}>
                            <span class={`${tabSelected == item && style.active} ${childClass}`} onClick={(e) => this.handleClick(item)}>{item}</span>
                        </li>
                    ))
                }
            </ul>
        )
    }
}

