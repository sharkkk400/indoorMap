//*******所有与海洋相关的一些通用的**********/

//地图缩放到了全球尺度就展示海洋的控制面板
map.on("move",function(e){
    checkOcean();
});

function checkOcean() { 
    // var features = map.queryRenderedFeatures({ layers: ["continent"] });
    var oceanMenu = document.getElementById("ocean-menu");
    if (map.getZoom() < oceanThresholdZoom) {
        oceanMenu.style.display = "block";
    } else { 
        oceanMenu.style.display = "none";
    }
}

//添加大陆图层 遮住流到大陆上的洋流粒子，画到大陆上的海温标量场等
function addContinent(){    
    if (map.getSource('continent') == undefined) {
        map.moveLayer('water', 'landcover');
        map.moveLayer('water-shadow', 'water');

        map.addSource('continent', {
            'type': 'vector',
            'scheme': 'tms',
            'tiles': ['http://'+Config.host+'/geoserver/gwc/service/tms/1.0.0/general%3Acontinent@EPSG:900913@pbf/{z}/{x}/{y}.pbf']
        });

        var landColor=map.getPaintProperty('land', 'background-color');
        map.addLayer({
            'id': 'continent',
            'source': 'continent',
            'source-layer': 'continent',
            'type': 'fill',
            'minzoom': 0,
            'maxzoom': 22,
            'paint': {
                'fill-color':landColor
            }
        },'landcover');
    }
}

function removeContinent(){
    if (map.getLayer("continent")){
        map.removeLayer("continent");
    }
    if (map.getSource("continent")){
        map.removeSource("continent");
    }
}

//*************洋流的初始化和添加、删除、控制****************** */
//TODO 一开始就展示洋流的话室内地图会变得很透明 可能与洋流canvas有关

//海洋要俯视的角度看
function toOrtho() {
    if (map.getPitch() != 0) {
        map.setPitch(0);
    }
    if (map.getBearing() != 0) {
        map.setBearing(0);
    }
}

(function () {
    Config.dataPath = "http://oceanread.com/output";//数据路径 在山科大的服务器上
    Config.currentTime = "2021121704";//当前时间 2019052308的数据用不了了

    var mapCanvas = map.getCanvas();

    var mCanvas = document.getElementById("animation");
    mCanvas.width = mapCanvas.width;
    mCanvas.height = mapCanvas.height;

    var _data = [];

    var _windy;

    document.getElementById("current").addEventListener("click",function(){
        if (this.checked) {//显示洋流
            toOrtho();
            if (!_windy) {
                mCanvas.style.display="block";
                addLayer();
                return;
            }
            mCanvas.style.display="block";
            //下面这两个是表现洋流特征的图层 因为没有提取新洋流数据的特征 暂时注释掉
            // map.setLayoutProperty("label", 'visibility', 'visible');
            // map.setLayoutProperty("picture", 'visibility', 'visible');
        }else{//隐藏洋流
            mCanvas.style.display="none";
            //同上
            // map.setLayoutProperty("label", 'visibility', 'none');
            // map.setLayoutProperty("picture", 'visibility', 'none');
            removeContinent();
        }
    })

    /**初始化windy对象
     * */
    function initWindy() {
        _windy = new Windy({
            bubblingMouseEvents: true,
            canvas: mCanvas,//画布
            displayValues: true,
            data: _data,//数据
            zindex: 10,
            displayOptions: {
                velocityType: 'Global Wind'
            },
            maxVelocity: 10,//最大值,用于限制颜色的
            mapContainer: map
        });
    }

    /**添加图层
     * */
    function addLayer() {
        initWindy();
        ctx = mCanvas.getContext("2d");
        setTimeout(function () {

            _windy.calculateImgData();//启动绘制流程
            bindEvent();
        }, 750);
        addContinent();
        //addCurrentBaseLayer();
    }

    function addCurrentBaseLayer() {
        //特征提取 添加底图和注记 是用2019052308的数据提取的 现在这个数据没了 所以不展示特征
        // map.addSource('picture',{
        //     type: 'image',
        //     url: './ocean/ocean.png',
        //     coordinates: [
        //         [-180.7,85],
        //         [179.3, 85],
        //         [179.3, -85],
        //         [-180.7,-85]
        //     ]
        // });

        // map.addLayer({
        //     "id":"picture",
        //     "type":"raster",
        //     "source":"picture",
        //     "paint": {"raster-opacity": 1.0}
        // }, "continent");     
        
        // map.addSource("currents",{
        //     type:"geojson",
        //     data:"./ocean/current.geojson",
        //     // "cluster": true,
        //     // "clusterRadius": 50,
        // });
        
        // //添加注记
        // map.addLayer({
        //     "id": "label",
        //     "type": "symbol",
        //     "source": "currents",
        //     "layout": {
        //         "text-field": "{name}",
        //         "text-size": 17,
        //     },
        //     "paint": {
        //         "text-color": "#c2ceff",
        //     }
        // },"continent");

        //特征提取tiff底图 wms
        // map.addLayer({
        //     'id': 'picture',
        //     'type': 'raster',
        //     'source': {
        //         'type': 'raster',
        //         'tiles': [
        //             'http://'+Config.host+'/geoserver/general/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&LAYERS=general%3Afeatureextract&SRS=EPSG%3A3857&WIDTH=753&HEIGHT=768&BBOX={bbox-epsg-3857}'
        //         ],

        //         'tileSize': 256
        //     },
        //     'paint': {
        //         "raster-opacity": 1
        //     }
        // },"continent");

        // map.addLayer({
        //     id: "route",
        //     type: "line",
        //     source: "currents",
        //     layout: {
        //         'visibility': 'none',
        //         'line-join': 'round',
        //         'line-cap': 'round',
        //         'line-round-limit':10,
        //     },
        //     paint: {
        //         "line-color": "#ff0005",
        //         "line-width": 4
        //     }
        // });
    }

    /**重绘函数
     * */
    function reDraw() {
        mCanvas.width = mapCanvas.width;
        mCanvas.height = mapCanvas.height;
        _windy.clearCanvas();
        _windy.calculateImgData();

        //console.log(map.unproject([0, 0]));
    }
    
    /**事件绑定
     * 移动后重绘
     * */
    function bindEvent() {

        map.on("drag", function (e) {
            //图层随地图拖动移动  待完善
        });
        window.onresize = function () {
            reDraw();
        };
        map.on('moveend', reDraw);
        //map.on('zoomend', reDraw);
        map.on('movestart', _windy.clearCanvas);
    }

    /**取消事件绑定
     * */
    function unbindEvent() {
        map.off('moveend', reDraw);
        //map.off('zoomend', reDraw);
        map.off('movestart', _windy.clearCanvas);
    }

    /**移除图层
     * */
    function removeLayer() {
        unbindEvent();
        _windy.stop();
    }
})();
//});

//****************风场****************** */
(function () {
    //风场开关按钮
    document.getElementById("windfield").addEventListener("click", function () { 
        if (this.checked) {
            toOrtho();
            if (!_windy) {
                addLayer();
                mCanvas.style.display = "block";
                mCanvas.style.position = "absolute";
                return;
            }
            mCanvas.style.display = "block";
        } else { 
            mCanvas.style.display="none";
        }
    })

    var mapCanvas = map.getCanvas();

    var mCanvas = document.getElementById("windanimation");//在这个canvas上绘制风场
    mCanvas.width = mapCanvas.width;
    mCanvas.height = mapCanvas.height;
    
    //获取风场数据，这个是用的json的，也可以用uv图的
    var _data;
    $.ajaxSettings.async = false; // 同步
    $.getJSON("ocean/particleSys_G.json", function(data){
        _data = data;
    });
    
    _data[0].header.dx = _data[0].header.dy = 1;
    _data[1].header.dx = _data[1].header.dy = 1;

    var _windy;

    //绘制风场 移动、缩放等要重新绘制
    function _startWindy() {
        var size = map.getCanvas();
        var bounds = map.getBounds();
        var swLng = bounds.getSouthWest().lng;
        var swLat = bounds.getSouthWest().lat;
        var neLng = bounds.getNorthEast().lng;
        var neLat = bounds.getNorthEast().lat;

        swLng = swLng;
        swLat = swLat;
        neLng = neLng;
        neLat = neLat;

        //开始绘制，参数为([[0,0],[画布宽,画布高]],画布宽,画布高,[[西南角经度,西南角纬度],[东北角经度,东北角纬度]])
        _windy.start([[0, 0], [size.width, size.height]], size.width, size.height, [[swLng, swLat], [neLng, neLat]]);//开始绘制
    }

    /**初始化windy对象
     * */
    function initWindy() {
        var wzoom = map.getZoom();
        _windy = new Wind({
            bubblingMouseEvents: true,
            canvas: mCanvas,//画布
            displayValues: true,
            data: _data,//数据
            velocityScale: wzoom,
            zindex: 10,
            displayOptions: {
                velocityType: 'Global Wind'
            },
            maxVelocity: 14,//风速最大值,用于限制颜色的
            mapContainer: map
        });
    }

    /**添加图层
     * */
    function addLayer() {
        initWindy();
        ctx = mCanvas.getContext("2d");
        setTimeout(function () {
            _startWindy();//启动绘制流程
            bindEvent();
        }, 750);
    }

    /**重绘函数
     * */
    function reDraw() {
        addLayer();
        mCanvas.width = mapCanvas.width;
        mCanvas.height = mapCanvas.height;
        _windy.clearCanvas();
        _startWindy();
    }

    /**事件绑定
     * 移动后重绘
     * */
    function bindEvent() {

        map.on("drag", function (e) {
            //图层随地图拖动移动  待完善
        });
        window.onresize = function () {
            reDraw();
        }
        map.on('moveend', reDraw);
        //map.on('zoomend', reDraw);
        map.on('movestart', _windy.clearCanvas);
    }

    /**取消事件绑定
     * */
    function unbindEvent() {
        map.off('moveend', reDraw);
        //map.off('zoomend', reDraw);
        map.off('movestart', _windy.clearCanvas);
    }

    /**移除图层
     * */
    function removeLayer() {
        unbindEvent();
        _windy.stop();
    }
})();

//************气压等高线*********** */
document.getElementById("air-pressure").addEventListener("click",function(){
    if (this.checked){
        if (map.getSource("press")==undefined){
            map.addSource("press",{
                type:"geojson",
                data:"./ocean/press.json",
                // "cluster": true,
                // "clusterRadius": 50,
            });
            map.addLayer({
                id: "press",
                type: "line",
                source: "press",
                layout: {
                    'visibility': 'visible',
                    'line-join': 'round',
                    'line-cap': 'round',
                    'line-round-limit':10,
                },
                paint: {
                    "line-color": "#ff0005",
                    "line-width": 1
                }
            });
            //添加注记
            map.addLayer({
                "id": "presslabel",
                "type": "symbol",
                "source": "press",
                "layout": {
                    "text-field": "{value}",
                    "text-size": 10
                }
            });
        }
        else{
            map.setLayoutProperty("press", 'visibility', 'visible');
            map.setLayoutProperty("presslabel", 'visibility', 'visible');
        }
    }
    else{
        map.setLayoutProperty("press", 'visibility', 'none');
        map.setLayoutProperty("presslabel", 'visibility', 'none');
    }
})

//**********海温等标量场******* */
var seaTemLayer;
var seaTemUtil={
    reDraw:function reDraw(){
        seaTemLayer.getImageData();
        seaTemLayer.putCanvas();
    }
}
document.getElementById("seatem").addEventListener("click",function(){
    if (this.checked) {
        toOrtho();
        Config.ImgData = new Object();
        Config.rasterHeader = {
            startLon: 0,
            startLat: 90,
            scale: .25
        };
        Config.map=map;
        
        seaTemLayer=new ScalarLayer();
        seaTemLayer.texturepath="./ocean/temp_ocean_full.png";
        seaTemLayer._initCanvas();
        seaTemLayer.getImageData();
        addContinent();
        seaTemLayer.putCanvas();
        
        window.onresize = function () {
            reDraw();
        }
        map.on('moveend', seaTemUtil.reDraw);
        map.on('movestart', seaTemLayer.clearCanvas);       
    }
    else{
        document.body.removeChild(document.getElementById("scalarLayer"));
        document.body.removeChild(document.getElementById("scalarLabelLayer"));
        map.removeLayer("scalarLabelLayer");
        map.removeLayer("continent");
        map.removeLayer("scalarLayer");
        map.removeSource("scalarLabelLayer");
        map.removeSource("continent");
        map.removeSource("scalarLayer");

        //removeLayer();
        map.off('moveend', seaTemUtil.reDraw);//这个解除绑定似乎没起作用
        map.off('movestart', seaTemLayer.clearCanvas);
        removeContinent();
    }
})

//**********降水标量场******* */
var precipitationLayer;
var precipitationUtil={
    reDraw:function reDraw(){
        precipitationLayer.getImageData();
        precipitationLayer.putCanvas();
    }
}
document.getElementById("precipitation").addEventListener("click",function(){
    if (this.checked) {
        toOrtho();
        Config.ImgData = new Object();
        Config.rasterHeader = {
            startLon: 0,
            startLat: 90,
            scale: .25
        };
        Config.map=map;
        
        precipitationLayer=new RainLayer();
        precipitationLayer.texturepath="./ocean/apcp_G_full.png";
        precipitationLayer._initCanvas();
        precipitationLayer.getImageData();
        precipitationLayer.putCanvas();
        
        window.onresize = function () {
            reDraw();
        }
        map.on('moveend', precipitationUtil.reDraw);
        map.on('movestart', precipitationLayer.clearCanvas);       
    }
    else{
        document.body.removeChild(document.getElementById("scalarLayer"));
        document.body.removeChild(document.getElementById("scalarLabelLayer"));
        map.removeLayer("scalarLabelLayer");
        //map.removeLayer("continent");
        map.removeLayer("scalarLayer");
        map.removeSource("scalarLabelLayer");
        //map.removeSource("continent");
        map.removeSource("scalarLayer");

        //removeLayer();
        map.off('moveend', precipitationUtil.reDraw);
        map.off('movestart', precipitationLayer.clearCanvas);
    }
})

//**********气温标量场******* */
var temperatureLayer;
var temperatureUtil={
    reDraw:function reDraw(){
        temperatureLayer.getImageData();
        temperatureLayer.putCanvas();
    }
}
document.getElementById("temperature").addEventListener("click",function(){
    if (this.checked) {
        toOrtho();
        Config.ImgData = new Object();
        Config.rasterHeader = {
            startLon: 0,
            startLat: 90,
            scale: .25
        };
        Config.map=map;
        
        temperatureLayer=new TemperatureLayer();
        temperatureLayer.texturepath="./ocean/temp_atmo_G_full.png";
        temperatureLayer._initCanvas();
        temperatureLayer.getImageData();
        temperatureLayer.putCanvas();
        
        window.onresize = function () {
            reDraw();
        }
        map.on('moveend', temperatureUtil.reDraw);
        map.on('movestart', temperatureLayer.clearCanvas);       
    }
    else{
        document.body.removeChild(document.getElementById("scalarLayer"));
        document.body.removeChild(document.getElementById("scalarLabelLayer"));
        map.removeLayer("scalarLabelLayer");
        //map.removeLayer("continent");
        map.removeLayer("scalarLayer");
        map.removeSource("scalarLabelLayer");
        //map.removeSource("continent");
        map.removeSource("scalarLayer");

        //removeLayer();
        map.off('moveend', temperatureUtil.reDraw);
        map.off('movestart', temperatureLayer.clearCanvas);
    }
})

//**********海浪标量场+粒子******* */
//数据解析
// (function () {
    var testdataReal = [];
    var imagedata;
    calculateImageData();
    function calculateImageData() {
        var img = new Image();
        var imgdat;
        img.crossOrigin = "Anonymous";
        img.src = "./ocean/wave1.png";
        img.onload = function () {
            var can = document.createElement("canvas");
            can.width = img.width;
            can.height = img.height;
            var ImgdataCtx = can.getContext("2d");
            ImgdataCtx.drawImage(img, 0, 0);
            imgdat = ImgdataCtx.getImageData(0, 0, img.width, img.height).data;
            //console.log(imgdat);
            for (var i = 0; i < imgdat.length; i += 4) {
                var r = imgdat[i],//红色 u值
                    g = imgdat[i + 1],//绿色 v值
                    b = imgdat[i + 2],//蓝色 记录uv正负号
                    a = imgdat[i + 3];//透明度
                if (a === 0) {//透明
                    u = 0;
                    v = 0;
                } else if (a === 255) {
                    if (r === 0 && g === 0) {
                        r = Math.random() * 5;
                        g = Math.random() * 10;
                    }

                    if (b === 11) {//u,v大于等于0
                        r = Math.abs(r);//u正值
                        g = Math.abs(g);//v正值

                    } else if (b === 10) {//u大于等于0，v小于0
                        r = Math.abs(r);//u正值
                        g = -g;//v负值
                    } else if (b === 1) {//u小于0，v大于等于0
                        r = -r;//u负值
                        g = Math.abs(g);//v正值
                    } else if (b === 0) {//u,v小于0
                        r = -r;//u负值
                        g = -g;//v负值
                    }

                    var u = (r / 10) + 10;
                    var v = (g / 10) + 10;
                }
                testdataReal[0]['data'].push(u);
                testdataReal[1]['data'].push(v);
            }
        };

        testdataReal[0] = [];
        testdataReal[0]['header'] = [];
        testdataReal[0]['data'] = [];
        //header头文件信息
        testdataReal[0]['header']['parameterNumber'] = 2;
        testdataReal[0]['header']['lo1'] = 0.0;
        testdataReal[0]['header']['la1'] = 90.0;
        testdataReal[0]['header']['d'] = 1.0;
        testdataReal[0]['header']['nx'] = 360;
        testdataReal[0]['header']['ny'] = 181;
        testdataReal[0]['header']['lo2'] = 359.0;
        testdataReal[0]['header']['la2'] = -90;
        testdataReal[0]['header']['parameterName'] = "UGRD_WIND";

        testdataReal[1] = [];
        testdataReal[1]['header'] = [];
        testdataReal[1]['data'] = [];
        //header头文件信息
        testdataReal[1]['header']['parameterNumber'] = 3;
        testdataReal[1]['header']['lo1'] = 0.0;
        testdataReal[1]['header']['la1'] = 90.0;
        testdataReal[1]['header']['d'] = 1.0;
        testdataReal[1]['header']['nx'] = 360;
        testdataReal[1]['header']['ny'] = 181;
        testdataReal[1]['header']['lo2'] = 359.0;
        testdataReal[1]['header']['la2'] = -90;
        testdataReal[1]['header']['parameterName'] = "VGRD_WIND";
    }

    var mapCanvas = map.getCanvas();

    var mCanvas = document.getElementById("waveanimation");
    mCanvas.width = mapCanvas.width;
    mCanvas.height = mapCanvas.height;

    var _data = testdataReal;
    _data[0].header.dx = _data[0].header.dy = 1;
    _data[1].header.dx = _data[1].header.dy = 1;

    var _windy;

    // addLayer();
    //绘制风场
    function _startWindy() {
        var size = map.getCanvas();
        var bounds = map.getBounds();
        var swLng = bounds.getSouthWest().lng;
        var swLat = bounds.getSouthWest().lat;
        var neLng = bounds.getNorthEast().lng;
        var neLat = bounds.getNorthEast().lat;

        swLng = swLng;
        swLat = swLat;
        neLng = neLng;
        neLat = neLat;

        //开始绘制，参数为([[0,0],[画布宽,画布高]],画布宽,画布高,[[西南角经度,西南角纬度],[东北角经度,东北角纬度]])
        _windy.start([[0, 0], [size.width, size.height]], size.width, size.height, [[swLng, swLat], [neLng, neLat]]);//开始绘制
    }

    /**初始化windy对象
     * */
    function initWindy(zoom) {
        //console.log(zoom);
        _windy = new WindyWave({
            bubblingMouseEvents: true,
            canvas: mCanvas,//画布
            displayValues: true,
            data: _data,//数据
            zindex: 10,
            velocityScale:4-zoom,
            displayOptions: {
                velocityType: 'Global Wind'
            },
            maxVelocity: 10,//风速最大值,用于限制颜色的
            mapContainer: map
        });
    }

    var waveLayer;
    var waveUtil = {
        reDraw: function reDraw() {
            mCanvas.width = mapCanvas.width;
            mCanvas.height = mapCanvas.height;
            _windy.clearCanvas();
            zoom=map.getZoom();
            initWindy(zoom);
            ctx = mCanvas.getContext("2d");
            setTimeout(function () {
                _startWindy();//启动绘制流程
                //bindEvent();
            }, 750);

            waveLayer.getImageData();
            waveLayer.putCanvas();
        }
    }
    
    document.getElementById("wave").addEventListener("click", function () {
        if (this.checked) {
            toOrtho();
            Config.ImgData = new Object();
            Config.rasterHeader = {
                startLon: 0,
                startLat: 90,
                scale: .25
            };
            Config.map = map;

            waveLayer = new WaveLayer();
            waveLayer.texturepath = "./ocean/wave_G_full.png";
            waveLayer._initCanvas();
            waveLayer.getImageData();
            addContinent();
            waveLayer.putCanvas();

            var zoom=map.getZoom();
            //粒子
            initWindy(zoom);
            ctx = mCanvas.getContext("2d");
            setTimeout(function () {
                _startWindy();//启动绘制流程
                //bindEvent();
            }, 750);

            window.onresize = function () {
                reDraw();
            }
            map.on('moveend', waveUtil.reDraw);
            map.on('movestart', waveLayer.clearCanvas);
            map.on('movestart', _windy.clearCanvas);
        }
        else {
            document.body.removeChild(document.getElementById("scalarLayer"));
            document.body.removeChild(document.getElementById("scalarLabelLayer"));
            map.removeLayer("scalarLabelLayer");
            map.removeLayer("continent");
            map.removeLayer("scalarLayer");
            map.removeLayer("waveanimation");
            map.removeSource("scalarLabelLayer");
            map.removeSource("continent");
            map.removeSource("scalarLayer");
            map.removeSource("waveanimation");

            //removeLayer();
            map.off('moveend', waveUtil.reDraw);//这个解除绑定似乎没起作用
            map.off('movestart', waveLayer.clearCanvas);
            removeContinent();
        }
    })
// })()

// var oceanCbxs = document.getElementById("ocean-menu").getElementsByTagName("input");
// for (var i = 0; i < oceanCbxs.length; i++) { 
//     var cbx = oceanCbxs[i];
//     cbx.addEventListener("click", function () { 
//         if (this.checked == true) { 
            
//         }
//         for (var j = 0; j < oceanCbxs.length; j++) { 
//             if (j = i) continue;
//             otherCbx = oceanCbxs[j];
//             if (otherCbx.checked == true) { 
//                 otherCbx.click();
//             }
//         }
//     })
// }