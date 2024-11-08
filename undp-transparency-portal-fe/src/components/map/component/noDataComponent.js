import { h, Component } from 'preact';

import style from './style';
export default class MapNoDataTemplate extends Component {
    render() {
        return (
            <section class={style.template_container}>
                <div class={style.template_wrapper}>
                    <img class={style.no_data_img} src="/assets/icons/no-data.svg" alt=
                        "no-data" />
                    <div class={style.no_data_text}>{'No Map available.'}</div>
                </div>
            </section>
        );
    }
}
