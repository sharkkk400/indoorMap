const fs = require('fs');
const path = "data/群光瓦片1/Point B1.geojson";

fs.readFile(path, function (err, json) {
    if (err) {
        console.log(err);
    } else {
        let str = json.toString();	//将Buffer转换成字符串
        var alldata = JSON.parse(str);		//将数据转换为 JavaScript对象。 

        alldata.data.features.forEach(feature => {
            feature.geometry.coordinates[0] = feature.geometry.coordinates[0] / 2;//x轴坐标变为原来一半
        });

        var outputStr = JSON.stringify(alldata, null, 4);
        fs.writeFile('output/output.geojson', outputStr, function (err) {
            if (err) {
                console.error(err);
            }
            console.log("完成");
        })
        // var objData = readData(alldata);
        // outputData(objData);
    }
});

function outputData(objData) {
    objData.floors.forEach(floor => {
        var floorName = floor.floorName;

        //输出该楼层底面轮廓
        var polygonFile = {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': []    
            }
        }
    
        floor.FuncAreas.forEach(funcArea => {
            var feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [
                        []
                    ]
                },
                'properties': {
                }
            }
    
            //几何
            var outline = funcArea.outline;
            var x = outline[0];
            var y = outline[1];
            var coords = feature.geometry.coordinates[0];
            coords.push([x, y]);
            for (var i = 2; i < outline.length; i += 2) {
                x = x + outline[i];
                y = y + outline[i + 1];
                coords.push([x, y]);
            }
            coords.push([outline[0],outline[1]])//形成闭合
    
            //属性
            feature.properties["type"] = funcArea.type;
    
            polygonFile.data.features.push(feature);
        });
    
        var strPolygon = JSON.stringify(polygonFile, null, 4);
        fs.writeFile('output/Polygon '+floorName+'.geojson', strPolygon, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('输出底图'+floorName);
        })


        if (floor.POIs.length == 0) return;//有可能没有POI
        //输出该楼层POI
        var pointFile = {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': []    
            }
        }
    
        floor.POIs.forEach(point => {
            var feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': []//直接这里面放两个数字
                },
                'properties': {
                }
            }
    
            //几何
            feature.geometry.coordinates = point.position;    
            //属性
            feature.properties["id"] = point.id;
            feature.properties["name"] = point.name;
            feature.properties["type1"] = point.type1;
            feature.properties["type2"] = point.type2;
            feature.properties["type3"] = point.type3;
    
            pointFile.data.features.push(feature);
        });
    
        var strPoint = JSON.stringify(pointFile, null, 4);
        fs.writeFile('output/Point '+floorName+'.geojson', strPoint, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('输出POI'+floorName);
        })
    })    
}

function readData(alldata){
    var objData={};//存储所有读取出来的数据

    var floorsInfo = alldata[0];
    var buildingInfo = alldata[1];

    var arrFloorData=[];
    floorsInfo.forEach(data => {
        var floorData={};
        
        floorData.floorName = data[0];
        console.log(floorData.floorName);

        var poiData;
        var backgroundData;
        for (var i=0;i<data[3][0].length;i++){
            if (data[3][0][i][0]==3){//代号3就是POI数据，但有的切片很小不一定有poi数据 3 15300
                poiData = data[3][0][i];
            }
            if (data[3][0][i][0]==7){//代号7就是背景数据，8也是，但只有一小部分而且重复 7 15100
                backgroundData = data[3][0][i];
                //var backgroundData2 = data[3][0][2];//8 15200 跟上面的数据有重复 如果要用 改成polygon[2][0] polygon[2][1]即可
            }
        }
        if (poiData==undefined){
            console.log("未找到POI数据");
        }
        if (backgroundData==undefined){
            console.log("未找到背景数据");//这个一般不会没有
        }                

        //读取POI数据
        //console.log(poiData);
        var arrPOIs=[];
        if (poiData){
            poiData[1].forEach(poiType=>{
                type1=poiType[0]; 
                poiType[1].forEach(item=>{
                    var poi={};
                    poi.name=item[4][7];
                    poi.position=[item[4][0],item[4][1]];
                    poi.type1=type1;
                    poi.type2=item[4][2];
                    poi.type3=item[4][4];
                    arrPOIs.push(poi);
                })
            });
            console.log(arrPOIs);
        }                
        
        //读取底面轮廓数据
        //console.log(backgroundData);
        var arrFuncAreas = [];
        backgroundData[1].forEach(typeData => {
            var type1 = typeData[0];//类别代号
            typeData[1].forEach(polygon => {
                var funcArea = {};
                funcArea.type1 = type1;
                funcArea.type2 = polygon[1][0];//也是类别代号
                funcArea.outline = polygon[1][1];//轮廓
                arrFuncAreas.push(funcArea);
            })
        });
        console.log(arrFuncAreas);

        floorData.POIs=arrPOIs;
        floorData.FuncAreas=arrFuncAreas;
        arrFloorData.push(floorData);
    });

    objData.floors=arrFloorData;
    
    return objData;
}