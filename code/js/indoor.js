//*************室内地图部分****************//
//开始显示室内地图的zoomlevel 建筑物有L9-L1 对应的L2、L1开始都显示室内地图
const indoorThresholdZoom=16;//截图不需要室内的时候可以调整 正常是-3 -1就是一直不出现了

//室内地图尺度变换发生的zoomlevel
const indoorZoomForEachScale=[indoorThresholdZoom,indoorThresholdZoom+0.2,indoorThresholdZoom+0.4,indoorThresholdZoom+0.6,indoorThresholdZoom+0.8];

//所有室内地图对象（MapboxIndoor类的对象）存储在这里 例如万达广场、创意城
var mapboxIndoors={};

//每个室内地图对应一个div显示，这些div全放到下面创建的这个div中，室内地图以集成到mapbox地图中，这些div不作为单独窗口显示。必须要有div，否则会用整个body。
var indoorMapDivContainer=document.createElement('div');
indoorMapDivContainer.id="indoorMapDivContainer";
document.body.appendChild(indoorMapDivContainer);

const indoorLayerName="indoor";
const indoorTransparentName=indoorLayerName+"Transparent";//透明图层 用于判断楼层控制按钮的显示 缩放到有室内地图的地方就显示楼层控制按钮等

map.on('load',function(){
    map.addSource(indoorLayerName,{
        'type': 'geojson',
        'data':'data/indoor.geojson'//所有包含室内地图的建筑物构成的图层
    });   
    
    //添加透明图层 用于判断楼层控制按钮的显示
    map.addLayer(constructLayer(indoorTransparentName, indoorLayerName, '', indoorThresholdZoom, 22, 0));//透明度0
    
    //添加室内地图 geojson文件中每个建筑物的属性数据包含了对应室内地图的相关信息 根据它初始化室内地图
    $.getJSON("data/indoor.geojson",function(data){
        data.features.forEach(feature=>{
            var fileName = feature.properties.fileName;
            //if (fileName.indexOf("wanda") == -1) return;//这次演示为了性能其他室内建筑就不展示了
            var format=feature.properties.format;
            var theme=feature.properties.theme;
            var position={
                lon:feature.properties.lon,
                lat:feature.properties.lat,
                angle:feature.properties.angle,
                scale:feature.properties.scale,
            }
            //根据以上的参数 新建一个室内地图
            var indoor=new MapboxIndoor(fileName,format,window[theme],position);
            mapboxIndoors[fileName]=indoor;
        });
    });
})

map.on("move",function(e){
    checkIndoorMap();
});

//判断现在画面中的室内地图，显示其楼层控制按钮。根据mapbox地图的zoomlevel切换室内地图的尺度，包括背景框架和poi点的尺度变换。
function checkIndoorMap(){    
    var features = map.queryRenderedFeatures({ layers: [indoorTransparentName] });
    //如果当前视图中没有包含室内地图的建筑那么就不显示楼层控制按钮，也不用做尺度变换
    if (features.length===0){
        for (var i in mapboxIndoors){
            mapboxIndoors[i].hideUL();
        }
        return;
    }
    //如果当前视图中有包含室内地图的建筑那么就要显示其对应的楼层控制按钮
    var features=getUniqueFeatures(features,"fileName");//当前视图中的建筑
    var level=checkZoom(indoorZoomForEachScale);//检查是否发生层次跨越 返回当前应该用的层级 L1-L4
    if (features.length==1){//简单情况，只包含一个室内地图
        var feature=features[0];
        var fileName=feature.properties.fileName;
        mapboxIndoors[fileName].showUL();
        generalize(mapboxIndoors[fileName],level);
    }
    else{//复杂情况，包含多个室内地图，离地图中心点最近的建筑显示其楼层控制按钮，这几个室内地图都要做尺度变换
        var centermostName,minimumDistance=Infinity;
        var mapCenter=map.getCenter();
        features.forEach(feature=>{
            var fileName=feature.properties.fileName;
            //计算地图中心到各个建筑中心的距离
            var buildingCenter=mapboxIndoors[fileName].threeboxIndoor.coordinate;
            var from = turf.point([mapCenter.lng, mapCenter.lat]);
            var to = turf.point([buildingCenter[0], buildingCenter[1]]);
            var distance = turf.distance(from, to);
            //找到最中心的那个
            if (distance<minimumDistance){
                minimumDistance=distance;
                centermostName=fileName;
            }
            generalize(mapboxIndoors[fileName],level);
        });
        //最中心的那栋室内地图显示楼层控制按钮
        for (var i in mapboxIndoors){
            mapboxIndoors[i].hideUL();
        }
        mapboxIndoors[centermostName].showUL();
    }

    //对室内地图对象，根据level，进行综合
    function generalize(mapboxIndoor,level){
        mapboxIndoor.keepSpriteSize();//根据当前尺度改变poi符号的大小使得不管怎么缩放大小都不变
        mapboxIndoor.updateSprites();//POI点连续、在线综合
        
        if (level==-1) return;
        mapboxIndoor.indoorMap.showSpecificLevelData(level);//离线综合 根据mapbox地图的尺度来做室内地图的尺度变换
    }    
}

//检查是否发生数据层次的跨越，如果是，则返回当前level（level1最详细）,否，则返回-1 
var queueZoom = [map.getZoom(), map.getZoom()];
function checkZoom(thresholdList){//各level对应zoom的数组
    var zoom = map.getZoom();
    queueZoom.shift();
    queueZoom.push(zoom);
    for (var i=0;i<thresholdList.length;i++){
        var threshold=thresholdList[i];
        if (queueZoom[1] < threshold && queueZoom[0] > threshold) {//缩小 跨过阈值
            if (i===0) return -1;//跨到显示范围外了
            return thresholdList.length-1-(i-1);
        }
        else if (queueZoom[1] > threshold && queueZoom[0] < threshold) {//放大 跨过阈值 
            if (i===thresholdList.length-1) return 0;//这里特殊处理 室内地图的墙当成level0
            return thresholdList.length-1-i;
        }
    }
    return -1;
}

//mapbox中的室内地图 类
class MapboxIndoor{
    //初始化一个three.js场景中的室内地图，再加载到mapbox中
    constructor(fileName,format,theme,position){
        this.ul=null;//楼层控制按钮
        this.menu = null;//控制菜单 POI点的出现、隐藏
        this.poiSize = 1;//默认值 这里设置方便动态调整 TODO 真正实际使用应该改成set函数
        this.poiOcuppiedSpace = 30;//单位px 一个POI占据的空间，越大就综合掉越多 方便动态调整
        //创建室内地图的容器（隐藏的）
        var indoorMapDiv=document.createElement("div");
        document.getElementById("indoorMapDivContainer").appendChild(indoorMapDiv);
        indoorMapDiv.id=Math.random().toString();
        //室内地图初始化
        var params = {
            dim: "3d",
            mapDiv:indoorMapDiv.id
        };
        this.indoorMap = IndoorMap(params);
        this.indoorMap.mapboxIndoor=this;
        //异步加载数据并获取object3d
        var _this=this;
        this.indoorMap.load('data/'+fileName, format, theme, function(){
            _this.indoorMap.showAreaNames(false).showPubPoints(false);
            //添加室内地图到mapbox中并设置显示的级别范围
            var object3d=_this.indoorMap.mall.root;//所有的object3d（楼层房间等等）都在root这个group object3d下，直接把root从three.js场景迁到mapbox中
            _this.threeboxIndoor=new ThreeboxIndoor(fileName,position,object3d,_this.indoorMap);
            //map.addLayer(new ThreeJSIndoor(fileName,lon,lat,angle,scale,object3d));
            map.addLayer(_this.threeboxIndoor);//custom layer
            map.setLayerZoomRange(fileName, indoorThresholdZoom, 22);
        });
    }

    //显示所有菜单
    showUL(){
        if (this.ul==null){
            this.ul = IndoorMap.getUL(this.indoorMap,map);
            document.body.appendChild(this.ul);//是在mapbox的那个窗口里加
            this.menu=IndoorMap.getMenu(this.indoorMap,map);
            document.body.appendChild(this.menu);
            // this.setting=IndoorMap.getSetting(this.indoorMap);//这是写论文截图用的 用户自适应 其实是自己勾选
            // document.body.appendChild(this.setting); 
        }
        this.ul.style.display="block";
        this.menu.style.display="block";
        //this.setting.style.display="block";
    }

    //隐藏所有菜单
    hideUL(){
        if (this.ul){
            this.ul.style.display="none";
        }
        if (this.menu){
            this.menu.style.display="none";
        }
        // if (this.setting){
        //     this.setting.style.display="none";
        // }
    }

    //维持POI大小在缩放时不变
    keepSpriteSize(){
        const largestScale = 4600*this.poiSize;//4600//4194304;//scale的最大值 是否sizeattenuation不一样
        //mapbox地图放大时，threebox的world也会放大，放大倍数就是map.transform.scale，要把它消掉
        //threebox中world的scale（decompose后，实际是矩阵表示）= map.transform.scale     
        var scale=largestScale/map.transform.scale/2;

        this.indoorMap.mall.floors.forEach(floor=>{
            if (floor.POIs){
                floor.POIs.children.forEach(poi=>{                
                    poi.scale.set(scale,scale,scale);
                });
            }                       
        });
    }

    showAllSprites() {//测试用，实际不会全都显示 要visible和select都设为true才可以
        this.indoorMap.mall.floors.forEach(floor=>{
            if (floor.POIs){
                floor.POIs.children.forEach(poi=>{                
                    poi.visible = true;
                });
            }                       
        });
    }

    //根据冲突处理poi符号的尺度变换
    updateSprites() {
        //console.time("POI");//测试综合算法效率
        this.indoorMap.mall.floors.forEach(floor=>{
            //先选出用户选中的poi类别，只对这些处理
            var spritelist=[];
            if (!floor.POIs) return;
            for(var i = 0 ; i < floor.POIs.children.length; i++){
                var sprite = floor.POIs.children[i];
                if (sprite.selected==false){
                    sprite.visible=false;//用户没选择要显示的类别就先不显示
                    continue;
                }else{
                    spritelist.push(sprite);
                }
            }
            //按权重排序，权重大的优先显示，现在是按面积
            spritelist.sort(function (a, b) {
                if (a.properties.priority > b.properties.priority ) {
                    return -1;
                }
                if (a.properties.priority < b.properties.priority ) {
                    return 1;
                }
                return 0;
            });

            //遍历，处理冲突
            for(var i = 0 ; i < spritelist.length; i++){
                var sprite = spritelist[i];
                //计算sprite的屏幕坐标
                var vec = new THREE.Vector3();
                vec.setFromMatrixPosition( sprite.matrixWorld );
                vec.project(this.threeboxIndoor.threebox.camera);
                
                //计算sprite的屏幕大小//sizeAttenuation情况下sprite的大小是距离相机为1时的大小//再计算出world的缩放比例即可
                //不会计算就先用一个固定的值替代，反正目前符号都基本一样大
                var imgSize=this.poiOcuppiedSpace;

                var x = Math.round(vec.x * map.transform.width/2);//todo map这个变量放到类里比直接用这个全局变量好
                var y = Math.round(vec.y * map.transform.height/2);
                sprite.screenPosition={x:x,y:y};

                //check collision with the former sprites
                var visible = true;
                var visibleMargin = 5;
                for(var j = 0; j < i; j++){
                    var imgWidthHalf1 = imgSize / 2;
                    var imgHeightHalf1 = imgSize / 2;
                    var rect1 = new Rect(sprite.screenPosition.x - imgWidthHalf1, sprite.screenPosition.y - imgHeightHalf1,
                        sprite.screenPosition.x + imgHeightHalf1, sprite.screenPosition.y + imgHeightHalf1 );

                    var sprite2 = spritelist[j];
                    var sprite2Pos = sprite2.screenPosition;
                    var imgWidthHalf2 = imgSize / 2;
                    var imgHeightHalf2 = imgSize / 2;
                    var rect2 = new Rect(sprite2Pos.x - imgWidthHalf2, sprite2Pos.y - imgHeightHalf2,
                            sprite2Pos.x + imgHeightHalf2, sprite2Pos.y + imgHeightHalf2 );

                    if(sprite2.visible && rect1.isCollide(rect2)){
                        visible = false;
                        break;
                    }

                    rect1.tl[0] -= visibleMargin;
                    rect1.tl[1] -= visibleMargin;
                    rect2.tl[0] -= visibleMargin;
                    rect2.tl[1] -= visibleMargin;


                    if(sprite.visible == false && rect1.isCollide(rect2)){
                        visible = false;
                        break;
                    }
                }
                sprite.visible = visible;
            }
        })
        //console.timeEnd("POI");
    }
}

//用threebox往mapbox中加载室内地图
class ThreeboxIndoor {
    constructor(id,position,object3d,indoorMap) {
        this.id = id;
        this.type = 'custom';
        this.renderingMode='3d';
        this.coordinate=[position.lon,position.lat,0];
        this.scale=position.scale;
        this.object3d=object3d;//这个是关键，indoor3d中的root    
        this.indoorMap=indoorMap;
    }

    onAdd(map, gl) {
        this.threebox = new Threebox(map, gl,{
            defaultLights: true, 
            passiveRendering:false //让它一直渲染，楼层抽出来等要用到
        });

        //新版本threebox添加室内地图
        this.object3d=this.threebox.Object3D({obj: this.object3d, units:'meters'})
            .setCoords(this.coordinate)
        this.threebox.add(this.object3d);
        //用threebox把three.js中的场景加到mapbox后，x轴向左，y轴向外，z轴向上，要旋转一下
        var root=this.threebox.world.children[1];
        root.rotation.set(-Math.PI/2,0,-Math.PI);
        //缩放比例严格来说应该是10，因为解析模型的时候scale是0.1
        //注意不能直接设，因为经过threebox的处理本来已经有了一个很小的scale的值 也可以考虑直接改root的scale，目前是0.1
        root.scale.x*=this.scale;
        root.scale.y*=this.scale;
        root.scale.z*=this.scale;
        
        //坐标轴辅助线
        // var axes = new THREE.AxesHelper(100);
        // this.threebox.addAtCoordinate(axes, this.coordinate);
        // axes.parent.rotation.set(-Math.PI/2,0,-Math.PI);
        // axes.parent.scale.x*=this.scale;
        // axes.parent.scale.y*=this.scale;
        // axes.parent.scale.z*=this.scale;           
    }

    render(gl, matrix) {
        //更新到1.3版本的mapbox之后需要加这一行 否则会threebox的场景会出现在建筑物的下面 在threebox的github issue里找到的这个解决方案        
        //gl.clear(gl.DEPTH_BUFFER_BIT);
        //this.threebox.update(false);
        this.threebox.update();
    }
}

//threejs中的室内地图模型
class ThreeJSIndoor {
    constructor(id,lon,lat,angle,scale,object3d) {
        this.id = id;
        this.type = 'custom';
        this.renderingMode = '3d';
        
        //放置的位置、角度、大小等
        var translate = this.fromLL(lon,lat);
        this.transform = {
            translateX: translate[0],
            translateY: translate[1],
            translateZ: 0.0000000,
            rotateX: Math.PI / 2,
            rotateY: angle/180*Math.PI,
            rotateZ: 0,
            scale: scale
        }

        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        this.scene.add(object3d);

        // show axes in the screen
        var axes = new THREE.AxesHelper(100);
        this.scene.add(axes);

        //light
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-500, 500, -500);
        this.scene.add(light);

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(500, 500, 500);
        this.scene.add(light);
    }

    onAdd(map, gl) {
        this.map = map;
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias:true,
            precision:"highp"
        });
        this.renderer.autoClear = false;
    }

    render(gl, matrix) {
        const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), this.transform.rotateX);
        const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), this.transform.rotateY);
        const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), this.transform.rotateZ);

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4().makeTranslation(this.transform.translateX, this.transform.translateY, this.transform.translateZ)
            .scale(new THREE.Vector3(this.transform.scale, -this.transform.scale, this.transform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }

    // converts from WGS84 Longitude, Latitude into a unit vector anchor at the top left as needed for GL JS custom layers
    fromLL(lon,lat) {
        // derived from https://gist.github.com/springmeyer/871897
        var extent = 20037508.34;

        var x = lon * extent / 180;
        var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * extent / 180;

        return [(x + extent) / (2 * extent), 1 - ((y + extent) / (2 * extent))];
    }
}

//抽屉抽出来的动画，后面还可以加其他动画全都在这里控制 todo不要单独写个循环，集成到已经有的renderer里
// function animate(time) {
//     requestAnimationFrame(animate);
//     TWEEN.update(time);
// }
// requestAnimationFrame(animate);

//测试性能
// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

function animate(time) {

	// stats.begin();

    // monitored code goes here
    TWEEN.update(time);

    // stats.end();
    
    //stats.update();

	requestAnimationFrame( animate );

}

requestAnimationFrame(animate);

// //地图缩放时的性能
// map.on("move", function () {
//     stats.update();
// });

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

map.on("load", function () {
    map.addSource("conferenceVenue", {
        type: "geojson",
        data: "./data/conferenceVenue.geojson"
    });
    map.addLayer({
        id: "conferenceVenue",
        source: "conferenceVenue",
        type: "fill-extrusion",
        paint: {
            "fill-extrusion-opacity": 0.0,
            "fill-extrusion-height": 2
        }
    });
    map.on('click', 'conferenceVenue', function (e) {
        var div=document.createElement("div");
        div.id = "conferenceVenue";
        div.style.cssText = "width:600px;height:695px;position:absolute;left:50%;top:50%;margin-left:-300px;margin-top:-347.5px";
        div.style.backgroundColor = "#f2f2f2";
        document.body.appendChild(div);
        div.innerHTML = "<iframe src='conference-venue.html' style='width:600px;height:695px;'></iframe>";

        var close = document.createElement("div");
        close.innerText = "×";
        close.style.cssText = "position:absolute;right:0px;top:0px";
        close.onclick = function () {
            var div = document.getElementById("conferenceVenue");
            document.body.removeChild(div);
        }
        div.appendChild(close);
    });

})

//写论文截图
// map.on("click",function () { 
//     document.getElementById("navmenu").style.display="none";
//     document.getElementById("menu").style.display="none";
//     document.getElementById("symbolControlPanel").style.display = "none";
//     //document.getElementsByClassName("mapboxgl-ctrl mapboxgl-ctrl-attrib")[0].style.display = "none";
//     //document.getElementsByClassName("mapboxgl-ctrl-logo")[0].style.display = "none";
//     document.getElementsByClassName("mapboxgl-ctrl mapboxgl-ctrl-group")[0].style.display = "none";
//     document.getElementsByClassName("floorsUI")[0].style.display="none";
//     document.getElementsByClassName("indoorsetting")[0].style.display="none";
//     document.getElementsByClassName("indoormenu")[0].style.display="none";
// }) 

// map.on("dblclick", function () { 
   
// })

// //测试代码 截图用的
// map.on("load", function () { 
//     var testDiv = document.createElement("div");
//     testDiv.style.cssText = "position:absolute;bottom:20px;right:20px;";
//     testDiv.id = "testPanel";
    
//     var testBtn1 = document.createElement("button");
//     testBtn1.innerText = "显示注记";
//     testBtn1.onclick = function () { 
//         mapboxIndoors["wanda/main.json"].indoorMap.showLegend();
//     }

//     var testBtn2 = document.createElement("button");
//     testBtn2.innerText = "隐藏面板";
//     testBtn2.onclick = function () { 
//         document.getElementById("navmenu").style.display="none";
//         document.getElementById("menu").style.display="none";
//         document.getElementsByClassName("floorsUI")[0].style.display="none";
//         document.getElementsByClassName("indoorsetting")[0].style.display="none";
//         document.getElementsByClassName("indoormenu")[0].style.display="none";
//         document.getElementById("symbolControlPanel").style.display = "none";
//         document.getElementsByClassName("mapboxgl-ctrl mapboxgl-ctrl-attrib")[0].style.display = "none";
//         document.getElementsByClassName("mapboxgl-ctrl-logo")[0].style.display = "none";
//         document.getElementsByClassName("mapboxgl-ctrl mapboxgl-ctrl-group")[0].style.display = "none";
//         //document.getElementById("testPanel").style.display="none";
//     }
    
//     testDiv.appendChild(testBtn1);
//     testDiv.appendChild(testBtn2);
//     document.body.appendChild(testDiv);
// })

function zoom0() { 
    map.flyTo({
        center: { lng: 114.33499178452416, lat: 30.559144635586563 },
        zoom: 15.5,
        bearing: 80,
        pitch:60,
        speed: 0.2, 
        curve: 1, 
        easing: function (t) { return t; }
    });
}

function zoom1() { 
    map.flyTo({
        center: { lng: 114.33499178452416, lat: 30.559144635586563 },
        zoom: 15.7,
        bearing: 80,
        pitch:60,
        speed: 0.2, 
        curve: 1, 
        easing: function (t) { return t; }
    });
}

function zoom2() { 
    map.flyTo({
        center: { lng: 114.33499178452416, lat: 30.559144635586563 },
        zoom: 16.199999999999996,
        bearing: 80,
        pitch:60,
        speed: 0.2, 
        curve: 1, 
        easing: function (t) { return t; }
    });
    setTimeout(function () { 
        mapboxIndoors["wanda/main.json"].indoorMap.mall.floors.forEach(floor => { 
            floor.POIs.children.forEach(sprite => { 
                if (!sprite.symbol) return;
                sprite.material.map.needsUpdate = true;
            })
        })   
    },50)
}

function zoom3() { 
    map.flyTo({
        center: { lng: 114.33499178452416, lat: 30.559144635586563 },
        zoom: 16.57,
        bearing: 80,
        pitch:60,
        speed: 0.2, 
        curve: 1, 
        easing: function (t) { return t; }
    });
}

//添加旗子表示室内场所 不好处理和建筑物上下关系
// map.on("load",function(){
//     var positions = {
//         conference: [114.3376438605311, 30.55727525507318],
//         // wanda: [113.258713, 23.128997],
//     };

//     var indoorCoordinates = [];
//     for (var key in positions) { 
//         indoorCoordinates.push(positions[key]);
//     }

//     map.addSource("indoorFlags", {
//         "type": "geojson",
//         "data": {
//             "type": "MultiPoint",
//             "coordinates": indoorCoordinates
//         }
//     });    
//     map.addLayer({
//         "id": "indoorFlags",
//         "source": "indoorFlags",
//         "type": "symbol",
//         "maxzoom":22,
//         "minzoom":11,
//         "layout": {
//             "icon-image": "embassy-15",
//             "icon-rotation-alignment": "map",
//             "icon-size":2
//         }
//     });
// })