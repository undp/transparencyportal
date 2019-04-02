import { h, Component } from 'preact';
import style from './style';
export default class Modal extends Component {

    constructor(props) {
        super(props);
    }



    render({ onCloseModal, visible }, state) {
        return (
            visible ?
                <div class={style.modal}>

                    {this.props.children}

                </div> :
                null
        )
    }

}