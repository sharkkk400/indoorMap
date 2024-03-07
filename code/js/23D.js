//*****二三维混搭，近的显示三维，远的显示二维（不显示3D建筑），中间渐变过渡*****//

//过渡首先是建筑高度逐渐变为0，再是透明度逐渐变为0
var _23DLayerName;//当前正在二三维混搭显示的图层名
document.getElementById("23D").addEventListener("change", function () {
    if (this.checked === true) {
        //TODO判断是否能二三维混搭
        //map.zoomTo(17.1);放得越大二三维混搭效果越明显     
        // var features = map.queryRenderedFeatures({ layers: [_23DLayerName] });
        // if (!features.length) {
        //     alert("当前位置没有显示建筑物，无法实现二三维混搭");
        //     return;
        // }
        changeHeightOpacityVisibility();
        map.on('move', changeHeightOpacityVisibility);
    } else {
        map.removeLayer("opacityTransitionLayer");        
        map.off('move', changeHeightOpacityVisibility);
        for (var i = 0; i < zoomForEachScale.length-1; i++) { 
            map.setFilter("shanghai_L" + (9 - i), null);
            map.setPaintProperty("shanghai_L" + (9 - i), "fill-extrusion-height", extrusionHeight);
        }
    }
});

//地图移动或缩放时，调整过渡地带的建筑物的高度和透明度，隐藏远处建筑 可以改成根据坐标filter来提高速度，前提bearing=0
function changeHeightOpacityVisibility() {
    //获取当前显示的三维建筑图层
    var levelNow = getLevelNow();
    var cityNow = "shanghai"//TODO getCityNow();
    _23DLayerName = cityNow + "_L" + levelNow;

    //第一次要添加透明度渐变的过渡图层，缩放时若跨越级别，要删掉重新添加
    if (map.getLayer("opacityTransitionLayer")&&map.getLayer("opacityTransitionLayer").source !== _23DLayerName) {
        map.removeLayer("opacityTransitionLayer");
    }
    if (!map.getLayer("opacityTransitionLayer")) { 
        map.addLayer({
            'id': 'opacityTransitionLayer',
            'type': 'fill',
            'source': _23DLayerName,
            'source-layer':_23DLayerName,
            //TODO去获取对应的fill-extrusion图层并动态设置
            'paint': {
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'height'],
                    0, 'rgb(255,255,191)',
                    75, 'rgb(253,174,97)',
                    150, "rgb(215,25,28)",
                ],
            }
        })
    }    

    //获取当前视窗范围内本应显示的所有建筑
    var features = map.querySourceFeatures(_23DLayerName, { sourceLayer: _23DLayerName });
    var uniqueFeatures=getUniqueFeatures(features,'id');    
    
    //setfeaturestate必须要feature.id，修改geoserver后，仍有少部分要素缺少feature.id
    uniqueFeatures.forEach((feature) => { 
        if (isNaN(feature.id)) { 
            feature.id=feature.properties.id+1;
            //console.log(feature);
        }           
    });

    var _3dFilteredId = ["in", "id"];
    var _2dFilteredId = ["in", "id"];
    
    //通过featurestate修改每栋建筑的高度和透明度，通过filter隐藏远处的建筑
    uniqueFeatures.forEach((feature) => {
        var { heightScale, opacity } = compute23DScale(feature);
        if (heightScale > 0) { 
            var height = feature.properties.height * heightScale;
            map.setFeatureState({ source: _23DLayerName, sourceLayer:_23DLayerName, id: feature.id }, { height: height });
            _3dFilteredId.push(feature.properties.id);
        }
        map.setFeatureState({ source: _23DLayerName, sourceLayer:_23DLayerName, id: feature.id }, { opacity: opacity });
        if (opacity > 0) { 
            _2dFilteredId.push(feature.properties.id);//本来opactiy为0就已经不显示了，但实测有问题，还是要filter掉
        }
    });
    
    map.setFilter(_23DLayerName, _3dFilteredId);
    map.setFilter("opacityTransitionLayer", _2dFilteredId);
    map.setPaintProperty(_23DLayerName, "fill-extrusion-height", ["*",5,["feature-state", "height"]]);
    map.setPaintProperty("opacityTransitionLayer", "fill-opacity", ["feature-state", "opacity"]);
}

//计算过渡地带三维建筑物的缩放比例和二维建筑的透明度，依据是建筑到窗口下边沿的距离占整个窗口高度的比例
function compute23DScale(feature) {
    // var polygon = turf.polygon(feature.geometry.coordinates);
    // var centroid = turf.centroid(polygon).geometry.coordinates;
    var centroidMercator = [feature.properties.x, feature.properties.y];//用提前处理好的
    var centroid = toWGS84(centroidMercator);
    var screenPoint = map.project(centroid);
    var scale = 1 - screenPoint.y / map._containerDimensions()[1];
    var heightScale = heightTransition(scale);
    var opacityScale = opacityTransition(scale);
    return {
        heightScale: heightScale,
        opacity:opacityScale
    };
}

//近的三维，真实高度，过渡地带高度逐渐降低接近0
function heightTransition(x) {
    if (x >= 0.6) {
        return 0;
    } else if (x <= 0.4) {
        return 1;
    } else { 
        return -5 * x + 3;
    }
}

//透明度从1过渡到0 TODO应该动态获取3d建筑的透明度，从该透明度过渡到0
function opacityTransition(x) { 
    if (x > 0.6 && x < 0.7) {
        return -10 * x + 7;
    } else { 
        return 0;
    }
}

function getUniqueFeatures(array, comparatorProperty) {
    var existingFeatureKeys = {};
    var uniqueFeatures = array.filter(function(el) {
        if (existingFeatureKeys[el.properties[comparatorProperty]]) {
            return false;
        } else {
            existingFeatureKeys[el.properties[comparatorProperty]] = true;
            return true;
        }
    });
    return uniqueFeatures;
}

//测试，待删除
// map.on('click', 'opacityTransitionLayer', function(e) {
//     var features = map.queryRenderedFeatures(e.point);
//     console.log(features[0]);
// });

// map.on('click', 'shanghai_L3', function(e) {
//     var features = map.queryRenderedFeatures(e.point);
//     console.log(features[0]);
// });

//****************导航animation用于展示二三维混搭、多尺度混搭的效果*******************//
// document.getElementById("direction-control").addEventListener('change', function () {
//     if (this.checked) {
//         var directions=new MapboxDirections({
//             accessToken: mapboxgl.accessToken
//         });
//         map.addControl(directions, 'top-right');
//     } else { 
//         map.removeControl(directions);
//     }
// });

//坐标拾取器 仅供测试用
// map.on('click',function(e){
// 	var point=[e.lngLat.lng,e.lngLat.lat];
// 	console.log(point);	
// });