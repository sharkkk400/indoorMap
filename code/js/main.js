mapboxgl.accessToken = 'pk.eyJ1IjoiYXJzbHh5IiwiYSI6ImNqZzRzemViajJ4MWUzM3Bjc3Z2M283ajMifQ.VuhGIVxu7Y9H7V4gUxTMdw';
var map = window.map = new mapboxgl.Map({
    container: 'map',
    zoom: 15.4,
    center: [114.33280771545384, 30.55882902416495],
    bearing: 80,
    pitch: 60,
    style: 'mapbox://styles/mapbox/streets-v11?optimize=true',//'mapbox://styles/arslxy/cjqly7jm000eq2ro676n5s68d',//用去掉建筑的底图
    hash: true,
    visualizePitch:true,
    antialias:true,//mapbox新功能，室内地图显示效果明显更细腻了
});
map.addControl(new mapboxgl.NavigationControl());

// 比例尺 截图时暂时隐藏
var scale = new mapboxgl.ScaleControl({
maxWidth: 300,
unit: "imperial",
});
map.addControl(scale);
scale.setUnit("metric");

// var language = new MapboxLanguage({
//     defaultLanguage: 'zh'
// });
// map.addControl(language);

var labelLayerId;//噪音在注记下面
var firstBuildingLayerId;//建筑里最先加进去的一个，轨迹线等在它下面
var zoomForEachScale = [11, 12, 13, 14, 14.5, 15, 15.5, 16, 16.5, 22];//建筑物L1-L9的显示级别 其他数据如室内、噪音的级别设定也与这个有关

//标题滚动展示
(function(){
    //var s="全息地图获取与位置信息聚合技术——地理场景多尺度展示 ".split("");  
    var s="全息地图场景空间数据在线集成系统 ".split("");
    function func(){  
        s.push(s[0]);  
        s.shift();// 去掉数组的第一个元素  
        document.title = s.join("");  
    }  
    setInterval(func,300);//设置时间间隔运行
})();

