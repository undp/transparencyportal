import { h, Component } from 'preact';
import List from '../../components/listView';
import SdgBarChartItem from '../../components/sdgBarChartItem';
import style from './style';

export default class SDGBarChart extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    }
  }
  componentWillReceiveProps(nextProps) {

  }

  renderRow = (item, index) => {
    return (
      <SdgBarChartItem
        data={item.item}
        index={index}
      />
    )

  }

  render() {
    let href = 'sdg/'+this.props.id+'/'+this.props.title;
    return (
      <div class={style.wrapper}>
        <div class={style.list_wrapper}>
          {this.props.data && this.props.data.length ?
            <div>
              <a class={style.link} href={href}>{this.props.title}</a>
              <List
                data={this.props.data}
                renderItem={this.renderRow}
              />
            </div>
            :
            <span class={style.noResults}>No Results</span>
          }
        </div>

      </div>
    )
  }
}

