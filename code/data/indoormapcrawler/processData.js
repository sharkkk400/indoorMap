const fs = require('fs');
const path = "E:/indoorMap/zsgc.json";
const outputPath = "E:/indoorMap/data/zsgc/";

fs.readFile(path, function (err, json) {
    if (err) {
        console.log(err);
    } else {
        let str = json.toString();	//将Buffer转换成字符串
        var alldata = JSON.parse(str);		//将数据转换为 JavaScript对象。 

        var objData = readData(alldata);
        outputData(objData);
    }
});

function outputData(objData) {
    //一、关于整个建筑信息的json文件
    var mainObj = objData.building;
    var polygonFile = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:EPSG::3857"
            }
        },
        "features":[]
    }
    
    //大部分都是单个的多边形
    if (objData.building.boundary) { //有些数据这一项是null
        objData.building.boundary.forEach(boundary => { 
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
            var outline = boundary[1];
            var x = outline[0];
            var y = outline[1];
            var coords = feature.geometry.coordinates[0];
            coords.push([x, y]);
            for (var i = 2; i < outline.length; i += 2) {
                x = x + outline[i];
                y = y + outline[i + 1];
                coords.push([x, y]);
            }
            coords.push([outline[0], outline[1]])//形成闭合
            polygonFile.features.push(feature);
        })    
    }
    
    //其中的boundary要指向建筑物的边界文件
    //mainObj.boundary = 'building_outline.geojson';
    delete mainObj.boundary;

    //输出关于mainfile的文件
    var mainJson = JSON.stringify(mainObj, null, 4);
    fs.writeFile(outputPath+'main.json', mainJson, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('输出main.json');
    })
    //建筑物总体轮廓文件
    var buildingBoundary = JSON.stringify(polygonFile, null, 4);
    fs.writeFile(outputPath+'building_outline.geojson', buildingBoundary, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('输出建筑物边界');
    })

    //二、遍历楼层，输出各楼层的多边形和点
    //首先要提前准备好icon跟sid的对照表
    var data = fs.readFileSync('indoor_style.json');
    var indoorStyleStr = data.toString();
    var indoorStyle = JSON.parse(indoorStyleStr);
    //要先根据sid获得一个中间编号，再根据这个中间编号获得icon名字，获得的方式就是以下两个字典
    //注意不是标准的字典，value是数组，还要从中选一项
    var dict1 = indoorStyle[1][21][0];//在indoor_style.json中有多个第一个字典，中间那个数字可能需要变动
    var dict2 = indoorStyle[2][0];

    objData.floors.forEach(floor => {
        var floorName = floor.floorName;

        //输出该楼层底面轮廓
        var polygonFile = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:EPSG::3857"
                }
            },
            "features":[]
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
            feature.properties["type"] = funcArea.type1;
    
            polygonFile.features.push(feature);
        });
    
        var strPolygon = JSON.stringify(polygonFile, null, 4);
        fs.writeFile(outputPath+floorName+'_Polygon.geojson', strPolygon, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('输出底图'+floorName);
        })

        //三、输出POI
        if (floor.POIs.length == 0) return;//有可能没有POI
        //输出该楼层POI
        var pointFile = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:EPSG::3857"
                }
            },
            "features":[]
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
            feature.properties["name"] = point.name;
            feature.properties["uid"] = point.id;
            feature.properties["type"] = point.type2;
            feature.properties["rank"] = point.type3;
            feature.properties["sid"] = point.type1;

            //icon要单独处理，前面以前从对照表中得到字典
            try {
                var sid = feature.properties.sid;                        
                var tempId = dict1[sid][0];//注意不是标准的字典，value是数组，还要从中选一项
                var icon = dict2[tempId][2];//同上
                feature.properties.icon = icon;
            } catch (e) {//有些在字典里找不到
                console.log(sid,e.message);
            }
    
            pointFile.features.push(feature);
        });
    
        var strPoint = JSON.stringify(pointFile, null, 4);
        fs.writeFile(outputPath+floorName+'_Point.geojson', strPoint, function (err) {
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
        //console.log(floorData.floorName);

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
                    var poi = {};
                    poi.id = item[4][3];
                    poi.name=item[4][7];
                    poi.position=[item[4][0],item[4][1]];
                    poi.type1=type1;
                    poi.type2=item[4][2];
                    poi.type3 = item[4][4];                    
                    arrPOIs.push(poi);
                })
            });
            //console.log(arrPOIs);
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
        //console.log(arrFuncAreas);

        floorData.POIs=arrPOIs;
        floorData.FuncAreas=arrFuncAreas;
        arrFloorData.push(floorData);
    });

    //关于整个建筑物的基本信息
    var buildingData = {};
    buildingData.id = buildingInfo[0];
    buildingData.name = buildingInfo[11];
    buildingData.default_floor = buildingInfo[1];
    buildingData.floor_names= buildingInfo[3];    
    buildingData.floor_indexs = buildingInfo[16];

    //建筑物的轮廓 目前有两个数据 后面那个是对应的三维建筑物轮廓 前面那个是包括地下室的，可能是所有楼层叠加的最外围
    // buildingData.boundary = buildingInfo[2][0][1];
    buildingData.boundary = buildingInfo[15];

    objData.floors = arrFloorData;
    objData.building = buildingData;
    
    return objData;
}