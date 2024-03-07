const fs = require('fs');

var path="CategoryInformation.json"
fs.readFile(path, function (err, json) {
    if (err) {
        console.log(err);
    } else {
        let str = json.toString();	//将Buffer转换成字符串
        var info = JSON.parse(str);		//将数据转换为 JavaScript对象。 

        //根据具体数据修改
        var list = [
            "B1",
            "F1",
            "F2",
            "F3",
            "F4",
            "F5",
        ];

        list.forEach(floor => {
            var geojson = `${floor}_Point.geojson`;
            fs.readFile(geojson, function (err, json) {
                if (err) {
                    console.log(err);
                } else {
                    let str = json.toString();
                    var alldata = JSON.parse(str); 
            
                    alldata.features.forEach(feature=>{
                        var name = feature.properties.name;
                        var subclass = feature.properties.subclass;
                        if (subclass=="商铺"&&info[name]&&info[name].count!="0"){
                            var type=info[name].pois[0].type;
                            var typecode=info[name].pois[0].typecode;
                            var arr=type.split(";");
                            var subtype="";
                            if (arr[1]=="家电电子卖场"){// 这是高德叫法，用百度的
                                subtype="家电数码"
                            }
                            else if (arr[1]=="专卖店"){//高德地图的专卖店分得太粗了，用再细一级的
                                subtype=arr[2];
                            }
                            else{
                                subtype=arr[1]
                            }                            
                            feature.properties["subclass"]=subtype; //直接修改原来得属性
                        }
                    })

                    var outputStr = JSON.stringify(alldata, null, 4);
                    fs.writeFile(`output/${floor}_Point.geojson`, outputStr, function (err) {
                        if (err) {
                            console.error(err);
                        }
                        console.log(`${floor}_Point 完成`);
                    })
                }
            });
        });
    }
});