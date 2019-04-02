import { h, Component } from 'preact';
import style from './style';

export default class BreadCrumb extends Component {
    render() {
        return(
                <span class={style.buttonsWrapper}>
                    <div class={style.dropDownWrapper}>
                        <span>2017</span>
                        <ul></ul>
                    </div>
                    <span class={style.buttons}>Embed</span>
                </span>
        );
    }
}
