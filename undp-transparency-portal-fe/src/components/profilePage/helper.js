export function regularAndOthersSplitter(regular, others) {
    let map1, arr3, arr4
    if (regular.length > 0 && others.length > 0) {

        var otherPercent = _.find(regular, (obj) => {
            return obj.fund_type === 'Other Resources'
        })

        otherPercent ?  otherPercent = otherPercent.percentage : null; 

        map1 = others.map(item => {
            item.percentage = item.percentage;
            return item;
        })

        arr3 = (regular.filter(obj => {
            return obj.fund_type !== 'Other Resources'
        }))
        map1 = _.remove(map1, function(n) {
            return n.fund_stream !== 'Regular Resources';
          });
        arr4 = [...arr3, ...map1]

    }
    const result = {
        isChanged: true,
        data: arr4
    }

    return result

}