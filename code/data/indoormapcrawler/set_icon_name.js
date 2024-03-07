//根据对照表，根据数据中已有的sid属性设置一个icon

const fs = require('fs');

var floorsName= [
    "B4",
    "B3",
    "B2",
    "B1",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8"
]

//首先打开对照表
fs.readFile("indoor_style.json", function (err, json) {
    if (err) {
        console.log(err);
    } else {
        let str = json.toString();	//将Buffer转换成字符串
        var indoorStyle = JSON.parse(str);		//将数据转换为 JavaScript对象。 
        //要先根据sid获得一个中间编号，再根据这个中间编号获得icon名字，获得的方式就是以下两个字典
        //注意不是标准的字典，value是数组，还要从中选一项
        var dict1 = indoorStyle[1][21][0];//在indoor_style.json中有多个第一个字典，中间那个数字可能需要变动
        var dict2 = indoorStyle[2][0];

        floorsName.forEach(floorName => {
            var path = `群光广场室内地图数据处理/output/Point${floorName}.geojson`;
            fs.readFile(path, function (err, json) {
                if (err) {
                    console.log(err);
                } else {
                    let str = json.toString();	//将Buffer转换成字符串
                    var alldata = JSON.parse(str);		//将数据转换为 JavaScript对象。 
            
                    alldata.features.forEach(feature => {
                        try {
                            var sid = feature.properties.sid;                        
                            var tempId = dict1[sid][0];//注意不是标准的字典，value是数组，还要从中选一项
                            var icon = dict2[tempId][2];//同上
                            //console.log(sid, icon);
                            feature.properties.icon = icon;
                        } catch (e) {//有些在字典里找不到
                            console.log(sid,e.message);
                        }                        
                    })
        
                    var outputstr = JSON.stringify(alldata, null, 4);
                    fs.writeFile(path, outputstr, function (err) { 
                        if(err){
                            console.error(err);
                        }
                        console.log(`修改${path}成功`);
                    })
                }
            });  
        })
    }
})

