var request = require('request');
var fs = require('fs');

function downloadFile(uri,filename,callback){
    var stream = fs.createWriteStream(filename);
    request(uri).pipe(stream).on('close', callback); 
}

fs.readFile("indoor icon list.json", function (err, json) {
    if (err) {
        console.log(err);
    } else {
        let str = json.toString();	//将Buffer转换成字符串
        var alldata = JSON.parse(str);		//将数据转换为 JavaScript对象。 

        //var count = 0;
        for (var num in alldata) { 
            var iconName = alldata[num][2];
            var fileName = iconName + ".png";
            
            var fileUrl  = 'https://ss0.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/sty/map_icons2x/'+fileName;
            
            downloadFile(fileUrl,fileName,function(){
                console.log(fileName+'下载完毕');
            });

            //count++;
        }
        //console.log(count);
    }
});