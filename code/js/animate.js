//****轨迹数据动态可视化****//

const START_DATE = "2007-02-20 07:00:00";
const LOOP_LENGTH = 18000; // 单位s,轨迹中最长的时间
const LOOP_TIME = 100; // 单位s,所有轨迹循环一遍的时间 
var loop_time = 100;
// LOOP_LENGTH/loop_time即speed(动画运动一秒实际车辆行驶多长时间)180s/s

var isLoadBuildings = false;
var isLoadTrips = false;
var isAnimateTrips = false;
var isAnimateTrip = false;
// mapboxgl.accessToken = 'pk.eyJ1IjoibWVuZ2xiaiIsImEiOiJjajhmZWYyNzQwMDNyMzNvMXE4bTRtNm5kIn0.lZXi_nYkbgP2cOGBrE3wbg';

var geojson = {
    "type": "FeatureCollection",
    "features": []
};

var trips = []; // 原始数据数组,存储轨迹线对象的数组
var animatePoints = []; // 运动的点,存储连续5个时刻的轨迹点
var animateLines = []; // 运动的线 

var animateId;
var preTimestamp = 0;  // 将animate()函数中的timestamp导出(单位ms)
var preTimestamp1 = 0; // 记录速度变化后前一段运动的真实时间起点 暂停后再开始的时间起点(单位ms)
var preTimestampToStartDate = 0; // 记录上一点的timestampToStartDate,将timestampToStartDate导出(单位s)              
var preTimestampToStartDate1 = 0; // 记录速度变化后前一段时间的timestampToStartDate(单位s)

// var map = new mapboxgl.Map({
//     style:'mapbox://styles/mapbox/dark-v9',
//     center: [121.479891,31.23],
//     zoom: 10,
//     pitch: 45,
//     //bearing: -17.6,
//     //attributionControl:true,
//     //interactive: false,
//     container: 'map',
//     localIdeographFontFamily: "'Noto Sans', 'Noto Sans CJK SC', sans-serif"
// });

// map.addControl(new mapboxgl.FullscreenControl());
// map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {
    // document.getElementById('zoom-value').textContent = map.getZoom();
    loadLayers();
});

// 滚轮控制speed    
map.on('wheel', function() {
    // document.getElementById('zoom-value').textContent = map.getZoom();
    if(isLoadTrips && isAnimateTrips) {
        changeSliderValue(map.getZoom());
    }
});

document.getElementById("load-trips").addEventListener("click", function() {
    isLoadTrips = !isLoadTrips;
    
    if(isLoadTrips) {
        //document.getElementById("load-trips").innerHTML = "关闭轨迹";
        document.getElementById('trips').style.display = "block";
        //document.getElementById('trips-slider').disabled = true;
        var radios = document.getElementsByName('speed');
        for(var j = 0; j < radios.length; j++) {
            radios[j].disabled = true;
        }
        document.getElementById('trips-time-slider').disabled = true;
        document.getElementById('trips-width-slider').disabled = true;
        
        isAnimateTrips = false;
        document.getElementById('trips-btn').innerHTML = 'Start';

        document.getElementById('trips-btn').addEventListener('click', startAnimateTrips);
        //document.getElementById('trip-btn').addEventListener('click', startAnimateTrip);
        //document.getElementById('trips-slider').addEventListener('input', changeTripsSlider);
        document.getElementById('radios').addEventListener('click', changeTripsSpeed, false);
        document.getElementById('trips-time-slider').addEventListener('input', changeTripsTime);
        document.getElementById('trips-width-slider').addEventListener('input', changeTripsWidth);

        //document.getElementById('trips-btn').disabled = true;

        loadTrips();

        //document.getElementById('trips-btn').disabled = false;
    } else {
        trips.splice(0, trips.length); //如果不删为了保持颜色一样
        animatePoints.splice(0, animatePoints.length); 
        animateLines.splice(0, animateLines.length);

        map.getSource('line').setData(setPointData(animateLines));

        window.cancelAnimationFrame(animateId);

        document.getElementById("trips-btn").removeEventListener('click', startAnimateTrips);
        document.getElementById('radios').removeEventListener('click', changeTripsSpeed);
        document.getElementById('trips-time-slider').removeEventListener('input', changeTripsTime);
        document.getElementById('trips-width-slider').removeEventListener('input', changeTripsWidth);

        //document.getElementById("load-trips").innerHTML = "加载轨迹";
        document.getElementById('trips').style.display = "none";

        // 初始化trips面板
        loop_time = LOOP_TIME;
        document.getElementById('trips-time-slider').value = 0;
        document.getElementById('180').checked = 'checked';
        document.getElementById('trips-time-value').innerHTML = START_DATE;
        document.getElementById('trips-width-slider').value = 3.0;
        
        preTimestampToStartDate = 0; // 改变日期起点
    } 
});


// document.getElementById('load-buildings').addEventListener("click", function() {
//     isLoadBuildings = !isLoadBuildings;
//     if(isLoadBuildings){
//         loadBuildings();
//         document.getElementById('load-buildings').textContent = 'Unload Buildings';
//     } else {
//         removeBuildings();
//         document.getElementById('load-buildings').textContent = 'Load Buildings';
//     }
// })

function loadLayers() {
    // 通过线实现拖尾特效。添加线source，layer
    map.addSource('line', {
        "type": "geojson",
        "data": setLineData([]),
        "lineMetrics": true,
    });

    map.addLayer({
        "id": "line",
        "source": "line",
        "type": "line",
        "minzoom": 11,
        "maxzoom": 22,
        "layout": {
            "line-cap": "round",
        },
        "paint": {
            "line-color": ["get", "color"],
            "line-width": 2,
            'line-gradient': [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0, "rgba(255, 255, 255, .4)",
                1, "rgba(0, 0, 255, .6)",
            ],
        },
    },firstBuildingLayerId);

    // 添加building3D图层
    // for(var i=1;i<=9;i++){
    //     var xixi='L'+i.toString();
    //     var minLevel=16-0.5*i;
    //     var maxLevel=16.5-0.5*i;
    //     if(i==1){maxLevel=18}
    //     if(i==9){minLevel=10}
    //     map.addSource(xixi, constructSource(xixi));
    //     //map.addLayer(constructLayer(xixi,xixi,xixi,minLevel,maxLevel))//, firstSymbolId)
    // }    
}


function setPointData(points){
    geojson.features.splice(0, geojson.features.length);
    
    for(var i = 0; i < points.length; i++){
        
        var feature = {
            "type": "Feature",
            "properties": {
                "color": points[i].color,
                "index": points[i].index,
            },
            "geometry": {
                "type": "Point",
                "coordinates": points[i].point,
            }
        }
        geojson.features.push(feature);
    }
    return geojson;
};

function setLineData(lines){
    geojson.features.splice(0, geojson.features.length);
    
    for(var i = 0; i < lines.length; i++){
        
        var feature = {
            "type": "Feature",
            "properties": {
                "color": lines[i].color,
                "index": lines[i].index,
            },
            "geometry": {
                "type": "LineString",
                "coordinates": lines[i].points,
            },
        }
        geojson.features.push(feature);
    }
    return geojson;
};


// function constructSource(mySource){
//     return {
//         'type':'vector',
//             'scheme':'tms',
//             'tiles':['http://120.79.207.10:8090/geoserver/gwc/service/tms/1.0.0/moreLevel%3A'+mySource+'@EPSG:900913@pbf/{z}/{x}/{y}.pbf']
//     };
// }

// function constructLayer(myId,mySource,myLayer,myMin,myMax){
//     return {
//         'id': myId,
//         'source': mySource,
//         'source-layer': myLayer,
//         'type': 'fill-extrusion',
//         'minzoom': myMin,
//         'maxzoom': myMax,
//         'paint': {
//             'fill-extrusion-color': [//'rgb(74, 80, 87)',[
//                 'interpolate',
//                 ['linear'],
//                 ['get', 'height'],
//                 0, 'rgb(255,255,191)',
//                 75, 'rgb(253,174,97)',
//                 150, "rgb(215,25,28)",
//             ],
//             'fill-extrusion-height': ['get', 'height'],
//             'fill-extrusion-opacity': .8,
//         }
//     }
// }

// 时间戳转时间
function timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return Y+M+D+h+m+s;
}

function changePointSize(size) {
    map.setPaintProperty('point0', 'circle-radius', size);
    map.setPaintProperty('point1', 'circle-radius', size)
    map.setPaintProperty('point2', 'circle-radius', size)
    map.setPaintProperty('point3', 'circle-radius', size)
    map.setPaintProperty('point4', 'circle-radius', size)
}

function changeLineSize(size) {
    map.setPaintProperty('line', 'line-width', size);
}

// 滚轮wheel触发的事件, 改变速度，point大小
function changeSliderValue(zoom) {

    preTimestamp1 = preTimestamp;
    preTimestampToStartDate1 = preTimestampToStartDate;

    // if(zoom < 11) {
    //     loop_time = LOOP_TIME;
    //     document.getElementById('180').checked = 'checked';

    //     changeLineSize(3);  
    //     document.getElementById('trips-width-slider').value = 3;  
    //     document.getElementById('trips-width-value').innerHTML = 3.0;            
    // }
    if(zoom >= 11 && zoom < 13) {
        loop_time = LOOP_TIME * 2;
        document.getElementById('90').checked = 'checked';

        changeLineSize(5);
        document.getElementById('trips-width-slider').value = 5;
        document.getElementById('trips-width-value').innerHTML = 5.0;    
    }
    if(zoom >= 13 && zoom < 15) {
        loop_time = LOOP_TIME * 3;
        document.getElementById('60').checked = 'checked';

        changeLineSize(6);
        document.getElementById('trips-width-slider').value = 6; 
        document.getElementById('trips-width-value').innerHTML = 6.0;   
    }
    if(zoom >= 15 && zoom < 17) {
        loop_time = LOOP_TIME * 6;
        document.getElementById('30').checked = 'checked';

        changeLineSize(7);
        document.getElementById('trips-width-slider').value = 7; 
        document.getElementById('trips-width-value').innerHTML = 7.0;   
    }
    if(zoom >= 17) {
        loop_time = LOOP_TIME * 12;
        document.getElementById('15').checked = 'checked';

        changeLineSize(8);
        document.getElementById('trips-width-slider').value = 8;
        document.getElementById('trips-width-value').innerHTML = 8.0;    
    }
}

function loadTrips() {
    $.ajaxSettings.async = false; // 同步
    $.getJSON("data/7h-12hdeal2.txt", function(data)
    {
        data.forEach(function(pts, index) {  // pts代表一条轨迹线的点
            var pathPoints = {}; // 一条轨迹线的点对象
            pathPoints.color = "";
            pathPoints.points = [];
            pathPoints.id = "";

            var red = parseInt(Math.random() * 255); //parseInt(10 + 245 * (index / tarr.length));
            var green = parseInt(Math.random() * 255);
            var blue = parseInt(Math.random() * 255); 
            var color = "rgb(" + red + "," + green + "," + blue + ")";
            pathPoints.color = color;

            for (var i = 0; i < pts.length; i++) {
                pathPoints.id = pts[i].carID;

                var lon1 = pts[i].lon;
                var lon = parseFloat(lon1);
                var lat1 = pts[i].lat;
                var lat = parseFloat(lat1);

                var startTime = new Date(START_DATE).getTime();
                var time = new Date(pts[i].time).getTime();
                var betweenTime = (time - startTime) / 1000; // 单位s
                
                pathPoints.points.push([lon, lat, betweenTime]);
            }
            trips.push(pathPoints);
        });
        data.splice(0, data.length);
    })
}

// function loadBuildings() {
//     for(var i=1;i<=9;i++){
//         var xixi='L'+i.toString();
//         var minLevel=16-0.5*i;
//         var maxLevel=16.5-0.5*i;
//         if(i==1){maxLevel=18}
//         if(i==9){minLevel=10}
//         map.addLayer(constructLayer(xixi,xixi,xixi,minLevel,maxLevel))//, firstSymbolId)
//     }    
// }

// function removeBuildings() { 
//     for(var i=1;i<=9;i++){
//         var xixi='L'+i.toString();
//         var minLevel=16-0.5*i;
//         var maxLevel=16.5-0.5*i;
//         if(i==1){maxLevel=18}
//         if(i==9){minLevel=10}
//         map.removeLayer(xixi);
//     }    
// }

// 根据zoom设置distance
function setDistance(zoom) {
    if(zoom < 11) {
        return 0.001
    }
    if(zoom >= 11 && zoom < 12) {
        return 0.001;
    }
    if(zoom >= 12 && zoom < 13) {
        return 0.0005;
    }
    if(zoom >= 13 && zoom < 14) {
        return 0.0001;
    }
    if(zoom >= 14 && zoom < 15) {
        return 0.00001;
    }
    if(zoom >= 15 && zoom < 16) {
        return 0.00001;
    }
    if(zoom >= 16) {
        return 0.00005;
    }
}

var thresholdX = 1 / window.innerWidth;
var thresholdY = 1 / window.innerHeight;
var threshold = 1 / Math.sqrt(window.innerHeight * window.innerHeight + window.innerWidth * window.innerWidth);
function animateTrips() {
    
    // 以两个相邻timestamp的点连成线
    function animate(timestamp) {  // timestamp(ms)
        var deltaTimestamp = timestamp - preTimestamp1; 
        if(deltaTimestamp > 0) {
            // console.log(timestamp);
            // console.log(deltaTimestamp);
            var deltaTimestampToStartDate = deltaTimestamp / 1000 * (LOOP_LENGTH / loop_time);
            var timestampToStartDate = preTimestampToStartDate1 + deltaTimestampToStartDate;
        
            timestampToStartDate = timestampToStartDate % LOOP_LENGTH;
        
            var date = timestampToTime(new Date(START_DATE).getTime() + timestampToStartDate * 1000);
            
            document.getElementById("trips-time-value").innerHTML = date;

            document.getElementById('trips-time-slider').value = (timestampToStartDate / 60);
            
            // -------animate line
            animateLines.splice(0, animateLines.length);
            
            for(var j = 0; j < trips.length; j++){
                for(var k = 0; k < trips[j].points.length; k++){

                    if(trips[j].points[0][2] > timestampToStartDate){
                        break;
                    }

                    if(trips[j].points[trips[j].points.length - 1][2] < timestampToStartDate){
                        break;
                    }

                    if(trips[j].points[k][2] < timestampToStartDate){
                        continue;
                    }

                    if(trips[j].points[k][2] > timestampToStartDate){
                        
                        var point1 = [];
                        if(preTimestampToStartDate < trips[j].points[0][2]){
                            point1.push(trips[j].points[0][0]);
                            point1.push(trips[j].points[0][1]);
                        } else {
                            for(var m = k - 1; m > 0; m--) {
                                if(trips[j].points[m][2] < preTimestampToStartDate ) {

                                    var deltaX = trips[j].points[m + 1][0] - trips[j].points[m][0];
                                    var deltaY = trips[j].points[m + 1][1] - trips[j].points[m][1];
                                    var ratio = (preTimestampToStartDate - trips[j].points[m][2]) / (trips[j].points[m + 1][2] - trips[j].points[m][2]);
                            
                                    point1.push(trips[j].points[m][0] + deltaX * ratio);
                                    point1.push(trips[j].points[m][1] + deltaY * ratio);

                                    break;
                                }
                            }
                        }

                        var point2 = [];
                        var deltaX = trips[j].points[k][0] - trips[j].points[k - 1][0];
                        var deltaY = trips[j].points[k][1] - trips[j].points[k - 1][1];
                        
                        var ratio = (timestampToStartDate - trips[j].points[k - 1][2]) / (trips[j].points[k][2] - trips[j].points[k - 1][2]);
                    
                        point2.push(trips[j].points[k - 1][0] + deltaX * ratio);
                        point2.push(trips[j].points[k - 1][1] + deltaY * ratio);

                        deltaS = Math.sqrt((point2[0] - point1[0]) * (point2[0] - point1[0]) + (point2[1] - point1[1]) * (point2[1] - point1[1]));
                        deltaSLonLat = Math.sqrt((map.getBounds().getEast() - map.getBounds().getWest()) * (map.getBounds().getEast() - map.getBounds().getWest()) + (map.getBounds().getNorth() - map.getBounds().getSouth()) * (map.getBounds().getNorth() - map.getBounds().getSouth()));
                        if(deltaS / deltaSLonLat < threshold) {
                            var ratio = (threshold * deltaSLonLat) / deltaS;
                            var deltaX = ratio * (point2[0] - point1[0]);
                            var deltaY = ratio * (point2[1] - point1[1]);

                            point1.splice(0, point1.length);
                            point1.push(point2[0] - deltaX);
                            point1.push(point2[1] - deltaY);
                        }
                        
                        var line = {};
                        line.color = "";
                        line.points = [];

                        line.index = j;
                        line.color = trips[j].color;
                        line.points.push(point1);
                        line.points.push(point2);

                        animateLines.push(line);
                        break;
                    }
                }
            }

            map.getSource('line').setData(setLineData(animateLines));
        
            preTimestampToStartDate = timestampToStartDate;
            preTimestamp = timestamp;
            
        } 
        animateId = requestAnimationFrame(animate);
        
    }

    animate(window.performance.now());
}

// 点击trips-btn触发,渲染全部轨迹线
function startAnimateTrips() {
    isAnimateTrips = !isAnimateTrips;

    if(isAnimateTrips){
        
        preTimestamp1 = window.performance.now(); // 改变真实时间起点
        preTimestampToStartDate1 = preTimestampToStartDate; // 改变日期起点
       
        animateTrips();
        var radios = document.getElementsByName('speed');
        for(var j = 0; j < radios.length; j++) {
            radios[j].disabled = false;
        }
        document.getElementById('trips-btn').innerHTML = "stop";
        document.getElementById('trips-time-slider').disabled = false;
        document.getElementById('trips-width-slider').disabled = false;
    } else {
        window.cancelAnimationFrame(animateId);

        var radios = document.getElementsByName('speed');
        for(var j = 0; j < radios.length; j++) {
            radios[j].disabled = true;
        }
        document.getElementById('trips-btn').innerHTML = "start";
        document.getElementById('trips-time-slider').disabled = true;
        document.getElementById('trips-width-slider').disabled = true;
    }
}

function changeTripsSpeed(e) {
    // 改变参数
    preTimestamp1 = preTimestamp;
    preTimestampToStartDate1 = preTimestampToStartDate;

    loop_time = LOOP_TIME * (180 / e.target.value);
}

function changeTripsTime(e) {
    // 改变参数
    preTimestamp1 = preTimestamp;
    preTimestampToStartDate1 = e.target.value * 60;

    preTimestampToStartDate = preTimestampToStartDate1;
}

function changeTripsWidth(e) {
    map.setPaintProperty('line', 'line-width', parseFloat(parseFloat(e.target.value).toFixed(1)));
    document.getElementById('trips-width-value').innerHTML = parseFloat(e.target.value).toFixed(1);   
}