var value_dis //测距数据显示
var distanceContainer = document.getElementById('distance');
var layerlist = ['poi1', 'poi2', 'poi3', 'poi4', 'poi5', 'poi6', 'poi7', 'poi8']
var click_type = 0; //地图点击功能类型
var disgeojson = {
    'type': 'FeatureCollection',
    'features': []
};
// Used to draw a line between points
var linestring = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
};
//测量面积画图工具初始化
var draw_area = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    },
    defaultMode: 'draw_polygon'
});
//拉框查询初始化变量*4
var query_rect_canvas;
// Variable to hold the starting xy coordinates
// when `mousedown` occured.
var query_rect_start;
// Variable to hold the current xy coordinates
// when `mousemove` or `mouseup` occurs.
var query_rect_current;
// Variable for the draw box element.
var query_rect_box;

map.on('load', function() {
    map.addSource('poi', {
        "type": "geojson",
        "data": "./data/poi.geojson"
    });
    //popuop图层
    map.addLayer({
        'id': 'counties-highlighted',
        'type': 'circle',
        'source': 'poi',
        // 'source-layer': 'original',
        "paint": {
            'circle-radius': 0,
            'circle-color': '#000'
        },
    }, );


    // map.addSource('geojson', {
    //     'type': 'geojson',
    //     'data': geojson
    // });
    //添加图标
    map.loadImage(
        './img/estate.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('estate', image);
        }
    );

    map.loadImage(
        './img/hotel.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('hotel', image);
        }
    );

    map.loadImage(
        './img/company.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('company', image);
        }
    );

    map.loadImage(
        './img/shopping.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('shopping', image);
        }
    );

    map.loadImage(
        './img/food.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('food', image);
        }
    );

    map.loadImage(
        './img/service.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('service', image);
        }
    );

    map.loadImage(
        './img/entertainment.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('entertainment', image);
        }
    );

    map.loadImage(
        './img/gov.png',
        function(error, image) {
            if (error) throw error;
            map.addImage('gov', image);
        }
    );


});

function clickfunction1(e) {
    // set bbox as 5px reactangle area around clicked point
    var bbox = [
        [e.point.x - 0.1, e.point.y - 0.1],
        [e.point.x + 0.1, e.point.y + 0.1]
    ];
    var features = map.queryRenderedFeatures(bbox, {
        layers: ['poi1', 'poi2', 'poi3', 'poi4', 'poi5', 'poi6', 'poi7', 'poi8']
    });
    var poiname = features[0].properties["name"]
    var tag1 = features[0].properties["tag1"]
    var address = features[0].properties["address"]
    var telephone = features[0].properties["telephone"]
    filling_text = "<div id=\"popup_info\">name:" + poiname + "</div><div id=\"popup_info\">type:" + tag1 + "</div><div id=\"popup_info\">address:" + address + "</div>";
    if (telephone != "null") {
        filling_text += "<div id=\"popup_info\">telephone:" + telephone + "</div>"
    }
    if (features.length != 0) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(filling_text)
            .addTo(map);
    }
}


// Run through the selected features and set a filter
// to match features with unique FIPS codes to activate
// the `counties-highlighted` layer.
// var filter = features.reduce(
//     function(memo, feature) {
//         memo.push(feature.properties["name"]);
//         map.flyTo({ center: feature.geometry.coordinates });
//         new mapboxgl.Popup()
//             .setLngLat(e.lngLat)
//             .setHTML(feature.properties["name"])
//             .addTo(map);
//         return memo;
//     }, ['in', 'name']
// );
// map.setFilter('counties-highlighted', filter);

//测距函数 mapclick
function clickfunction2(e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['measure-points']
    });

    // Remove the linestring from the group
    // So we can redraw it based on the points collection
    if (disgeojson.features.length > 1) disgeojson.features.pop();

    // Clear the Distance container to populate it with a new value
    distanceContainer.innerHTML = '';

    // If a feature was clicked, remove it from the map
    if (features.length) {
        var id = features[0].properties.id;
        disgeojson.features = disgeojson.features.filter(function(point) {
            return point.properties.id !== id;
        });
    } else {
        var point = {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [e.lngLat.lng, e.lngLat.lat]
            },
            'properties': {
                'id': String(new Date().getTime())
            }
        };

        disgeojson.features.push(point);
    }

    if (disgeojson.features.length > 1) {
        linestring.geometry.coordinates = disgeojson.features.map(
            function(point) {
                return point.geometry.coordinates;
            }
        );

        disgeojson.features.push(linestring);

        valuedis = document.createElement('pre');
        valuedis.textContent =
            'Total distance: ' +
            turf.length(linestring).toLocaleString() +
            'km';
        distanceContainer.appendChild(valuedis);
    }
    map.getSource('geojson').setData(disgeojson);
}
//测面积函数 mapclick
function updateArea(e) {
    var data = draw_area.getAll();
    distanceContainer.innerHTML = '';
    // var answer = document.getElementById('calculated-area');
    if (data.features.length > 0) {
        var area = turf.area(data);
        // restrict to area to 2 decimal points
        var rounded_area = Math.round(area * 100) / 100;
        // distanceContainer.innerHTML =
        //     '<p><strong>' +
        //     rounded_area +
        //     '</strong></p><p>square meters</p>';
        valuedis = document.createElement('pre');
        valuedis.textContent =
            'Total area: ' +
            rounded_area +
            '㎡';
        distanceContainer.appendChild(valuedis);
    }
}
//移除map click 监听
function removemaplistener() {
    if (click_type == 1) {
        map.off('click', clickfunction1);
    } else if (click_type == 2) {
        map.removeLayer('measure-points')
        map.removeLayer('measure-lines')
        map.removeSource('geojson');
        disgeojson = {
            'type': 'FeatureCollection',
            'features': []
        };
        linestring = {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        };
        if (distanceContainer.hasChildNodes()) {
            distanceContainer.removeChild(valuedis);
        }
        map.off('click', clickfunction2);

    } else if (click_type == 3) {
        map.removeControl(draw_area)
            //map.addControl(draw);
        draw_area = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true
            },
            defaultMode: 'draw_polygon'
        });
        if (distanceContainer.hasChildNodes()) {
            distanceContainer.removeChild(valuedis);
        }
        map.off('draw.create', updateArea);
        map.off('draw.delete', updateArea);
        map.off('draw.update', updateArea);
    }

}
//测距按钮点击函数
function measure_dis(e) {
    if (e.innerText == "测距") {
        map.addSource('geojson', {
            'type': 'geojson',
            'data': disgeojson
        });

        map.addLayer({
            id: 'measure-points',
            type: 'circle',
            source: 'geojson',
            paint: {
                'circle-radius': 5,
                'circle-color': '#000'
            },
            filter: ['in', '$type', 'Point']
        });
        map.addLayer({
            id: 'measure-lines',
            type: 'line',
            source: 'geojson',
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': '#000',
                'line-width': 2.5
            },
            filter: ['in', '$type', 'LineString']
        });
        removemaplistener();
        map.on('click', clickfunction2);
        click_type = 2;
        e.innerText = "停止测距"
    } else {
        removemaplistener();
        click_type = 0;
        // map.on('click', clickfunction1);
        e.innerText = "测距"
    }
}
//侧面积按钮点击函数
function measure_area(e) {
    if (e.innerText == "测面积") {
        map.addControl(draw_area);
        map.on('draw.create', updateArea);
        map.on('draw.delete', updateArea);
        map.on('draw.update', updateArea);
        removemaplistener()
        click_type = 3;
        e.innerText = "停止测面积"
    } else if (e.innerText == "停止测面积") {
        removemaplistener();
        click_type = 0;
        // map.on('click', clickfunction1);
        e.innerText = "测面积"

    }
}
//统计
function search_byrect(e) {
    if (e.innerText == "统计") {
        query_rect_canvas = map.getCanvasContainer()
        query_rect_canvas.addEventListener('mousedown', mouseDown, true);
        map.boxZoom.disable();
        addpoilayer()
            // Create a popup, but don't add it to the map yet.
        var popup = new mapboxgl.Popup({
            closeButton: false
        });
        //map.on('mousemove', mousemove(e));
        e.innerText = "停止统计"
    } else if (e.innerText == "停止统计") {
        removepoilayer()
        query_rect_canvas.removeEventListener('mousedown', mouseDown, true);
        e.innerText = "统计"
        map.boxZoom.enable();
        finish();
    }
}

function addpoilayer() {
    if (map.getLayer("poi1") != undefined) {
        return;
    }
    map.addLayer({
        'id': 'poi1',
        'type': 'symbol',
        'source': 'poi',
        'layout': {
            'icon-image': 'estate',
            'icon-size': 0.15,
        },
        'filter': ['==', 'tag1', '房地产']
    }, labelLayerId);
    map.addLayer({
        'id': 'poi2',
        'type': 'symbol',
        'source': 'poi',
        'layout': {
            'icon-image': 'hotel',
            'icon-size': 0.1,
        },
        'filter': ['==', 'tag1', '酒店']
    }, labelLayerId);
    map.addLayer({
        'id': 'poi3',
        'type': 'symbol',
        'source': 'poi',
        'layout': {
            'icon-image': 'company',
            'icon-size': 0.1,
        },
        'filter': ['==', 'tag1', '公司企业']
    }, labelLayerId);
    map.addLayer({
        'id': 'poi4',
        'type': 'symbol',
        'source': 'poi',
        'layout': {
            'icon-image': 'shopping',
            'icon-size': 0.1,
        },
        'filter': ['==', 'tag1', '购物']
    }, labelLayerId);
    map.addLayer({
        'id': 'poi5',
        'type': 'symbol',
        'source': 'poi',
        'layout': {
            'icon-image': 'food',
            'icon-size': 0.1,
        },
        'filter': ['==', 'tag1', '美食']
    }, labelLayerId);
    map.addLayer({
        'id': 'poi6',
        'type': 'symbol',
        'source': 'poi',
        'layout': {
            'icon-image': 'service',
            'icon-size': 0.1,
        },
        'filter': ['==', 'tag1', '生活服务']
    }, labelLayerId);
    map.addLayer({
        'id': 'poi7',
        'type': 'symbol',
        'source': 'poi',
        'layout': {
            'icon-image': 'entertainment',
            'icon-size': 0.1,
        },
        'filter': ['==', 'tag1', '休闲娱乐']
    }, labelLayerId);
    map.addLayer({
        'id': 'poi8',
        'type': 'symbol',
        'source': 'poi',
        'layout': {
            'icon-image': 'gov',
            'icon-size': 0.1,
        },
        'filter': ['==', 'tag1', '政府机构']
    }, labelLayerId);
}

function removepoilayer() {
    if (map.getLayer("poi1") == undefined) {
        return;
    }
    map.removeLayer("poi1")
    map.removeLayer("poi2")
    map.removeLayer("poi3")
    map.removeLayer("poi4")
    map.removeLayer("poi5")
    map.removeLayer("poi6")
    map.removeLayer("poi7")
    map.removeLayer("poi8")
}

function poi_info(e) {
    if (e.innerText == "poi信息显示") {
        e.innerText = "停止poi信息显示"
        addpoilayer();
        removemaplistener();
        click_type = 1;
        map.on('click', clickfunction1);
    } else if (e.innerText == "停止poi信息显示") {
        removemaplistener();
        removepoilayer()
        click_type = 0;
        e.innerText = "poi信息显示"
    }
}

function mousePos(e) {
    var rect = query_rect_canvas.getBoundingClientRect();
    return new mapboxgl.Point(
        e.clientX - rect.left - query_rect_canvas.clientLeft,
        e.clientY - rect.top - query_rect_canvas.clientTop
    );
}

function mouseDown(e) {
    // Continue the rest of the function if the shiftkey is pressed.
    if (!(e.shiftKey && e.button === 0)) return;
    // Disable default drag zooming when the shift key is held down.
    map.dragPan.disable();
    // Call functions for the following events
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    // Capture the first xy coordinates
    query_rect_start = mousePos(e);
}

function onMouseMove(e) {
    // Capture the ongoing xy coordinates
    query_rect_current = mousePos(e);

    // Append the box element if it doesnt exist
    if (!query_rect_box) {
        query_rect_box = document.createElement('div');
        query_rect_box.classList.add('boxdraw');
        query_rect_canvas.appendChild(query_rect_box);
    }

    var minX = Math.min(query_rect_start.x, query_rect_current.x),
        maxX = Math.max(query_rect_start.x, query_rect_current.x),
        minY = Math.min(query_rect_start.y, query_rect_current.y),
        maxY = Math.max(query_rect_start.y, query_rect_current.y);

    // Adjust width and xy position of the box element ongoing
    var pos = 'translate(' + minX + 'px,' + minY + 'px)';
    query_rect_box.style.transform = pos;
    query_rect_box.style.WebkitTransform = pos;
    query_rect_box.style.width = maxX - minX + 'px';
    query_rect_box.style.height = maxY - minY + 'px';
}

function onMouseUp(e) {
    // Capture xy coordinates
    finish([query_rect_start, mousePos(e)]);
}

function onKeyDown(e) {
    // If the ESC key is pressed
    if (e.keyCode === 27) finish();
}

function finish(bbox) {
    // Remove these events now that finish has been called.
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('mouseup', onMouseUp);

    if (query_rect_box) {
        query_rect_box.parentNode.removeChild(query_rect_box);
        query_rect_box = null;
    }

    // If bbox exists. use this value as the argument for `queryRenderedFeatures`
    if (bbox) {
        var features = map.queryRenderedFeatures(bbox, {
            layers: ['counties-highlighted']
        });
        // alert(features.length)

        if (features.length >= 1000) {
            return window.alert('Select a smaller number of features');
        }
        if (features.length <= 20) {
            return window.alert('请选择足够数量的要素进行统计');
        }
        var feature_len = features.length / 2;
        //种类统计 数据
        var type_xdata = [0, 0, 0, 0]
        var type_xaxis = ["购物", "酒店", "美食", "生活服务"];
        for (i = 0; i < feature_len; i++) {
            //features[i].properties[""]
            switch (features[i].properties['tag1']) {
                case '购物':
                    type_xdata[0]++;
                    break;
                case '酒店':
                    type_xdata[1]++;
                    break;
                case '美食':
                    type_xdata[2]++;
                    break;
                case '生活服务':
                    type_xdata[3]++;
                    break;
                default:
            }
        }
        var type_xdata1 = []
        for (i = 0; i < 4; i++) {
            type_xdata1.push({ value: type_xdata[i], name: type_xaxis[i] })
        }

        //评分统计数据
        var dic = new Array();
        var ra;
        var rating_xdata = []
        var rating_xaxis = [];
        for (i = 0; i < feature_len; i++) {
            if (features[i].properties['overall_ra'] != "null") {
                ra = (features[i].properties['overall_ra']).toString();
                if (dic.hasOwnProperty(ra)) {
                    dic[ra]++;
                } else {
                    dic[ra] = 0;
                }
            }
        }
        var res = Object.keys(dic).sort();
        for (var key in res) {
            // console.log("key: " + res[key] + " ,value: " + dic[res[key]]);
            rating_xdata.push(dic[res[key]]);
            rating_xaxis.push(res[key])
        }
        var popupOffsets = {
            'bottom': [0, -100],
        };
        new mapboxgl.Popup({ offset: [0, -300], maxWidth: "450px" })
            .setLngLat(map.getCenter())
            .setHTML("<div id=\"statistics_result\"></div>")
            .addTo(map);
        var myChart = echarts.init(document.getElementById('statistics_result'));


        // 指定图表的配置项和数据
        var option = {
            title: {
                text: '统计信息'
            },
            tooltip: {
                // trigger: 'axis',
                // position: function(pt) {
                //     return [pt[0], '10%'];
                // }
            },
            legend: {
                data: ['种类统计', '评分统计'],
                selectedMode: 'single',
                // bottom: 5,
            },
            xAxis: {
                name: "评分",
                data: type_xaxis,
                "show": false,
                "axisLine": { //x轴
                    "show": false
                },
                "axisTick": { //x轴刻度线
                    "show": false
                },
                "splitLine": { //网格线
                    "show": false
                }
            },
            yAxis: {
                name: "数量",
                "show": false,
                "axisLine": { //y轴
                    "show": false
                },
                "axisTick": { //y轴刻度线
                    "show": false
                },
                "splitLine": { //网格线
                    "show": false
                }
            },
            series: [{
                name: '种类统计',
                type: 'pie',
                data: type_xdata1,
                radius: ['30%', '50%'],
                avoidLabelOverlap: false,
                // itemStyle: {
                //     borderRadius: 10,
                //     borderColor: '#fff',
                //     borderWidth: 2
                // },
                label: {
                    alignTo: 'edge',
                    minMargin: 5,
                    edgeDistance: 10,
                    //formatter: '{name|{b}}\n{time|{c} 小时}',
                    lineHeight: 15,
                    rich: {
                        time: {
                            fontSize: 10,
                            color: '#999'
                        }
                    }
                },
                // emphasis: {
                //     label: {
                //         show: true,
                //         fontSize: '40',
                //         fontWeight: 'bold'
                //     }
                // },
                labelLine: {
                    show: true,
                    length: 15,
                    length2: 0,
                    maxSurfaceAngle: 80
                },
                labelLayout: function(params) {
                    var isLeft = params.labelRect.x < myChart.getWidth() / 2;
                    var points = params.labelLinePoints;
                    // Update the end point.
                    points[2][0] = isLeft ?
                        params.labelRect.x :
                        params.labelRect.x + params.labelRect.width;

                    return {
                        labelLinePoints: points
                    };
                }
            }, {
                name: '评分统计',
                type: 'bar',
                smooth: true,
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                    color: 'rgb(117, 207, 24)'
                },
                data: rating_xdata
            }, ]
        }

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        myChart.on('legendselectchanged', function(obj) {
            var name = obj.name;
            var option = myChart.getOption();
            // var a = 1;
            if (name == '种类统计') {
                // option.xAxis[0].data = type_xaxis;
                option.xAxis[0]['show'] = false;
                option.xAxis[0]['axisLine']['show'] = false
                option.xAxis[0]['axisTick']['show'] = false
                option.yAxis[0]['splitLine']['show'] = false
                option.yAxis[0]['show'] = false;
                option.yAxis[0]['axisLine']['show'] = false
                option.yAxis[0]['axisTick']['show'] = false
                option.yAxis[0]['splitLine']['show'] = false

            } else if (name == '评分统计') {
                option.xAxis[0]['show'] = true;
                option.xAxis[0]['axisLine']['show'] = true
                option.xAxis[0]['axisTick']['show'] = true
                option.yAxis[0]['splitLine']['show'] = true
                option.yAxis[0]['show'] = true;
                option.yAxis[0]['axisLine']['show'] = true
                option.yAxis[0]['axisTick']['show'] = true
                option.yAxis[0]['splitLine']['show'] = true
                option.xAxis[0].data = rating_xaxis;
                option.yAxis[0].data = rating_xdata;
                // option.xAxis[0].name = "评分"
                // option.yAxis[0].name = "数量"
            }
            // } else if (name == '90天') {
            //     option.xAxis[0].data = data_5;
            // }
            myChart.setOption(option, true);

        });

    }

    map.dragPan.enable();
}