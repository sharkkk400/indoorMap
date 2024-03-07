//********三维动态符号清单列表，选择、预览符号，配置到场景中，改变符号参量********//

//控制符号面板的显示隐藏
// document.getElementById("toggleSymbolPanel").addEventListener("click", function () { 
//     var div = this.parentNode;
//     if (this.innerText == "▶") {
//         this.innerText="◀";
//         div.style.right="-200px";
//     }
//     else{
//         this.innerText="▶";
//         div.style.right="0px";
//     }
// })

// document.getElementById("symbolControl").addEventListener("click", function () { 
//     var div = this.parentNode;
//     if (this.innerText == "▶") {
//         this.innerText="◀";
//         div.style.right="-200px";
//     }
//     else{
//         this.innerText="▶";
//         div.style.right="0px";
//     }
// })

var previewingSymbol=null;//正在预览的符号，后面添加的时候就是添加这个

//预览符号，就是往一个three.js的场景里加符号
function previewSymbol(path) {
    //如果已有在展示的符号，先删掉
    var div = document.getElementById("symbolPreview");
    if (div.hasChildNodes()) { 
        div.removeChild(div.firstChild);
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, div.clientWidth / div.clientHeight, 0.1, 1000);

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x515176);
    renderer.setSize( div.clientWidth, div.clientHeight );
    div.appendChild( renderer.domElement );

    var controls = new THREE.OrbitControls( camera,renderer.domElement );
    controls.target.set( 0, -0.2, -0.2 );//要注意OrbitControl版本问题，indoor3D的版本和threebox版本
    controls.update();

    //在animate函数里还要用的变量
    var clock = new THREE.Clock();
    var mixer;
    var model;
    
    // model
    if (path.endsWith("gltf")) {
        var loader = new THREE.GLTFLoader();
        loader.load(path, function (gltf) {
            if (gltf.animations[0]){//有些符号不是动态的
                mixer = new THREE.AnimationMixer(gltf.scene);
                var action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }            
            
            model = gltf.scene;
            previewingSymbol=model;
            gltf.scene.children[0].children[0].position.set(0, 0, 0);//原来位置是偏的
            scene.add(gltf.scene);
        });

        camera.position.z = 5;
    }
    else { 
        var loader = new THREE.FBXLoader();
        loader.load( path, function ( object ) {
            mixer = new THREE.AnimationMixer( object );

            var action = mixer.clipAction( object.animations[ 0 ] );
            action.play();

            previewingSymbol=object;
            scene.add( object );
        });
        
        camera.position.z = 100;
    }    

    var light = new THREE.HemisphereLight(  );
    scene.add( light );

    var animate = function () {
        requestAnimationFrame( animate );
        
        var delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        if (model) model.children[0].children[0].position.set(0,0,0);//有些模型动了之后偏了

        renderer.render( scene, camera );
    };

    animate();
}

//用CustomLayer在mapbox中添加之前通过three.js场景预览的那个符号
class SymbolCustomLayer{
    constructor(id,object3d,position,altitude,scale){
        this.id = id;
        this.object3d = object3d;//关键
        this.type = 'custom';
        this.renderingMode = '3d';

        //dat.gui控制符号
        var Controls = function() {
            this.scale = 50;
            this.altitude = 0;
            this.rotateX = 90;
            this.rotateY = 0;
            this.rotateZ = 0;
            this.minzoom = 0;
            this.maxzoom = 22;
            this.brightness= 1;
        };

        this.controls = new Controls();
        this.gui = new dat.GUI({ autoPlace: false });
        document.getElementById("moveGUI").appendChild(this.gui.domElement);
        this.gui.add(this.controls, 'scale',0,100);
        this.gui.add(this.controls, 'altitude', 0, 1000);
        this.gui.add(this.controls, 'rotateX',0,360);
        this.gui.add(this.controls, 'rotateY',0,360);
        this.gui.add(this.controls, 'rotateZ',0,360);
        this.gui.add(this.controls, 'minzoom',0,22);
        this.gui.add(this.controls, 'maxzoom',0,22);
        this.gui.add(this.controls, 'brightness',0,5);

        // parameters to ensure the model is georeferenced correctly on the map
        this.modelOrigin = position;
        this.defaultScale = 2e-8;
        //用于尺度变换
        this.minzoom=this.controls.minzoom;
        this.maxzoom=this.controls.maxzoom;
    }
    
    onAdd(map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        this.light = new THREE.HemisphereLight();
        this.scene.add( this.light );

        this.scene.add(this.object3d);

        this.map = map;

        // use the Mapbox GL JS map canvas for three.js
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
        });

        this.renderer.autoClear = false;

        //raycast 没搞出来
        // this.raycaster = new THREE.Raycaster();
        // var _this=this;
        // map.on("click",function(e){
        //     var mouse = new THREE.Vector2();
        //     var point=e.point;
        //     mouse.x = ( point.x / map.transform.width ) * 2 - 1;
        //     mouse.y = 1 - ( point.y / map.transform.height ) * 2;
        //     //_this.raycaster.setFromCamera(mouse, _this.camera);
            
        //     const pos=[mouse.x,mouse.y];
        //     const cameraPosition = new THREE.Vector3(0, 0, 0).unproject(_this.camera);
        //     const mousePos = new THREE.Vector3(pos[0], pos[1], 0.99).unproject(_this.camera);
        //     const direction = mousePos.clone().sub(cameraPosition).normalize();
        //     _this.raycaster.near = -1;
        //     _this.raycaster.far = 5;
        //     _this.raycaster.ray.set(mousePos, direction);
            
        //     var intersects = _this.raycaster.intersectObjects(_this.scene.children, true);
        //     console.log(intersects);
        // });
    }

    render(gl, matrix) {
        // transformation parameters to position, rotate and scale the 3D model onto the map
        this.modelTransform = {
            translateX: mapboxgl.MercatorCoordinate.fromLngLat(this.modelOrigin, this.controls.altitude).x,
            translateY: mapboxgl.MercatorCoordinate.fromLngLat(this.modelOrigin, this.controls.altitude).y,
            translateZ: mapboxgl.MercatorCoordinate.fromLngLat(this.modelOrigin, this.controls.altitude).z,
            rotateX: this.controls.rotateX/180*Math.PI,
            rotateY: this.controls.rotateY/180*Math.PI,
            rotateZ: this.controls.rotateZ/180*Math.PI,
            scale: this.defaultScale*this.controls.scale
        };

        var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), this.modelTransform.rotateX);
        var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), this.modelTransform.rotateY);
        var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), this.modelTransform.rotateZ);

        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4().makeTranslation(this.modelTransform.translateX, this.modelTransform.translateY, this.modelTransform.translateZ)
            .scale(new THREE.Vector3(this.modelTransform.scale, -this.modelTransform.scale, this.modelTransform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        this.light.intensity=this.controls.brightness;

        if (this.controls.minzoom>=this.controls.maxzoom){
            alert("minzoom is larger than maxzoom, please set it again");
        }else{
            map.setLayerZoomRange(this.id,this.controls.minzoom,this.controls.maxzoom);
        }        

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
}

class SymbolThreebox{
    constructor(id,object3d,position){
        this.id = id;
        this.type="custom";
        this.object3d = object3d;//关键
        this.tb=null;

        //dat.gui控制符号
        var Controls = function() {
            this.scale = 0.5;
            this.altitude = 0;
            this.rotateX = 90;
            this.rotateY = 0;
            this.rotateZ = 0;
            this.minzoom = 0;
            this.maxzoom = 22;
            this.brightness= 1;
        };
        
        this.controls = new Controls();
        this.gui = new dat.GUI({ autoPlace: false });
        document.getElementById("moveGUI").appendChild(this.gui.domElement);
        
        this.gui.add(this.controls, 'scale',0,1).onChange(onchange);
        this.gui.add(this.controls, 'altitude', 0, 1000).onChange(onchange);
        this.gui.add(this.controls, 'rotateX',0,360).onChange(onchange);
        this.gui.add(this.controls, 'rotateY',0,360).onChange(onchange);
        this.gui.add(this.controls, 'rotateZ',0,360).onChange(onchange);
        this.gui.add(this.controls, 'minzoom',0,22).onChange(onchange);
        this.gui.add(this.controls, 'maxzoom',0,22).onChange(onchange);
        this.gui.add(this.controls, 'brightness',0,5).onChange(onchange);

        var _this=this;
        function onchange(){
            _this.object.setCoords([_this.object.coordinates[0],_this.object.coordinates[1],_this.controls.altitude]);
            _this.object.set({
                rotation:[_this.controls.rotateX,_this.controls.rotateY,_this.controls.rotateZ],
                scale:[_this.controls.scale,_this.controls.scale,_this.controls.scale]
            });
            if (_this.controls.minzoom>=_this.controls.maxzoom){
                alert("minzoom is larger than maxzoom, please set it again");
            }else{
                map.setLayerZoomRange(_this.id,_this.controls.minzoom,_this.controls.maxzoom);
            }
            _this.light.intensity=_this.controls.brightness;  
        };
        this.onchange=onchange;

        // parameters to ensure the model is georeferenced correctly on the map
        this.modelOrigin = position;
        //用于尺度变换
        this.minzoom=this.controls.minzoom;
        this.maxzoom=this.controls.maxzoom;
    }
    
    onAdd(map, mbxContext) {
        this.tb = new Threebox(
            map, 
            mbxContext,
            {defaultLights: false,passiveRendering:false}
        );

        this.light = new THREE.HemisphereLight();
        this.tb.add( this.light );

        var object = this.object3d;
                        
        object = this.tb.Object3D({ obj: object, units: 'meters' })
            .setCoords(this.modelOrigin);
        this.object=object;
        this.tb.add(object);
        this.onchange();

        //add mousing interactions 拖拽
        var _this=this;
        map.on('dblclick', selectSymbol);
        function selectSymbol(e){
            e.preventDefault();//阻止双击放大地图
            // calculate objects intersecting the picking ray
            var intersect = _this.tb.queryRenderedFeatures(e.point)[0];
            var intersectionExists = typeof intersect == "object"

            // if intersect exists, highlight it
            if (!intersect) {
                return;
            }

            var nearestObject = intersect.object;
            console.log(nearestObject);
            _this.highlighted=true;

            map.on("mousedown",onDown);

            function onDown(e){
                if (_this.finishEdit) return;
                e.preventDefault();
                _this.dragable=true;

                map.on("mousemove",onMove);

                map.once("mouseup",onUp);
            }
            _this.onDown=onDown;//用于完成符号配置时解绑

            function onMove(e){
                if (_this.dragable){
                    _this.object.setCoords([e.lngLat.lng, e.lngLat.lat, _this.controls.altitude]);
                    _this.onchange();
                }
            }

            function onUp(){
                _this.dragable=false;
                map.off('mousemove', onMove);
            }
        }
        this.selectSymbol=selectSymbol;//用于完成符号配置时解绑
    }

    render(gl, matrix) {
        //更新到1.3版本的mapbox之后需要加这一行 否则会threebox的场景会出现在建筑物的下面 在threebox的github issue里找到的这个解决方案
        gl.clear(gl.DEPTH_BUFFER_BIT);
        this.tb.update();
    }
}

var existingSymbols={};//现有符号及各个符号的个数

//点击添加符号按钮，在地图上点击，当前在预览的符号可以添加到地图上
document.getElementById("addSymbol").addEventListener("click",function(){
    map.getCanvas().style.cursor = 'crosshair';//鼠标变成十字的
    map.once("click", function (e) {//这个点击事件只生效一次
        //符号的id，符号名称+被添加的第几个        
        var currentNode=$('#modelTree').treeview.currentNode;
        var symbolName = currentNode.text;
        if (existingSymbols[symbolName]){
            existingSymbols[symbolName]++;
        }else{
            existingSymbols[symbolName]=1;
        }
        var id=symbolName+existingSymbols[symbolName];
        
        //在鼠标点击位置添加
        var position = [e.lngLat.lng, e.lngLat.lat];
        //var symbol=new SymbolCustomLayer(id,previewingSymbol,position,0,1);
        var symbol=new SymbolThreebox(id,previewingSymbol,position);
        map.addLayer(symbol);
        
        map.getCanvas().style.cursor = '';
        
        //完成添加 隐藏控制符号的面板
        var btnFinish=document.getElementById("finishAddSymbol");
        btnFinish.disabled=false;
        btnFinish.addEventListener("click",finishAddSymbol);
        function finishAddSymbol(){
            symbol.gui.domElement.style.display="none";
            btnFinish.disabled=true;
            map.off("click",symbol.selectSymbol);
            map.off("mousedown",symbol.onDown);//todo这个解绑没成功
            symbol.finishEdit=true;//所以强行让它不能拖拽了
            btnFinish.removeEventListener("click",finishAddSymbol);
        }
    });
});

//符号的文字列表，树结构的，从中选择符号
$.getJSON("data/meta.json", function(data){
    var treedata=data;
    $('#modelTree').treeview(
        {
            data: treedata,
            onNodeSelected: function(event, data) {
                //找到当前节点的各个父节点，把所有名字拼在一起构成路径
                var filesName=[];
                var currentNode=data;
                filesName.push(currentNode.text+".gltf");//先只处理gltf格式
                do{
                    filesName.push(currentNode.text);
                    currentNode=$('#modelTree').treeview('getNode', currentNode.parentId);
                }
                while (currentNode.parentId!=undefined);
                filesName.push(currentNode.text);
                filesName.reverse();
                var path="models/"+filesName.join("/");
    
                $('#modelTree').treeview.currentNode=data;
                previewSymbol(path);
            }
        }
    );
});

class preLoadSymbol{
    constructor(id,path,position,altitude,scale){
        this.id=id,
        this.path=path;
        this.type= 'custom',
        this.renderingMode = '3d',
        this.mixer= null,
        this.clock= null,
        this.gltf=null,
        this.modelOrigin=position,
        this.altitude=altitude,
        this.modelScale=scale;
        this.rotateX=90/180*Math.PI;
        this.rotateY=0;
        this.rotateZ = 0;
        this.rotateSpeed = 0;
    }    

    onAdd (map, gl){
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        this.light = new THREE.HemisphereLight();
        this.scene.add( this.light );

        this.clock=new THREE.Clock();
        var _this = this;
        var loader = new THREE.GLTFLoader();
        loader.load(this.path, function (gltf) {
            if (gltf.animations[0]){//有些符号不是动态的 目前台风就不是
                _this.mixer = new THREE.AnimationMixer(gltf.scene);
                var action = _this.mixer.clipAction(gltf.animations[0]);
                action.play();
            }
            
            gltf.scene.children[0].children[0].position.set(0, 0, 0);//原来位置是偏的
            
            //后面渲染动画控制会用到
            _this.gltf = gltf;            
            
            var object = gltf.scene;
            _this.object = object;
            _this.scene.add(object);            
        });        

        this.map = map;

        // use the Mapbox GL JS map canvas for three.js
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
        });

        this.renderer.autoClear = false;
    }

    render(gl, matrix) {
        if (this.object) {
            this.object.rotation.y += this.rotateSpeed;//可用于台风自转
        }
        
        var delta = this.clock.getDelta();
        if (this.mixer) this.mixer.update(delta);
        if (this.model) this.model.children[0].children[0].position.set(0,0,0);//有些模型动了之后偏了

        this.light.intensity = this.brightness;
        
        // transformation parameters to position, rotate and scale the 3D model onto the map
        this.modelTransform = {
            translateX: mapboxgl.MercatorCoordinate.fromLngLat(this.modelOrigin, this.altitude).x,
            translateY: mapboxgl.MercatorCoordinate.fromLngLat(this.modelOrigin, this.altitude).y,
            translateZ: mapboxgl.MercatorCoordinate.fromLngLat(this.modelOrigin, this.altitude).z,
            rotateX: this.rotateX,
            rotateY: this.rotateY,
            rotateZ: this.rotateZ,
            scale: this.modelScale
        };

        var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), this.modelTransform.rotateX);
        var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), this.modelTransform.rotateY);
        var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), this.modelTransform.rotateZ);

        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4().makeTranslation(this.modelTransform.translateX, this.modelTransform.translateY, this.modelTransform.translateZ)
            .scale(new THREE.Vector3(this.modelTransform.scale, -this.modelTransform.scale, this.modelTransform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);        

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
}

//预加载进去的台风
document.getElementById("typhoon").addEventListener("click", function () {
    if (this.checked) {
        //重新把台风显示出来
        if (map.getLayer("typhoon")) {
            map.setLayoutProperty('typhoon', 'visibility', "visible");
            map.setLayoutProperty('typhoon2', 'visibility', "visible");
            map.setLayoutProperty('typhoon-route', 'visibility', "visible");
            document.getElementById("typhoon-time-slider").style.display="block";
        }
        //首次加载台风
        else {
            $.getJSON("data/LQM.geojson", function (data) {
                console.log(data);
                var route = data;
                var arc = [];
                for (var i = 0; i < route.features.length - 1; i++) {
                    var former = turf.point(route.features[i].geometry.coordinates);
                    var later = turf.point(route.features[i + 1].geometry.coordinates);
                    var lineDistance = turf.distance(former, later);
            
                    var steps = 36;//原本的数据大多是间隔3小时 180就是一分钟一步
                    var line = turf.lineString([route.features[i].geometry.coordinates, route.features[i + 1].geometry.coordinates]);
                    for (var j = 0; j < lineDistance; j += lineDistance / steps) {//可能在两段线段交界处有重复的点，无所谓            
                        var segment = turf.along(line, j);
                        var point = {};
                        point.coordinates = segment.geometry.coordinates;
                        point.windspeed = route.features[i].properties.windspeed;//就用前一个点的风速，无所谓
                        point.time = parseTime(route.features[i].properties.time,
                            route.features[i+1].properties.time,j/lineDistance);
                        arc.push(point);
                    }
                }

                //前一个点的时间 后一个点的时间 当前点占这个线段的百分比 时间格式类似80417 2019年8月4号17点 利奇马台风都是8月
                function parseTime(time1,time2,ratio) { 
                    var date1 = new Date(2019, 7, String(time1).substr(1, 2), String(time1).substr(3, 4));
                    var date2 = new Date(2019, 7, String(time2).substr(1, 2), String(time2).substr(3, 4));
                    var addhours = Math.floor((date2 - date1)/3600000*ratio);
                    var date = date1;
                    date.setHours(date1.getHours() + addhours);
                    var timeLabel = "8月" + date.getDate() + "日" + date.getHours() + "时";
                    return timeLabel;
                }

                //添加路径 线数据
                var points = [];
                route.features.forEach(feature => {
                    points.push(feature.geometry.coordinates);
                });

                var line = {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": points
                        }
                    }]
                };

                map.addSource('route', {
                    "type": "geojson",
                    "data": line
                });
                     
                map.addLayer({
                    "id": "typhoon-route",
                    "source": "route",
                    "type": "line",
                    "paint": {
                        "line-width": 2,
                        "line-color": "#007cbf"
                    }
                });

                console.log(arc);
                
                var typhoonSymbol = new preLoadSymbol("typhoon", "models/龙卷风（细）-贴图 - 1/龙卷风（细）-贴图 - 1.gltf", arc[0].coordinates, 0, 1);
                typhoonSymbol.brightness = 2;
                map.addLayer(typhoonSymbol);
                map.setLayerZoomRange("typhoon",0,4);

                var typhoonSymbol2 = new preLoadSymbol("typhoon2", "models/taifeng01/taifeng01.gltf", arc[0].coordinates, 0, 1)
                typhoonSymbol2.brightness = 2;
                map.addLayer(typhoonSymbol2);
                map.setLayerZoomRange("typhoon2",4,22);

                document.getElementById("typhoon-time-slider").style.display="block";
                
                //时间滑块控制
                var timeLabel = document.getElementById("typhoon-time");
                var timeSlider = document.getElementById("typhoon-slider");
                var btnPause = document.getElementById("typhoon-pause");
                timeSlider.max = arc.length;
                
                //移动台风符号
                var counter = 0;
                //var isPaused = false;
                var requestId;

                function animate() {
                    //if (isPaused) return;

                    typhoonSymbol.modelOrigin = arc[counter].coordinates;
                    typhoonSymbol.rotateSpeed = arc[counter].windspeed / 1000;
                    typhoonSymbol.modelScale = arc[counter].windspeed / 7000;

                    typhoonSymbol2.modelOrigin = arc[counter].coordinates;
                    typhoonSymbol2.rotateSpeed = arc[counter].windspeed / 1000;
                    typhoonSymbol2.modelScale = arc[counter].windspeed / 60000;
                    
                    timeLabel.innerText = arc[counter].time;
                    timeSlider.value = counter;
                    
                    requestId=requestAnimationFrame(animate);
                    counter = counter + 1;//速度调整 
                    if (counter >= arc.length - 1) {
                        counter = 0;
                    }
                }
                animate();

                timeSlider.addEventListener('input', function(e) {
                    counter = parseInt(e.target.value);
                });

                btnPause.addEventListener("click", function () { 
                    if (this.innerText == "暂停") {
                        typhoonSymbol.rotateSpeed = 0;
                        typhoonSymbol2.rotateSpeed = 0;
                        //isPaused = true;
                        cancelAnimationFrame(requestId);
                        this.innerText = "开始";
                    }
                    else {
                        requestAnimationFrame(animate);
                        //isPaused = false;
                        this.innerText = "暂停";
                    }
                })

                
            });
        }
    }
    else {
        map.setLayoutProperty('typhoon', 'visibility', "none");
        map.setLayoutProperty('typhoon2', 'visibility', "none");
        map.setLayoutProperty('typhoon-route', 'visibility', "none");
        document.getElementById("typhoon-time-slider").style.display="none";
    }
});

//提前预加载几个符号
// map.on("load", function () {
//     var presetScale=3e-7;//正好这几个符号初始大小差不多

//     var hotelSymbol1 = new preLoadSymbol("一二星级酒店预加载", "models/POI/酒店宾馆/星级宾馆/一二星级酒店/一二星级酒店.gltf",
//         [114.32741667397357, 30.553207204640387], 0, presetScale);
//     hotelSymbol1.rotateY = 41 / 180 * Math.PI;
//     hotelSymbol1.brightness = 2;
//     map.addLayer(hotelSymbol1);
//     map.setLayerZoomRange("一二星级酒店预加载",13,22);
    
//     // var hotelSymbol2 = new preLoadSymbol("四星级酒店预加载", "models/POI/酒店宾馆/星级宾馆/四星级酒店/四星级酒店.gltf",
//     // [114.32925028717852,30.557744135997666], 0, presetScale);//[114.32950852101993, 30.555842752022897]
//     // hotelSymbol2.rotateY = 65.55180417547925 / 180 * Math.PI;
//     // hotelSymbol2.brightness = 2;
//     // map.addLayer(hotelSymbol2);
//     // map.setLayerZoomRange("四星级酒店预加载",14,22);
//     var hotelSymbol2 = new preLoadSymbol("四星级酒店预加载", "models/POI/餐饮美食/快餐/西式快餐厅/西式快餐厅.gltf",
//     [114.32925028717852,30.557744135997666], 0, presetScale);//[114.32950852101993, 30.555842752022897]
//     hotelSymbol2.rotateY = 190 / 180 * Math.PI;
//     hotelSymbol2.brightness = 2;
//     map.addLayer(hotelSymbol2);
//     map.setLayerZoomRange("四星级酒店预加载",14,22);
    
//     var hotelSymbol3 = new preLoadSymbol("五星级酒店预加载", "models/POI/酒店宾馆/星级宾馆/五星级酒店/五星级酒店.gltf",
//         [114.32632525392188, 30.55733863880704], 0, presetScale);
//     hotelSymbol3.rotateY = 10.86517499210909 / 180 * Math.PI;
//     hotelSymbol3.brightness = 2;
//     map.addLayer(hotelSymbol3);
//     map.setLayerZoomRange("五星级酒店预加载",14,22);

//     var parkSymbol1 = new preLoadSymbol("停车场预加载1", "models/POI/酒店宾馆/酒店附属设施/酒店附属设施.gltf",
//         [114.31458866029419, 30.556878006387123], 0, presetScale);
//     parkSymbol1.rotateY = 41 / 180 * Math.PI;
//     map.addLayer(parkSymbol1);
//     parkSymbol1.brightness = 1;
//     map.setLayerZoomRange("停车场预加载1",13,22);
    
//     var parkSymbol2 = new preLoadSymbol("停车场预加载2", "models/POI/酒店宾馆/酒店附属设施/酒店附属设施.gltf",
//         [114.31137763100133, 30.556088395903373], 0, presetScale);
//     parkSymbol2.rotateY = 65.55180417547925 / 180 * Math.PI;
//     map.addLayer(parkSymbol2);
//     parkSymbol2.brightness = 1;
//     map.setLayerZoomRange("停车场预加载2",14,22);
    
//     var parkSymbol3 = new preLoadSymbol("停车场预加载3", "models/POI/酒店宾馆/酒店附属设施/酒店附属设施.gltf",
//         [114.31104469220315, 30.554640147755322], 0, presetScale);
//     parkSymbol3.rotateY = 10.86517499210909 / 180 * Math.PI;
//     map.addLayer(parkSymbol3);
//     parkSymbol3.brightness = 1;
//     map.setLayerZoomRange("停车场预加载3", 14, 22);
    
//     //在缩小时稍微把符号放大一点
//     map.on("move", function (e) { 
//         if (map.getZoom() > 13 && map.getZoom() < 15) {
//             var presetSymbolList = [hotelSymbol1, hotelSymbol2, hotelSymbol3, parkSymbol1, parkSymbol2, parkSymbol3];
//             presetSymbolList.forEach(symbol => { 
//                 symbol.modelScale = presetScale * (1 + (15 - map.getZoom())/2);
//             })
//         }
//     })
// })

