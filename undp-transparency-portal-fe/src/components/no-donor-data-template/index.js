import { h, Component } from 'preact';

import style from './style';
export default class NoDonorDataTemplate extends Component {
    render() {
        let  renderItem = 'No data available';
        if (this.props.text) {
            renderItem = this.props.text
        }
        else if (this.props.children) {
            renderItem = this.props.children;
        }

        return (
            <section class={style.template_wrapper}>
                <img class={style.no_data_img} src="../../assets/icons/no-data.svg" alt=
                "no-donor-data"/>
                <div class={style.no_data_text}>{renderItem}</div>
            </section>
        );
    }
}
