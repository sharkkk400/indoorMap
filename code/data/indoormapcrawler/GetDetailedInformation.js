//poi点详细信息爬取 GetDetailedInformation.js 结果写入DetailInformation.json集中保存 再通过ReadDetailedInformation.js把属性写入geojson地图数据
//问题主要在于百度有并发量限制 可以错开时间发送请求 运行了一段时间过后结果全部获取了再手动按个按钮输出结果（笨方法）

const https = require('https');
const fs = require('fs');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

//要获取数据的楼层列表 根据具体建筑修改
var list = [
    "B1",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5"
];

var outputJson = {}; //把获取到的数据全部输入到一个json文件中
var arrReadFilePromise = [];
list.forEach(floor => {
    var path = `${floor}_Point.geojson`; //根据具体存放路径和地图数据文件名称修改

    var promise = readFile(path);
    arrReadFilePromise.push(promise);
});

var readFilesPromise = Promise.all(arrReadFilePromise);
readFilesPromise.then(function (jsons) {
    jsons.forEach(json => {
        let str = json.toString();	//将Buffer转换成字符串
        var alldata = JSON.parse(str);		//将数据转换为 JavaScript对象。 
        
        var j = 0;
        for (i = 0; i < alldata.features.length; i++) {  //遍历每一个poi点
            setTimeout(async function () {
                var feature = alldata.features[j];
                var uid = feature.properties.uid; //poi点的uid 根据它从百度webapi获取更多属性信息
                if (uid) {
                    var obj=await httpGet(uid); //发送请求 获取数据
                    outputJson[obj.uid] = obj.json; //结果
                    console.log(obj.json);
                }
                j++;                
            }, 500*i);
        }
    });

    rl.on('line', function(line){ //按任意键结束程序 输出结果
        console.log(line);
        var outputStr = JSON.stringify(outputJson, null, 4);
        fs.writeFile('DetailedInformation.json', outputStr, function (err) { //输出结果
            if (err) {
                console.error(err);
            }
            console.log('输出成功');
        })
    })    
})

function httpGet(uid) { 
    return new Promise(function (resolve, reject) {
        var url = `https://api.map.baidu.com/place/v2/detail?uid=${uid}&output=json&scope=2&ak=IAZsva6r52anU52bs4VuW270PiF9xDv0`;
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
                    uid:uid,
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