//*************室外底图和三维建筑部分***************//

//根据图层名称，构造数据源
function constructSource(mySource){
    return   {
        'type':'vector',
        'scheme':'tms',
        'tiles':['http://'+Config.host+'/geoserver/gwc/service/tms/1.0.0/moreLevel%3A'+mySource+'@EPSG:900913@pbf/{z}/{x}/{y}.pbf']
    };                
}

//var extrusionHeight = ["*", 5, ['get', 'height']];
//对于较高的建筑，高度可以适当拔高，不一定要线性的
var extrusionHeight = [
    'interpolate',
    ['linear'],
    ['get', 'height'],
    0, 0,
    20, 100,
    40, 200,
    60, 300
];

var extrusionBase = [//建筑阴影用到 全设为0
    'interpolate',
    ['linear'],
    ['get', 'height'],
    0, 0,
    20, 0,
    40, 0,
    60, 0
];

//构造图层，添加图层用，不同的缩放级别范围对应不同数据源
function constructLayer(myId,mySource,myLayer,myMin,myMax,opactiy=1){
    return {
        'id': myId,
        'source': mySource,
        'source-layer': myLayer,
        'type': 'fill-extrusion',
        'minzoom': myMin,
        'maxzoom': myMax,
        'paint': {
            'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, 'rgb(255,255,191)',
                20, 'rgb(253,174,97)',
                40, "rgb(215,25,28)",
            ],
            // 'fill-extrusion-color': 'rgb(255,240,174)',//审稿人要求改为统一颜色
            'fill-extrusion-height': extrusionHeight,
            'fill-extrusion-base': extrusionBase,
            'fill-extrusion-opacity': opactiy,
        }
    };
}

var landusePaint =
    {
        'fill-color': [
            'match',
            ['get', 'DLBM'],
            '0303', '#31AD69',
            '0304', '#31AD69',
            '0306', '#64B968',
            '0402', '#83C238',
            '0603', '#0093DD',
            '1105', '#B3DEF8',
            '1106', '#B3DEF8',
            '1108', '#AFC8DC',
            '0101', '#F8D072',
            '0102', '#FCEA9E',
            '0103', '#FFFBB1',
            '0201', '#D6A7C9',
            '0202', '#D5A7B0',
            '0203', '#E7CCE2',
            '0204', '#E7CCE2',
            '0301', '#31AD69',
            '0302', '#64B968',
            '0305', '#64B968',
            '0307', '#97CFB2',
            '0401', '#83C238',
            '0403', '#9ACE7F',
            '0404', '#C8E3A0',
            '05H1', '#E2A195',
            '0508', '#C59A8C',
            '0601', '#C59A8C',
            '0602', '#C59A8C',
            '0701', '#E56766',
            '0702', '#EC898A',
            '08H1', '#F1A5B4',
            '08H2', '#F1A5B4',
            '0809', '#F1A5B4',
            '0810', '#81C35D',
            '09', '#C17261',
            '1001', '#D1C9D3',
            '1002', '#D1C9D3',
            '1003', '#D2D8C9',
            '1004', '#DEDEDD',
            '1005', '#AAA9A9',
            '1006', '#C2C1C1',
            '1007', '#EB897E',
            '1008', '#EB897E',
            '1009', '#EB897E',
            '1101', '#A3D6F5',
            '1102', '#A3D6F5',
            '1103', '#A3D6F5',
            '1104', '#90AACF',
            '1107', '#A0CDF0',
            '1109', '#E68264',
            '1110', '#D7EDFB',
            '1201', '#E1DCE1',
            '1202', '#DCB482',
            '1203', '#C8B6B2',
            '1204', '#C8CCD2',
            '1205', '#C8BEAA',
            '1206', '#D7C8B9',
            '1207', '#DEDDD6',
            /* other */ '#ccc'
        ],
        'fill-outline-color': '#111',
        'fill-opacity': 1
    }

function constructLanduseLayer(layerName,minZoom,maxZoom){
    return {
        'id': layerName,
        'source': layerName,
        'source-layer': layerName,
        'type': 'fill',
        'minzoom': minZoom,
        'maxzoom': maxZoom,
        'paint': landusePaint
    }
}

map.on('load', function () {
    //找到注记和建筑图层id
    var allLayers = map.getStyle().layers;
    for (var i = 0; i < allLayers.length; i++) {
        if (allLayers[i].type === 'symbol' && allLayers[i].layout['text-field']) {
            labelLayerId = allLayers[i].id;//第一个注记图层的id
            break;
        }
    }
    for (var i = 0; i < allLayers.length; i++) {
        if (allLayers[i].type === 'fill-extrusion') {
            firstBuildingLayerId = allLayers[i].id;//第一个建筑图层的id
            break;
        }
    }
    
    //添加一些地图一加载时即显示的图层
    document.getElementById("3dbuildings").click(); 
    addFlagForCities();
    addLanduse();    
    
    //不能在显示国家的时候显示台湾
    map.setFilter("country-label", ["!=", "name_en", "Taiwan"]);
    
    //论文截图时隐去室外poi，突出室内poi
    //map.setLayoutProperty('poi-label', 'visibility', 'none');
    //隐去mapbox自带建筑物
    map.setLayoutProperty('building', 'visibility', 'none');
    map.setLayoutProperty('building-outline', 'visibility', 'none');

    //添加二维建筑给老师ppt截图用
    // map.addLayer({
    //     'id': 'guangzhou_2d',
    //     'type': 'fill',
    //     'source': 'guangzhou_L1',
    //     'source-layer':'guangzhou_L1',
    //     'layout': {},
    //     'paint': {
    //         'fill-color': [
    //             'interpolate',
    //             ['linear'],
    //             ['get', 'height'],
    //             0, 'rgb(255,255,191)',
    //             20, 'rgb(253,174,97)',
    //             40, "rgb(215,25,28)",
    //         ],
    //         'fill-opacity': 0.9,
    //         'fill-outline-color': '#111',
    //     }
    // });
});

//做了三维建筑的城市用一个旗子标记
function addFlagForCities() {
    var cityCoordinates = [];
    for (var key in positions) { 
        cityCoordinates.push(positions[key]);
    }
    map.addSource("cityFlags", {
        "type": "geojson",
        "data": {
            "type": "MultiPoint",
            "coordinates": cityCoordinates
        }
    });    
    map.addLayer({
        "id": "cityFlags",
        "source": "cityFlags",
        "type": "symbol",
        "maxzoom":11,
        "layout": {
            "icon-image": "embassy-15",
            "icon-rotation-alignment": "map",
            "icon-size":3
        }
    });
}

//切换不同的城市
var cityPanel=document.getElementById("cityControlPanel");
var inputsCities=cityPanel.getElementsByTagName("input");
for (var i=0;i<inputsCities.length;i++){
    inputsCities[i].onclick=switchCity;
}
function switchCity(e) { 
    var city = e.target.value;
    var para={
        center: [],
        zoom: 15.6,
        bearing: 0,
        pitch:60,
    }
    switch (city) { 
        case "Shanghai":
            para.center=positions.shanghai;
            break;
        case "Nanjing":
            para.center=positions.nanjing;
            break;
        //广州跳到多尺度土地利用展示效果比较好的场景
        case "Guangzhou":           
            para.center=positions.guangzhou;
            para.bearing=180;
            para.pitch=30;            
            break;
        case "Wuhan":
            para.center=positions.wuhan;
            break;
        default:
            break;    
    }
    map.jumpTo(para);
}
var positions = {
    guangzhou: [113.2841796166141,23.153585988767148],
    shanghai: [121.43035105882223,31.17516831883114],
    nanjing: [118.790555, 32.053762],
    wuhan:[114.33280771545384,30.55882902416495]
};

//添加建筑物以及控制建筑物显示隐藏 TODO可能要改成切换到哪个城市再加载哪个城市的数据
var cbxBuildings = document.getElementById("3dbuildings");
cbxBuildings.flag = false;
cbxBuildings.addEventListener('click', function () {
    this.flag = !this.flag;
    if (map.getSource("shanghai_L1") == undefined) {//TODO暂时写死了以后再改
        addBuildingForCity("shanghai");
        addBuildingForCity("guangzhou");
        addBuildingForCity("nanjing");
        addBuildingForCity("wuhan");
    }
    var visibility = this.flag ? true : false;
    showOrHideBuildings("shanghai", visibility);
    showOrHideBuildings("guangzhou", visibility);
    showOrHideBuildings("nanjing", visibility);
    showOrHideBuildings("wuhan", visibility);
});

function showOrHideBuildings(cityName,showOrHide) { 
    for (var i = 1; i <= 9; i++) { 
        var xixi = cityName + '_L' + i.toString();
        map.setLayoutProperty(xixi, 'visibility', showOrHide?'visible':'none');       
    }
}

//换数据 每个级别的数据都添加进去
function addBuildingForCity(cityName) { 
    for (var i = 1; i <= 9; i++){
        var xixi=cityName+'_L'+i.toString();
        var minLevel = zoomForEachScale[9 - i];//特定缩放级别对应特定数据
        var maxLevel = zoomForEachScale[10 - i];
        map.addSource(xixi,constructSource(xixi));
        map.addLayer(constructLayer(xixi, xixi, xixi, minLevel, maxLevel,1));
    }
}

//预加载广州市越秀区土地利用数据
function addLanduse(){  
    var layerName='DLTB_2K';
    map.addSource(layerName,constructSource(layerName));
    map.addLayer(constructLanduseLayer(layerName,16.5,22),labelLayerId);
    
    layerName='DLTB_1W';
    map.addSource(layerName,constructSource(layerName));
    map.addLayer(constructLanduseLayer(layerName,15,16.5),labelLayerId);

    layerName="DLTB_5W";
    map.addSource(layerName,constructSource(layerName));
    map.addLayer(constructLanduseLayer(layerName,11,15),labelLayerId);
}

//控制面板的显示和切换 关键是按钮和面板id的命名 如：按钮名lightControl 面板名：lightControlPanel 按钮的class要加上openPanel
var divMenu = document.getElementById("menu");
var buttonsInMenu = divMenu.getElementsByTagName("button");
for (let i = 0; i < buttonsInMenu.length; i++) {
    //只给那些用来打开更详细的控制面板的按钮加这个事件
    if (buttonsInMenu[i].className.indexOf("openPanel")!=-1) { 
        buttonsInMenu[i].onclick = function (e) {
            var panelId = e.target.id + "Panel";
            var panel = document.getElementById(panelId);
            panel.style.display = panel.style.display === "block" ? "none" : "block";
            for (let j = 0; j < buttonsInMenu.length; j++) {
                if (j != i&&buttonsInMenu[j].className.indexOf("openPanel")!=-1) {
                    panelId = buttonsInMenu[j].id + "Panel";
                    panel = document.getElementById(panelId);
                    panel.style.display = "none";
                }
            }
        }
    }    
}

//实时显示现在的缩放级别和显示的建筑图层
setInterval("changeInfo()",50);
function changeInfo(){
    var layerList = document.getElementById('xixi');
    var zoomNow = map.getZoom();
    var levelNow = 'none';
    for (var i = 0; i < zoomForEachScale.length; i++) { 
        if (zoomNow > zoomForEachScale[i]) { 
            levelNow = 9 - i;
        }
    }
    layerList.textContent = zoomNow.toFixed(1);
    //layerList.textContent="zoom:"+zoomNow.toFixed(1)+" "+"layer:"+levelNow.toString();
    // var oceanZoom=document.getElementById("ocean-zoom");
    // oceanZoom.textContent = "zoom:" + zoomNow.toFixed(1);
}

//室内、城市、全球场景的动画切换
document.getElementById("flyToWorld").addEventListener("click", function () {
    map.flyTo({
        // These options control the ending camera position: centered at
        // the target, at zoom level 9, and north up.
        //center: { lng: 114.33280771545384, lat: 30.55882902416495 },//{ lng: 120.114129, lat: 32.550339 },
        zoom: 2,
        bearing: 0,
        pitch:0,
        center: positions.shanghai,
        // These options control the flight curve, making it move
        // slowly and zoom out almost completely before starting
        // to pan.
        speed: 0.4, // make the flying slow
        curve: 1, // change the speed at which it zooms out
         
        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing: function (t) { return t; }
    });
});

document.getElementById("flyToCity").addEventListener("click", function () {
    map.flyTo({
        center: {lng: 114.3026726037915, lat: 30.55203276613814},//综合效果好的那一块儿
        zoom: indoorThresholdZoom-0.2,
        bearing: 0,
        pitch:60,
        speed: 0.4, 
        curve: 1, 
        easing: function (t) { return t; }
    });
});

document.getElementById("flyToIndoor").oncontextmenu = function(e){ //切换至会场室内场景
    e.preventDefault();
    map.flyTo({
        center: [114.3376438605311, 30.55727525507318],
        zoom: 20,
        bearing: 0,
        pitch:60,
        speed: 0.2, 
        curve: 1, 
        easing: function (t) { return t; }
    });
};

document.getElementById("flyToIndoor").addEventListener("click", function (e) {
    map.flyTo({
        center: positions.wuhan,//{ lng: 114.33280771545384, lat: 30.55882902416495 },
        zoom: 18,
        bearing: 80,
        pitch:60,
        speed: 0.2, 
        curve: 1, 
        easing: function (t) { return t; }
    });
});

//控制字城市区域控制面板的自适应显示隐藏 大于海洋的zoom且室内地图不显示
map.on("move",function(e){
    //checkCity();
});

const oceanThresholdZoom = 8;//zoomForEachScale[0];

function checkCity() { 
    //有时候室内场景没显示在屏幕中间，这时候还是应该出现城市的控制面板
    // var features = map.queryRenderedFeatures({ layers: [indoorTransparentName] });
    // var haveIndoor = false;
    // if (features.length > 0) {
    //     haveIndoor = true;
    // }
    
    var cityMenu = document.getElementById("menu");
    if (map.getZoom() > oceanThresholdZoom) {//&&!haveIndoor
        cityMenu.style.display = "block";
    } else { 
        cityMenu.style.display = "none";
    }
}