/**
 * Created by gaimeng on 15/3/9.
 * Modified a lot by xiaoyi
 * Modified little by zwj
 */

IndoorMap3d = function(mapdiv){
    var _this = this;
    var _theme = null;
    var _mapDiv = mapdiv,
        _canvasWidth = _mapDiv.clientWidth,
        _canvasWidthHalf = _canvasWidth / 2,
        _canvasHeight = _mapDiv.clientHeight,
        _canvasHeightHalf = _canvasHeight / 2;

    var _scene, _controls, _projector, _rayCaster;
    var  _canvasDiv;
    var _selected;
    var _showNames = false, _showPubPoints = false;
    var _curFloorId = 0;
    var _selectionListener = null;
    var _sceneOrtho, _cameraOrtho;//for 2d
    var _spriteMaterials = [], _pubPointSprites=null, _nameSprites = null;

    this.camera = null;
    this.renderer = null;
    this.mall = null;
    this.is3d = true;

    this.init = function(){

        // perspective scene for normal 3d rendering
        _scene = new THREE.Scene();
        _this.camera = new THREE.PerspectiveCamera(20, _canvasWidth / _canvasHeight, 0.1, 2000);

        //orthogonal scene for sprites 2d rendering
        _sceneOrtho = new THREE.Scene();
        _cameraOrtho = new THREE.OrthographicCamera(- _canvasWidthHalf, _canvasWidthHalf, _canvasHeightHalf, -_canvasHeightHalf, 1, 10);
        _cameraOrtho.position.z = 10;

        //controls
        _controls = new THREE.OrbitControls(_this.camera,_mapDiv);//fix bug by xy add a para

        //renderer
        _this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            precision: "highp"
        });
        _this.renderer.autoClear = false;

        //set up the lights 
        //_scene.add( new THREE.AmbientLight( 0xffffff ) );原来的灯照出来的颜色跟实际颜色不一致，因为一开始房间用的是Lambert材质

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-500, 500, -500);
        _scene.add(light);

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(500, 500, 500);
        _scene.add(light);

        //canvas div
        _this.renderer.setSize(_mapDiv.clientWidth, _mapDiv.clientHeight);
        _canvasDiv = _this.renderer.domElement
        _mapDiv.appendChild(_canvasDiv);

        _mapDiv.style.overflow = "hidden";
        _canvasDiv.style.width = "100%";
        _canvasDiv.style.height = "100%";
    }

    this.setTheme = function(theme){
        if(_theme == null){
            _theme = theme
        } else if(_theme != theme) {
            _theme = theme;
            _this.parse(_this.mall.jsonData); //parse
        }
        return _this;
    }

    this.theme = function(){
        return _theme;
    }

    //add by xy 方便在这个类的外部对场景做些控制
    this.getScene = function () { 
        return _scene;
    }

    //load the map by the json file name 以及format和theme
    this.load = function (fileName, format, theme, callback) {//edit by xy add parameter format indoor3d,geojson,fengmap三种格式
        var loader = new IndoorMapLoader(true);
        _theme = theme?theme:default3dTheme;//edit by xy
        loader.load(fileName, format, _theme, function(mall){//edit by xy add parameter format
            _this.mall = mall;
            _scene.add(_this.mall.root);
            _scene.mall = mall;
            if(callback) {
                callback();
            }
            _this.renderer.setClearColor(_theme.background);
            if(_curFloorId == 0){
                _this.showAllFloors();
                _this.adjustCamera();//add by xy只在一开始修改相机位置，切换楼层的时候不修改
            }else{
                _this.showFloor(_curFloorId);
                _this.adjustCamera();//add by xy
            }
            //createPoiSprites();//add by xy POI符号始终添加
        });
        return _this;
    }

    //parse the json file
    this.parse = function(json){
        if(_theme == null) {
            _theme = default3dTheme;
        }
        _this.mall = ParseModel(json, _this.is3d, _theme);
        _scene.mall = _this.mall;
        _this.showFloor(_this.mall.getDefaultFloorId());
        _this.renderer.setClearColor(_theme.background);
        _scene.add(_this.mall.root);
        _mapDiv.style.background = _theme.background;
        return _this;
    }

    //reset the camera to default configuration
    this.setDefaultView = function () {
        //edit by xy 不使用作者用的最佳视角，而是使角度与室外地图保持一致 有些要自己改数据
        //var camAngle = _this.mall.FrontAngle + Math.PI/2;
        var camAngle = _this.mall.FrontAngle;
        var camDir = [Math.cos(camAngle), Math.sin(camAngle)];
        var camLen = 30;//edit by xy from 500 to 200 自己的数据坐标值都相对较小，其实应该动态设置
        var tiltAngle = 75.0 * Math.PI/180.0;
        _this.camera.position.set(camDir[1]*camLen, Math.sin(tiltAngle) * camLen, camDir[0]*camLen);//TODO: adjust the position automatically
        _this.camera.lookAt(_scene.position);

        _controls.reset();
        _controls.viewChanged = true;
        return _this;
    }

    //set top view
    this.setTopView = function(){
        _this.camera.position.set(0, 500, 0);
        return _this;
    }

    //TODO:adjust camera to fit the building
    this.adjustCamera = function() {
        _this.setDefaultView();

    }

    this.zoomIn = function(zoomScale){
        _controls.zoomOut(zoomScale);
        redraw();
    }

    this.zoomOut = function(zoomScale){
        _controls.zoomIn(zoomScale);
        redraw();
    }

    //show floor by id
    this.showFloor = function(floorid) {
        _curFloorId = floorid;
        if(_scene.mall == null){
            return;
        }
        _scene.mall.showFloor(floorid);
        //_this.adjustCamera();//comment by xy 切换楼层保持视角缩放等级
        if(_showPubPoints) {
            //createPubPointSprites();
        }
        if(_showNames) {
            createNameSprites();
        }
        redraw();
        return _this;
    }

    //show all floors
    this.showAllFloors = function(){
        _curFloorId = 0; //0 for showing all
        if(_this.mall == null){
            return;
        }
        _this.mall.showAllFloors();
        //_this.adjustCamera();//comment by xy
        redraw();//add by xy 调整相机里包含了重绘
        // clearPubPointSprites();//edit by xy显示所有楼层时也可以显示注记和符号，原作者是不显示
        clearNameSprites();
        if(_showPubPoints) {
            createPubPointSprites();
        }
        if (_showNames) { 
            //createNameSprites();
        }        
        return _this;
    }

    //show the labels
    this.showAreaNames = function(show) {
        _showNames = show == undefined ? true : show;
        return _this;
    }

    //show pubPoints(entries, ATM, escalator...)
    this.showPubPoints = function(show){
        _showPubPoints = show == undefined ? true: show;
        return _this;
    }

    //自己改的
    this.my = function (show){
        this.mall.floors.forEach(floor => {
            floor.POIs.children.forEach(poi => {
                if(poi.properties.Category!=192){
                    poi.selected = show;
                }
            });
        });
        if (this.mapboxIndoor) {
            this.mapboxIndoor.updateSprites();
        }
    }

    this.searchPoi = function (key){
        //var num = 0;
        var list = new Set();
        this.mall.floors.forEach(floor => {
            floor.POIs.children.forEach(poi => {
                if(poi.properties.Name.indexOf(key)!=-1){
                    poi.selected = true;
                    //num++;
                    //console.log(floor);
                    list.add(floor._id);
                }
                else {
                    poi.selected = false;
                }
            });
        });
        if (this.mapboxIndoor) {
            this.mapboxIndoor.updateSprites();
            //alert("共有"+num+"条相关记录！");
            //console.log(list);
        }
        return list;
    }

    //控制POI的显示和隐藏 如指定category则只控制该类别的
    this.mytogglePoiSprites = function (show,Category) {
        this.mall.floors.forEach(floor => {
            floor.POIs.children.forEach(poi => {
                if(show==true){
                    if (Category){
                        if(Category == poi.properties.Category){
                            poi.selected = show;
                        }
                        else {
                            console.log(poi);
                            poi.selected = !(show);
                        }
                    }
                    else{
                        poi.selected = show;
                    }
                }
                else {
                    poi.selected = show;
                }
            });
        });
        if (this.mapboxIndoor) {
            this.mapboxIndoor.updateSprites();
        }
    }

    //控制POI的显示和隐藏 如指定category则只控制该类别的
    this.togglePoiSprites = function (show,Category) { 
        this.mall.floors.forEach(floor => {
            floor.POIs.children.forEach(poi => {
                if (Category){
                    if (Category == poi.properties.Category) {
                        poi.selected = show;
                    }    
                }
                else{
                    poi.selected = show;
                }
                            
            });
        });
        if (this.mapboxIndoor) { 
            this.mapboxIndoor.updateSprites();
        }
    }

    //设置POI的权重 用户感兴趣的权重高 优先显示且表示详细服务信息
    this.setPoiPriority= function(type, popularity){
        this.mall.floors.forEach(floor => {
            floor.POIs.children.forEach(poi => {
                if (type == poi.properties.Secondary) {//是商铺
                    //优先显示
                    poi.properties.priority = popularity + poi.properties.Area;
                    //表示详细服务信息
                    var value = poi.properties["average price"];
                    if (popularity > 0) {//说明是要让他优先
                        poi.symbol.showCircle(value);
                    }
                    else { //说明是取消优先
                        poi.symbol.hideCircle(value);
                    }
                    
                }
                else if (type == poi.properties.Category) { 
                    //优先显示
                    poi.properties.priority = popularity + poi.properties.defaultPriority;
                }
            });
        });
        if (this.mapboxIndoor) { 
            this.mapboxIndoor.updateSprites();
        }
    }

    this.drawNaviLine=function (coords){
        const centerX=this.mall.jsonData.data.building.centerX;
        const centerY=this.mall.jsonData.data.building.centerY;
        const storeyHeight=this.mall.jsonData.data.building.storeyHeight;
        const roomHeight=this.mall.jsonData.data.building.roomHeight;
        
        const points = [];
        coords.forEach(coord=>{
            var x=coord.x-centerX;
            var y=coord.y-centerY;
            var z=(coord.floor-1)*storeyHeight+roomHeight;
            points.push(new THREE.Vector3(x, y, z));
        })
        
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);

        line.scale.set(0.1,0.1,0.1);
        line.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

        _scene.add(line);
        _this.renderer.render(_scene, _this.camera);
    }

    //给特定楼层贴特定的图 例如热力图，wifi信号，轨迹线 img可以是一个图片url或canvas 对象
    this.addTexture = function (floorId, img) { 
        var floor = this.mall.getFloor(floorId);
        var drawingPlane;//画热力图的画板
                 
        // assignUVs(floorMesh.geometry);//这个要放在初始化geometry的地方才有效果
        var texture;
        if (typeof img == "String") {//img参数是图片url
            texture = THREE.ImageUtils.loadTexture(img);
        }
        else { //img参数是canvas对象
            texture = new THREE.Texture(img);
        }

        var geometry = new THREE.ShapeGeometry(floor.shape);
        assignUVs(geometry);
        var material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.9,
            color: "#ffffff",
            map: texture
        });
        material.needsUpdate = true;
        drawingPlane = new THREE.Mesh(geometry, material);
        drawingPlane.type = 'drawing board';//专门用来画热力图的画板 用于更新的时候找到画板
        drawingPlane.image = img;//用于删除的时候找到这个画板
        drawingPlane.position.set(0, 0, floor.floorHeight+0.2);
        floor.add(drawingPlane);

        redraw();
        updateHeatmap();

        //调整放在地板上的一些东西的透明度和可见性，使得热力图变得更清晰可见
        // floor.children.forEach(obj => {
        //     if (obj.level != 0 && obj.type == "solidroom") {//房间，非竖起来的墙体
        //         obj.material.opacity = 0.4;
        //     }
        // });       
    }

    this.removeTexture = function (floorId,img) { 
        var floor = this.mall.getFloor(floorId);
        floor.children.forEach(mesh => {
            if (mesh["image"] && mesh["image"] == img) {
                floor.remove(mesh);
            }
        });
    }

    this.toggleHeatmap = function (floorId, imgUrl) { 
        var floor = this.mall.getFloor(floorId);        
        //楼层标识，表示是否打开了该热力图
        if (floor[imgUrl]) {
            floor[imgUrl] = !floor[imgUrl];//toggle
        } else { 
            floor[imgUrl] = true;//首次添加
        }

        var floorMesh = floor.children[0];//每个楼层对象的第一项是地板，后面是房间和poi等
        if (floor[imgUrl]) { //打开wifi            
            // assignUVs(floorMesh.geometry);//这个要放在初始化geometry的地方才有效果
            var texture = THREE.ImageUtils.loadTexture(imgUrl);
            floorMesh.material.map = texture;
            floorMesh.material.needsUpdate = true;
            redraw();
            floor.children.forEach(obj => {
                if (obj.level == "0" && obj.type == "roomfloor") {//房间的地板
                    obj.position.set(0, 0, 0);//把地板藏起来，亲测改透明度会泛白，跟visible跟尺度变换冲突
                }
                if (obj.level != "0" && obj.type == "solidroom") {//房间，非竖起来的墙体
                    obj.material.opacity = 0.4;
                }
            });
        }
        else { //关闭wifi
            floorMesh.material.map = null;
            floorMesh.material.needsUpdate = true;
            redraw();
            floor.children.forEach(obj => {
                if (obj.level == "0" && obj.type == "roomfloor") {
                    obj.position.set(0, 0, floor.floorHeight);
                }
                if (obj.level != "0" && obj.type == "solidroom") {
                    obj.material.opacity = 0.9;//todo 不能写死
                }
            });
        }
        
    }

    //add by xy 在该类的外部也能让renderer render
    this.redraw = function () { 
        redraw();
    }

    function redraw(){
        _controls.viewChanged = true;
    }
    
    //如果热力图是会变的那种就要实时更新贴图
    function updateHeatmap() { 
        requestAnimationFrame(updateHeatmap);
        _this.mall.floors.forEach(floor => {
            floor.children.forEach(mesh => { 
                if (mesh.type == "drawing board") { 
                    if (mesh.material.map) { 
                        mesh.material.map.needsUpdate = true;
                    }
                }
            })
            // var heatmapPlane = floor.children[floor.children.length - 1];
            // if (heatmapPlane.material.map) {
            //     heatmapPlane.material.map.needsUpdate = true;
            // }
        });
        redraw();
    }

    //add by xy 
    this.getZoom = function () {
        return _controls.getZoom();
        //如果使用相机到原点的距离来衡量zoom，在移动之后不准确，原地准确
        // var zoom = _controls.target.distanceTo(controls.object.position);        
    }
    
    this.showSpecificLevelData=function(level){
        var floors=this.mall.floors;
        floors.forEach(floor=>{
            //房间轮廓的尺度变换 TODO如果卡的话可以加个判断跨越尺度界限的判断
            floor.children.forEach(object3d=>{
                if (!object3d.level) return;//没有设置level的房间，或地板，或poi符号，无论何时都是要显示的
                if (object3d.level.indexOf(level)!=-1){//如果房间或墙体的显示级别列表包括了当前级别则要显示
                    object3d.visible=true;
                }else{
                    object3d.visible=false;
                }
            });
            
            //poi符号自身的尺度变换 TODO改为放大后才显示符号 4不显示(TODO最难实现) 3、2粗略的 1、0具体的             
            if (!floor.POIs) return;
            floor.POIs.children.forEach(sprite => {
                if (!sprite.symbol) return;//只有四大类poi的符号才有自身语义的尺度变换
                if (level == "3" || level == "4") {
                    sprite.symbol.zoomOutImage();
                    sprite.material.map.needsUpdate = true;
                }
                else if (level == "2" || level == "1") {
                    sprite.symbol.zoomInImage();
                    //为了录视频临时加的
                    //document.getElementById("无").click()
                    //this.showInformation("none");//以上两种方式都太卡
                    sprite.symbol.hideCircle();
                    sprite.material.map.needsUpdate = true;                    
                }
                else if (level == "0") {
                    // sprite.symbol.zoomInImage();
                    //为了录视频临时加的
                    //document.getElementById("人均消费").click();
                    //this.showInformation("average price");
                    var value = sprite.properties["average price"];
                    sprite.symbol.showCircle(value);
                    sprite.material.map.needsUpdate = true;
                }
            });
        })
    }

    function animate () {
        requestAnimationFrame(animate);
        _controls.update();
        if(_controls.viewChanged) {

            _this.renderer.clear();
            _this.renderer.render(_scene, _this.camera);

            if (_showNames || _showPubPoints) {
                updateLabels();
            }
            _this.renderer.clearDepth();
            _this.renderer.render(_sceneOrtho, _cameraOrtho);
            //checkZoom();//add by xy
        }

        _controls.viewChanged = false;
    }

    //通过符号外的圆环表示详细的服务信息
    this.showInformation = function (information) { 
        var floors = this.mall.floors;
        floors.forEach(floor => {
            floor.POIs.children.forEach(sprite => {
                if (!sprite.symbol) return;//只有四大类poi的符号才可以变换实时服务信息的内容
                if (information != "none") {
                    var value = sprite.properties[information];
                    sprite.symbol.showCircle(value);
                }
                else { 
                    sprite.symbol.hideCircle();
                }                
                sprite.material.map.needsUpdate = true;
            });
        });
    }

    //对当前出现的符号显示注记 TODO还有个小问题 室内地图不显示的时候还是有些图例会显示
    this.showLegend = function () {
        //一、找出所有当前正在显示的POI符号
        
        //所有注记的条目先列出来，写在一个json文件里，目的是注记按照这个的顺序
        if (!this.legendEntries) { 
            var objLegendEntries;
            
            $.ajaxSettings.async = false;
            $.getJSON("symbol/legend.json", function (data) {
                objLegendEntries = data;
            });
            this.legendEntries = objLegendEntries;
        }

        //先都当做这个符号没显示，后面再把显示了的标注上
        for (var entry in this.legendEntries) { 
            this.legendEntries[entry].visible = false;
        }
        
        var curFloor = this.mall.getCurFloorId();
        var floors = this.mall.floors;
        var flagGauge = false;//是否需要外面圈的图例
        floors.forEach(floor => {
            if (curFloor != 0) { //只显示一个楼层，那就只显示一个图层的图例
                if (floor._id != curFloor) return;
            }
            floor.POIs.children.forEach(sprite => {
                if (sprite.visible == true) {
                    if (sprite.symbol && sprite.symbol.hasShownCircle) { //符号显示了外面的圈，就要在图例加上
                        flagGauge = true;
                    }

                    var legendEntry;                    
                    if (sprite.symbol && sprite.symbol.showDetailSymbol == true) {//二级类符号加入到注记 
                        legendEntry = sprite.properties.Secondary;
                        if (!this.legendEntries[legendEntry].visible) { 
                            this.legendEntries[legendEntry].visible = true;//把显示了的标注上
                            //为后面显示注记做准备
                            this.legendEntries[legendEntry].iconPath = "symbol/"+sprite.properties.Category+"/"+sprite.properties.Secondary+".png";
                        }
                    }
                    else if (sprite.symbol && sprite.symbol.showDetailSymbol == false) {//一级类符号加入到注记 
                        legendEntry = sprite.properties.Category;
                        if (!this.legendEntries[legendEntry].visible) { 
                            this.legendEntries[legendEntry].visible = true;//把显示了的标注上
                            this.legendEntries[legendEntry].iconPath = "symbol/"+sprite.properties.Category+"/"+sprite.properties.Category+".png";
                        }
                    }
                    else if (sprite.symbol == null) { //公共服务设施符号
                        legendEntry = sprite.properties.Category;
                        if (!this.legendEntries[legendEntry].visible) { 
                            this.legendEntries[legendEntry].visible = true;//把显示了的标注上
                            this.legendEntries[legendEntry].iconPath = "symbol/"+"public/"+sprite.properties.Category+".png";
                        }
                    }                    
                }                
            });
        });
        console.log(this.legendEntries);

        //二、显示注记
        var divLegend = document.createElement("div");
        divLegend.className = "legend";
        var allEntriesHtml = "";

        //注记一条条加上去
        for (var i in this.legendEntries) {
            var entry = this.legendEntries[i];
            if (entry.visible == true) { 
                var url = entry.iconPath;
                var name = entry.legend;                
                var entryHtml = `<div><span style="background-image: url(${url});"></span>${name}</div>`;
                allEntriesHtml += entryHtml;
            }
        }
        
        //外面的圈也加个注记 TODO论文修改暂时用购物的示意一下
        if (flagGauge) {
            //这种动态生成图例在todataurl的时候加载到canvas里面的图片不能及时输出 要稍等一会儿
            // var symbol1 = new Symbol("购物", "购物", 50);
            // symbol1.showCircle(5);
            // var canvas1 = symbol1.getCanvas();
            // document.body.appendChild(canvas1);
            // var symbol2 = new Symbol("购物", "购物", 150);
            // symbol2.showCircle(50);
            // var canvas2 = symbol2.getCanvas();
            
            // var entryHtml1 = `<div><span style="background-image: url(${canvas1.toDataURL("")});"></span>50CHY</div>`;
            // var entryHtml2 = `<div><span style="background-image: url(${canvas2.toDataURL("")});"></span>150CHY</div>`;
            // allEntriesHtml += (entryHtml1 + entryHtml2);
            allEntriesHtml += `<div>Average price:</div>`;
            allEntriesHtml += `<div style="height:30px;line-height:30px">
            <span style="height:25px;width:25px;background-image:url('img/price50.png');"></span>50CHY</div>`;
            allEntriesHtml += `<div style="height:30px;line-height:30px">
            <span style="height:25px;width:25px;background-image:url('img/price150.png');"></span>150CHY</div>`;
        }              

        divLegend.innerHTML += allEntriesHtml;
        document.body.appendChild(divLegend);
        divLegend.style.display = "block";

        //关闭注记按钮
        var divCloseLegend = document.createElement("div");
        divCloseLegend.innerText = "×";
        divCloseLegend.style.cssText = "position: absolute;right: 5px; top: -5px; color: #cccccc";
        divLegend.appendChild(divCloseLegend);
        divCloseLegend.onclick=function () { 
            divLegend.style.display = "none";
        }
    }

    //load Sprites
    function loadSprites(){
        if(_this.mall != null && _spriteMaterials.length == 0){
            var images = _theme.pubPointImg;
            for(var key in images){
                //edit by xy  new version of three.js
                //var texture = THREE.ImageUtils.loadTexture(images[key], undefined, redraw);
                var loader = new THREE.TextureLoader();
                var texture=loader.load(images[key], redraw);
                var material = new THREE.SpriteMaterial({map:texture});
                _spriteMaterials[key] = material;
            }
        }
        _spriteMaterials.isLoaded = true;
    }

    //labels includes pubPoints and shop names
    function updateLabels() {
        var mall = _this.mall;
        if(mall == null || _controls == null || !_controls.viewChanged){
            return;
        }
        var curFloor = mall.getCurFloor();
        if(curFloor == null){
            return;
        }

        var projectMatrix = null;

        if(_showNames) {
            if(_nameSprites != undefined){
                projectMatrix = new THREE.Matrix4();
                projectMatrix.multiplyMatrices(_this.camera.projectionMatrix, _this.camera.matrixWorldInverse);

                updateSprites(_nameSprites, projectMatrix);
            }

        }

        if(_showPubPoints){
            if(_pubPointSprites != undefined){
                if(!projectMatrix){
                    projectMatrix = new THREE.Matrix4();
                    projectMatrix.multiplyMatrices(_this.camera.projectionMatrix, _this.camera.matrixWorldInverse);
                }
                updateSprites(_pubPointSprites, projectMatrix);
            }
        }
        _controls.viewChanged = false;
    };

    //update sprites
    function updateSprites(spritelist, projectMatrix){
        for(var i = 0 ; i < spritelist.children.length; i++){
            var sprite = spritelist.children[i];
            var vec = new THREE.Vector3(sprite.oriX * 0.1, 0, -sprite.oriY * 0.1);
            vec.applyMatrix4(projectMatrix);

            var x = Math.round(vec.x * _canvasWidthHalf);
            var y = Math.round(vec.y * _canvasHeightHalf);
            sprite.position.set(x, y, 1);

            //check collision with the former sprites
            var visible = true;
            var visibleMargin = 5;
            for(var j = 0; j < i; j++){
                var img = sprite.material.map.image;
                if(!img){ //if img is undefined (the img has not loaded)
                    visible = false;
                    break;
                }

                var imgWidthHalf1 = sprite.width / 2;
                var imgHeightHalf1 = sprite.height / 2;
                var rect1 = new Rect(sprite.position.x - imgWidthHalf1, sprite.position.y - imgHeightHalf1,
                        sprite.position.x + imgHeightHalf1, sprite.position.y + imgHeightHalf1 );

                var sprite2 = spritelist.children[j];
                var sprite2Pos = sprite2.position;
                var imgWidthHalf2 = sprite2.width / 2;
                var imgHeightHalf2 = sprite2.height / 2;
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
    }

    //creat the funcArea Name sprites of a floor
    function createNameSprites(floorId){
        if(!_nameSprites){
            _nameSprites = new THREE.Object3D();
        }else{
            clearNameSprites();
        }
        var funcAreaJson = _this.mall.getFloorJson(_this.mall.getCurFloorId()).FuncAreas;
        for (var i = 0; i < funcAreaJson.length; i++){
            if (funcAreaJson[i].level.indexOf("1") == -1) continue;//level不是1的不显示注记
            if (!funcAreaJson[i].Name) continue;//没有名字的不显示 否则显示个null
            var sprite = makeTextSprite(funcAreaJson[i].Name, _theme.fontStyle);
            sprite.oriX = funcAreaJson[i].Center[0];
            sprite.oriY = funcAreaJson[i].Center[1];
            _nameSprites.add(sprite);
        }
        _sceneOrtho.add(_nameSprites);
    }
    //为每个楼层的所有funcarea创建名称注记 使用threebox将three.js的场景加到mapbox中sprite会一直正对
    //大小保持不变要sizeAttenuation 融合r96的three.js到threebox
    // function createNameSprites(){
    //     _this.mall.jsonData.data.Floors.forEach(floor => {
    //         var floorObj = _this.mall.getFloor(floor._id);
    //         var nameSprites = new THREE.Object3D();
    //         var funcAreaJson = floor.FuncAreas;
    //         for (var i = 0; i < funcAreaJson.length; i++) {
    //             var sprite = makeTextSprite(funcAreaJson[i].Name, _theme.fontStyle);
    //             sprite.position.set(funcAreaJson[i].Center[0], funcAreaJson[i].Center[1], floorObj.height);//注记高于房间高度这样不会被遮住
    //             _nameSprites.add(sprite);
    //         }
    //         floorObj.add(nameSprites);
    //         _nameSprites.push(nameSprites);
    //     });        
    // }

    //create the pubpoint sprites in a floor by the floor id
    function createPubPointSprites(){
        if(!_spriteMaterials.isLoaded){
            loadSprites();
        }

        if(!_pubPointSprites) {
            _pubPointSprites = new THREE.Object3D();
        }else{
            clearPubPointSprites();
        }

        var pubPointsJson = _this.mall.getFloorJson(_this.mall.getCurFloorId()).PubPoint;
        var imgWidth, imgHeight;
        for(var i = 0; i < pubPointsJson.length; i++){
            var spriteMat = _spriteMaterials[pubPointsJson[i].Type];
            if(spriteMat !== undefined) {
                imgWidth = 8, imgHeight = 8;//edit by xy 改为perspective相机后大小要变 原来是30
                var sprite = new THREE.Sprite(spriteMat);
                sprite.scale.set(imgWidth, imgHeight, 1);
                sprite.oriX = pubPointsJson[i].Outline[0][0][0];
                sprite.oriY = pubPointsJson[i].Outline[0][0][1];
                sprite.width = imgWidth;
                sprite.height = imgHeight;
                _pubPointSprites.add(sprite);
            }
        }
        //_sceneOrtho.add(_pubPointSprites);
        _scene.add(_pubPointSprites);//edit by xy
    }

    function clearNameSprites(){
        if(_nameSprites == null){
            return;
        }
        _nameSprites.remove(_nameSprites.children);
        _nameSprites.children.length = 0;
    }
    function clearPubPointSprites(){
        if(_pubPointSprites == null){
            return;
        }
        _pubPointSprites.remove(_pubPointSprites.children);
        _pubPointSprites.children.length = 0;
    }

    function makeTextSprite( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};

        var fontface = parameters.hasOwnProperty("fontface") ?
            parameters["fontface"] : "Arial";

        var fontsize = parameters.hasOwnProperty("fontsize") ?
            parameters["fontsize"] : 18;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
            parameters["borderThickness"] : 2;

        var borderColor = parameters.hasOwnProperty("borderColor") ?
            parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
            parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

        var fontColor = parameters.hasOwnProperty("color")?
            parameters["color"] : "#000000";

        //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
        //	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

        var spriteAlignment = new THREE.Vector2( 0, 0 );


        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        context.textAlign = "center";//add by xy

        // get size data (height depends only on font size)
        var metrics = context.measureText(message);
        
        //使canvas的大小跟文本一样
        // canvas.width = metrics.width;
        // canvas.height = fontsize*1.4;
//
//        // background color
//        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
//            + backgroundColor.b + "," + backgroundColor.a + ")";
//        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
            + borderColor.b + "," + borderColor.a + ")";
//
//        context.lineWidth = borderThickness;
//        context.strokeRect(borderThickness/2, borderThickness/2, metrics.width + borderThickness, fontsize * 1.4 + borderThickness);

        // text color
        context.fillStyle = fontColor;

        //实际上这不是严格意义的居中，是靠上一点，倾斜之后效果反而更好，y值是对应文字下沿
        context.fillText(message, canvas.width/2, canvas.height/2);//edit by xy 居中
        //TODELETE测试 
        // context.fillStyle = "rgba(255, 0, 0, 0.3)";
        // context.fillRect(0,0,canvas.width,canvas.height); 

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas)
        texture.needsUpdate = true;


        var spriteMaterial = new THREE.SpriteMaterial(
            {
                map: texture,
                //useScreenCoordinates: false comment by xy new version of three.js don't have this property
            });
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(100,100,1.0);//edit by xy 改为perspective相机后大小要变
        sprite.width = metrics.width*0.66;
        sprite.height = fontsize/2;//edit by xy 这个越大，纵向显示的注记就越少
        return sprite;
    }

    //resize the map
    this.resize = function (width, height){
        _this.camera.aspect = width / height;
        _this.camera.updateProjectionMatrix();

        _this.renderer.setSize( width, height );
        _controls.viewChanged = true;
    }

    //set if the objects are selectable
    this.setSelectable = function (selectable) {
        if(selectable){
            _projector = new THREE.Projector();
            _rayCaster = new THREE.Raycaster();
            _mapDiv.addEventListener('mousedown', onSelectObject, false);
            _mapDiv.addEventListener('touchstart', onSelectObject, false);
        }else{
            _mapDiv.removeEventListener('mousedown', onSelectObject, false);
            _mapDiv.removeEventListener('touchstart', onSelectObject, false);
        }
        return _this;
    }

    //set if the user can pan the camera
    this.setMovable = function(movable){
        _controls.enable = movable;
        return _this;
    }    

    //get the selected object
    this.getSelectedId = function(){
        return _selected.id;
    }

    //the callback function when sth is selected
    this.setSelectionListener = function(callback){
        _selectionListener = callback;
        return _this;
    }

    //select object by id
    this.selectById = function(id){
        var floor = _this.mall.getCurFloor();
        for(var i = 0; i < floor.children.length; i++){
            if(floor.children[i].fid && floor.children[i].fid == id) { //edit by xy  从id改为了fid
                if (_selected) {
                    _selected.material.color.setHex(_selected.currentHex);
                }
                select(floor.children[i]);
            }
        }
    }

    //select object(just hight light it)
    function select(obj){
        //obj.currentHex = _selected.material.color.getHex(); //这个是用于记录自己高亮之前的颜色
        obj.material.color = new THREE.Color(_theme.selected);
        obj.scale = new THREE.Vector3(2,2,2);
    }

    //自己的数据intersect数量是0 待修复TODO
    function onSelectObject(event) {

        // find intersections
        event.preventDefault();
        var mouse = new THREE.Vector2();
        if(event.type == "touchstart"){
            mouse.x = ( event.touches[0].clientX / _canvasDiv.clientWidth ) * 2 - 1;
            mouse.y = -( event.touches[0].clientY / _canvasDiv.clientHeight ) * 2 + 1;
        }else {
            mouse.x = ( event.clientX / _canvasDiv.clientWidth ) * 2 - 1;
            mouse.y = -( event.clientY / _canvasDiv.clientHeight ) * 2 + 1;
        }
        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        vector.unproject( _this.camera);

        _rayCaster.set( _this.camera.position, vector.sub( _this.camera.position ).normalize() );

        var intersects = _rayCaster.intersectObjects( _this.mall.root.children[0].children );

        if ( intersects.length > 0 ) {

            if ( _selected != intersects[ 0 ].object ) {

                if ( _selected ) {
                    _selected.material.color.setHex( _selected.currentHex );
                }
                for(var i=0; i<intersects.length; i++) {
                    _selected = intersects[ i ].object;
                    if(_selected.type && _selected.type == "solidroom") {
                        select(_selected);
                        if(_selectionListener) {
                            _selectionListener(_selected.id); //notify the listener
                        }
                        break;
                    }else{
                        _selected = null;
                    }
                    if(_selected == null && _selectionListener != null){
                        _selectionListener(-1);
                    }
                }
            }

        } else {

            if ( _selected ) {
                _selected.material.color.setHex( _selected.currentHex );
            }

            _selected = null;
            if(_selectionListener) {
                _selectionListener(-1); //notify the listener
            }
        }
        redraw();

    }

    _this.init();
    animate();

    //add by xy 在three.js的场景下做尺度变换 显示三维动态符号 隐藏房间、点和注记 或者反过来
    // this.showOrHideRoom = function (flag) {
    //     //隐藏所有房间和房间的骨架线
    //     var floors = _this.mall.floors;
    //     floors.forEach(floor => { 
    //         floor.traverse(function (object) {
    //             if (object.type == "solidroom" || object.type == "Line") {
    //                 object.visible = flag;
    //             }
    //             else if (object.type == "3dsymbol" ||object.type=="DashedLine") { 
    //                 object.visible = !flag;
    //             }
    //         });
    //     })
    //     //隐藏点和注记
    //     _this.showAreaNames(flag);
    //     _this.showPubPoints(flag);
    //     if (flag == true) {
    //         var floorid = _this.mall.getCurFloor();
    //         createPubPointSprites(floorid);
    //         createNameSprites(floorid);
    //         redraw();
    //         updateLabels();
    //     } else { 
    //         clearNameSprites();
    //         clearPubPointSprites();
    //     }
    //     redraw();
    //     //显示三维动态符号
    // }

    //add by xy 判断zoom是否跨过分界点，跨的时候改变显示内容
    // var queueZoom = [1, 1];
    // const threshold = 0.6;
    // function checkZoom() { 
    //     var zoom = _this.getZoom();
    //     queueZoom.shift();
    //     queueZoom.push(zoom);
    //     //console.log(queueZoom);
    //     if (queueZoom[1] < threshold && queueZoom[0] > threshold) {//缩小 跨过阈值
    //         _this.showOrHideRoom(false);
    //     }
    //     else if (queueZoom[1] > threshold && queueZoom[0] < threshold) {//放大 跨过阈值 
    //         _this.showOrHideRoom(true);
    //     }
    // }
}