import { h, Component } from 'preact';
import BarElement from './barElement';
import style from './style';
export default class StackedBarChart2 extends Component {
    constructor(props) {
        super(props);
    }


    generateList = (data) => {
        return data.map((item) => {
            return (
                <BarElement data={item} donors={this.props.donors}/>
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