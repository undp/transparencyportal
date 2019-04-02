import style from './style';
import commonConstants from '../../../utils/constants';
const renderProjectPopUp = ({ project_id, output_sector, sector_color, project_title, output_id, output_location_class, output_exactness, output_location_name, output_signature_solution,ss_id}, embed, mapCurrentYear, apiBase) => (
    <article class={style.popUp}>
        {
         <a  class={`${style.popUpHeadTitle} ${style.popUpHeadTitleActive}`} target={embed?"_blank":"_self"} href={`/projects/${project_id}`}>
                {project_title}
            </a>
        }
 
        <table>
            <tr>
                <td>Project</td>
                <td>{project_id}</td>
            </tr>
            <tr>
                <td>Output</td>
                <td>{output_id}</td>
            </tr>
            
        </table>
        <div class={style.theme}><span class={style.themeColor} style={{ backgroundColor: '#' + sector_color }}></span>{output_sector}</div>
        <div> 
        {mapCurrentYear >= commonConstants.SIGNATURE_SOLUTION_YEAR ? (
                <div class={style.mapLegendImageSection}>
                     <img src={`${apiBase}/media/ss-icons/SS-${ss_id}.svg`} class={style.signatureSolImg} height="25" /> 
                     <section class={style.signatureSolImgText}> { " " + output_signature_solution }</section>
                </div>
            ) : null}
        </div>
        <h5 class={style.popUpHead}>
            Location Type:
            <span> {output_location_class}</span>
        </h5>
        <span class={style.popUpHead}>
            Location Name:
            <span> {output_location_name?output_location_name:'N/A'}</span>
        </span>
    </article>
)
export default renderProjectPopUp