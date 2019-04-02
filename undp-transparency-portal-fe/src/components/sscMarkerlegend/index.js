import { h, Component } from 'preact';
import style from './style';
import DonorDonutChartLegend from '../donor-donut-chart-legend';

export default class SscMarkerlegend extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }
    componentWillReceiveProps(nextProps) {
        
    }

    componentDidMount() {
        
    }
    onSelectMarkerType = (type) => {
        this.props.onSelectMarkerType(type);
    }
    render(props) {
        
        return (
            <div class={style.legend_container}>
                <span onClick={() => this.onSelectMarkerType(2)} class={style.legend_item}>
                    <span class={style.capacity_legend_block} />
                    <span class={`${style.legend_text} ${style.capacity_text}`}>Capacity builder</span>
                </span>
                <span onClick={() => this.onSelectMarkerType(1)} class={style.legend_item}>
                    <span class={style.knowledge_legend_block} />
                    <span class={`${style.legend_text} ${style.knowledge_text}`}>Knowledge broker</span>
                </span>
                <span onClick={() => this.onSelectMarkerType(3)} class={style.legend_item}>
                    <span class={style.partnership_legend_block} />
                    <span class={`${style.legend_text} ${style.partnership_text}`}>Partnership facilitator</span>
                </span>
            </div>
        )
    }
}