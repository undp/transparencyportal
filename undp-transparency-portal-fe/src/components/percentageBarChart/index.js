import { h, Component } from 'preact';
import BarElement from './barElement';
import style from './style';
export default class PercentageBarChart extends Component {
    constructor(props) {
        super(props);
    }


    generateList = (data) => {
        return data.map((item) => {
            return (
                <BarElement data={item} />
            )
        })
    }


    render({ data }, state) {
        return (
            <div class={style.container}>
                {
                    this.generateList(data)
                }
            </div>
        )
    }
}