import style from './style';
import { numberToCommaFormatter, numberToCurrencyFormatter } from '../../../utils/numberFormatter';
const renderRegionPopUp = (props, embedProps, baseURL) => (
    <article class={style.popUp}>
        {
            <div>
                <img class={style.flagIcon} src={props.unit_type === 'CO' ? baseURL+'/media/flag_icons/'+props.country_iso3+'.svg':'/assets/images/Empty.svg'}></img>
                <a target={embedProps?"_blank":"_self"} class={`${style.popUpHeadTitle} ${style.popUpHeadTitleActive}`} href={`/profile/${props.country_iso2}/recipientprofile`}>
                    {props.country_name}
                </a>
            </div>
        }
        <table>
            <tr>
                <td>Projects</td>
                <td>{numberToCommaFormatter(props.project_count)}</td>
            </tr>
            <tr>
                <td>Budget</td>
                <td>{numberToCurrencyFormatter(props.total_budget, 2)}</td>
            </tr>
            <tr>
                <td>Expense</td>
                <td>{numberToCurrencyFormatter(props.total_expense, 2)}</td>
            </tr>
        </table>
    </article>
)
export default renderRegionPopUp