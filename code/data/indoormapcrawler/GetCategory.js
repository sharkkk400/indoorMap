//通过名称用高德地图api获取详细分类信息 补充百度数据的不足 只有购物大类商铺小类 不够具体 但不如百度api用uid精准

const https = require('https');
const fs = require('fs');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

//根据具体建筑修改
var list = [
    "B1",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5"
];

var outputJson = {};
var arrReadFilePromise = [];
list.forEach(floor => {
    var path = `${floor}_Point.geojson`; //根据具体存放路径修改

    var promise = readFile(path);
    arrReadFilePromise.push(promise);
});

var readFilesPromise = Promise.all(arrReadFilePromise);
readFilesPromise.then(function (jsons) {
    jsons.forEach(json => {
        let str = json.toString();	//将Buffer转换成字符串
        var alldata = JSON.parse(str);		//将数据转换为 JavaScript对象。 
        
        var j = 0;
        for (i = 0; i < alldata.features.length; i++) { 
            setTimeout(async function () {
                var feature = alldata.features[j];
                var name = feature.properties.name;
                var subclass=feature.properties.subclass;
                if (name && subclass == "商铺"){
                    var obj=await httpGet(name);
                    outputJson[obj.name] = obj.json;
                    console.log(obj.json);
                }
                j++;                
            }, 500*i);
        }
    });

    rl.on('line', function(line){
        console.log(line);
        var outputStr = JSON.stringify(outputJson, null, 4);
        fs.writeFile('CategoryInformation.json', outputStr, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('输出成功');
        })
    })    
})

function httpGet(name) { 
    return new Promise(function (resolve, reject) {
        var encodedName=encodeURI(name);
        var url = `https://restapi.amap.com/v3/place/polygon?polygon=114.33758,30.558025|114.339147,30.555211&keywords=${encodedName}&output=json&key=35d9c9c531c0beb13a6e78742a6f2e1c`;
        https.get(url, resp => {
            let data = '';
        
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
        
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                var json = JSON.parse(data);
                var obj = {
                    name:name,
                    json:json
                }
                resolve(obj);
            });
        })
    })
}

function readFile(path) { 
    return new Promise(function (resolve, reject) { 
        fs.readFile(path, function (err, data) { 
            if (err) { 
                reject(err);
                return;
            }
            resolve(data);
        })
    })
}