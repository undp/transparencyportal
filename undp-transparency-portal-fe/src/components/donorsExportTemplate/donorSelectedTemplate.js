import { h, Component } from "preact";
import style from "./style";
import { numberToCurrencyFormatter, numberToCommaFormatter } from '../../utils/numberFormatter'

export default class DonorDetailsTemplate extends Component {


    render({ year, unitSelected, themeSelected, sdgSelected, tabData }, state) {
        return (
            <div id="export1" class={`${style.exportWrapper} ${style.globalDonorsWrapper}`}>
                <section class={style.header}>
                    <span class={style.title}>Donors</span>
                    <span class={style.subTitle}>{year}</span>
                </section>
                <section class={style.sectionWrapper}>
                    <ul class={style.filterWrapper}>
                        <li class={style.filterItem}>
                            <span class={style.filterTitle}>
                                Recipient Country Office / Operating Unit
                            </span>
                            <span class={style.filterValue}>
                                {unitSelected && unitSelected != "" ? unitSelected : 'NIL'}
                            </span>
                        </li>
                        <li class={style.filterItem}>
                            <span class={style.filterTitle}>
                                SDG
                            </span>
                            <span class={style.filterValue}>
                                {sdgSelected && sdgSelected != "" ? sdgSelected : 'NIL'}
                            </span>
                        </li>
                        <li class={style.filterItem}>
                            <span class={style.filterTitle}>
                                Theme
                            </span>
                            <span class={style.filterValue}>
                                {themeSelected && themeSelected != "" ? themeSelected : 'NIL'}
                            </span>
                        </li>
                    </ul>
                </section>
                <section class={style.sectionWrapper}>
                    <ul class={style.aggregateWrapper}>
                        <li class={style.aggregateSubTitle}>
                            {numberToCurrencyFormatter(tabData.data.project.budget, 2)}
                        </li>
                        <li class={style.aggregateSubTitle}>
                            {numberToCurrencyFormatter(tabData.data.project.expense, 2)}
                        </li>
                        <li class={style.aggregateSubTitle}>
                            {tabData.data.project.projects}
                        </li>
                    </ul>
                </section>
                <section class={style.sectionWrapper}>
                    <span class={style.sectionHeader}>
                        Top Donors
                    </span>
                    <ul class={style.donorsList}>
                        {
                            tabData.data.data.map((donor, index) => {
                                return (
                                    <li key={index} class={style.donorItem}>
                                        <span class={`${style.column} ${style.donorTitle}`}>{donor.level_3_name}</span>
                                        <span class={`${style.column} ${style.donorDetailsWrapper}`}>
                                            <span class={style.aggregateWrapper}>
                                                <span>{numberToCurrencyFormatter(donor.total_budget,2)}</span>
                                                <span>{numberToCurrencyFormatter(donor.total_expense,2)}</span>
                                                <span>{donor.total_projects}</span>
                                            </span>
                                        </span>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </section>
            </div>
        )
    }
}