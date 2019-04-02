import { h, Component } from 'preact';
import style from './style';
import DropList from '../../components/dropList';
const PagesizeDataArray = [10, 25, 50, 100];
export default class PaginationPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: 10,
        }
    }

    generatePaginationList = (paginationProps) => {
        return paginationProps.components.pageList;
    }


    handleListClick = (data) => {
        this.setState({ pageSize: data },()=>{
            this.props.paginationProps.changeSizePerPage(this.state.pageSize)
        });
    }

    render({ paginationProps }, { pageSize, modalState }) {
        return (
            <div className={style.paginationPanel}>
                <div className={style.changeSizeOuterWrapper}>
                    <div class={style.changeSizeWrapper}>
                        <span>Show</span>
                            <DropList dataArray={PagesizeDataArray}
                            handleListClick={this.handleListClick}
                            defaultValue={this.state.pageSize}
                            />
                        <span>entries</span>
                    </div>
                </div>
                <div className={style.pagainationWrapper}>
                    <div className={style.pagination}>
                        {this.generatePaginationList(paginationProps)}
                    </div>
                </div>
            </div>
        );
    }
}
