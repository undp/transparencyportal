import { h, Component } from 'preact';
import style from './style';

export default class DropList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalState: false,
            currentState: this.props.defaultValue
        }

    }

    generatePageSizeList = (dataArray) => {
        return dataArray.map((data, index) => {
            return <li onClick={() => {
                this.setState({ modalState: false, currentState: data }, () => {
                    this.props.handleListClick(data)
                })
            }}>
                <span>{data}</span>
            </li>
        })
    }

    handleClickOutside = (e) => {
        if (this.state.modalState && !this.filter.contains(e.target)) {
            this.setState({ modalState: false })
        }
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        document.addEventListener('touchstart', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        document.removeEventListener('touchstart', this.handleClickOutside);
    }

    render({ dataArray }, { currentState, modalState }) {
        return (
            <div class={style.changeSizeBtnWrapper}>
                <div className={style.changeSizeBtn} onClick={() => { this.setState({ modalState: true }) }} >
                    <span class={style.selectionText}>{currentState}</span>
                </div>
                {
                    modalState ? <div className={style.pageSizeModal} ref={node => this.filter = node}>
                        <ul>
                            {this.generatePageSizeList(dataArray)}
                        </ul>
                    </div> : null
                }
            </div>
        )
    }

}