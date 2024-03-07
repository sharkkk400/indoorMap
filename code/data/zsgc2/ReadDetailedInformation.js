//将DetailedInformation.json保存的属性信息写入geojson地图数据文件，这里只写入了tag（大类小类），还可以加上营业时间、评分等

const fs = require('fs');

var path="E:\\indoorMap\\data\\zsgc2\\DetailedInformation.json"
fs.readFile(path, function (err, json) {
    if (err) {
        console.log(err);
    } else {
        let str = json.toString();	//将Buffer转换成字符串
        var info = JSON.parse(str);		//将数据转换为 JavaScript对象。 

        //根据具体数据修改
        var list = [
            "F1",
            "F2",
            "F3",
            "F4",
            "F5",
            "F6",
            "F7",
            "F8",
            "F9",
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
                        var uid=feature.properties.uid;
                        if (info[uid]&&info[uid].status==0){
                            var tag=info[uid].result.detail_info.tag; //tag里包含poi的大类和小类信息
                            var arr=tag.split(";");
                            feature.properties["class"]=arr[0];
                            feature.properties["subclass"]=arr[1];
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