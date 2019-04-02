import { h, Component } from 'preact';
import style from './style';
import DropList from '../../components/dropList';
const PagesizeDataArray = [10, 25, 50, 100];
import Pagination from 'react-js-pagination';

export default class PaginationPanelSearch extends Component {

    constructor(props) {
        super(props);

    }

    render({pageSize,pageIndex,pageCount}) {
        const paginationSize = window.innerWidth < 620? 1 : 5;

        return (
            <div className={style.paginationPanel}>
                <div className={style.changeSizeOuterWrapper}>
                    <div class={style.changeSizeWrapper}>
                        <span>Show</span>
                            <DropList
                            dataArray={PagesizeDataArray}
                            handleListClick={(value)=>{
                                this.props.onChangePageSize(value)
                            }}
                            defaultValue={pageSize}
                            />
                        <span>entries</span>
                    </div>
                </div>
                <div className={style.pagainationWrapper}>
                    <div className={style.pagination}>
                    <Pagination
                            hideDisabled
                            innerClass={style.innerClass}
                            itemClass={style.itemClass}
                            linkClass={style.linkClass}
                            activeLinkClass={style.activeLinkClass}
                            activePage={pageIndex}
                            itemsCountPerPage={pageSize}
                            totalItemsCount={pageCount!=0?pageCount:5}
                            pageRangeDisplayed={paginationSize}
                            firstPageText={'<<'}
                            lastPageText={'>>'}
                            nextPageText={'Next'}
                            prevPageText={'Prev'}
                            onChange={(data) => {
                                this.props.onChangePageIndex(data)
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}




