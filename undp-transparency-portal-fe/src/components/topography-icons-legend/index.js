import { h, Component } from 'preact';
import style from './style';

export default class TopographyIconsLegend extends Component {
    render() {
        return (
            <div class={`${style.legend_container} ${this.props.containerStyle}`}>
                <ul class={`${this.props.projectTopoIconsLegend} ${style.topoIconsLegend} `} ref={(node) => this.topoLegend = node}>
                    <li>
                        <img src="../../../assets/icons/Administrative_Region.svg" alt="info icon"/>
                        <span>Administrative Region</span>
                    </li>
                    <li>
                        <img src="../../../assets/icons/Populated_Place.svg" alt="info icon"/>
                        <span>Populated Place</span>
                    </li>
                    <li>
                        <img src="../../../assets/icons/Structure.svg" alt="info icon" />
                        <span>Structure</span>
                    </li>
                    <li>
                        <img src="../../../assets/icons/Other_Topographical.svg" alt="info icon"/>
                        <span>Other Topographical Feature</span>
                    </li>
                </ul>
            </div>

        );
    }
}