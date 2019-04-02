import { h, Component } from 'preact';
import style from './style';

export default class SelectItem extends Component {
    constructor(props){
        super(props);
         this.state={
            checked:false
         }
    }
    render(props,state) {
        return (
            <div class={style.list}>
            <input type="checkbox" />
            <label for={item.label}>{item.label}</label>
        </div>
        )
    }
}
