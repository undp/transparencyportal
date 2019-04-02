import { h, Component } from 'preact';
import List from '../../components/listView'
import DonorContributionItem from '../../components/donor-contribution-item'
import style from './style'

export default class DonorContributionChart extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    }
  }
  componentWillReceiveProps(nextProps) {

  }

  renderRow = (item, index) => {
    return (
      <DonorContributionItem
        data={item.item}
        index={index}
      />
    )

  }

  render() {

    return (
      <div class={style.wrapper}>
        <div class={style.list_wrapper}>
          {this.props.data && this.props.data.length ?
            <div>
              <List
                data={this.props.data}
                renderItem={this.renderRow}
              />
              <section class={style.contributionWrapper}>
                <div class={`${style.wrapperItem}`}>
                  <div class={style.DonorContribution}></div>
                  <div class={style.contributionText}>{`${this.props.country}'s Contribution`}</div>
                </div>
                <div class={`${style.wrapperItem}`}>
                  <div class={style.AllDonorContribution}></div>
                  <div class={style.contributionText}>{"All Donor's Contribution"}</div>
                </div>
              </section>
            </div>
            :
            <span class={style.noResults}>No Results</span>
          }
        </div>

      </div>
    )
  }
}

