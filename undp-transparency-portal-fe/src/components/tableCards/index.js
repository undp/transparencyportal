import { h, Component } from 'preact';
import style from './style';
import viewDetailsIcon from '../../assets/icons/View_Results_Icon.png'


//Example
// fields={
//     [{
//         title: 'Name',
//         key: 'name'
//     },
//     {
//         title: 'Age',
//         key: 'age'
//     }]
// }

// data = [{
//     name:'anoop',
//     age:'26'
// },{
//     name:'sabir',
//     age:'27'
// }]


export default class GenricTableCard extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    generateInnerList = (data, fields) => {
        return fields.map((item) => {
            if(item.renderElement){
                return(

                        item.renderElement

                )
            }else{
                return (
                    <div class={style.cardDetails}>
                        {
                            item.displayTitle ? <div class={style.label}>{item.title}</div> : null
                        }
                        <div class={style.value}>{data[item.key]}</div>
                    </div>
                )
            }

        })

    }


        render({ data, fields,displayTitle }, state) {
            return (
                <div class={style.container}>
                    {this.generateInnerList(data,fields)}
                </div>
            )
        }


}
