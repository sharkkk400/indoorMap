//开始展示室内地图的zoom
const indoorThresholdZoom=15;

//所有室内地图对象（MapboxIndoor类的对象）存储在这里 例如万达广场、创意城
var mapboxIndoors={};

//装室内地图的div
var indoorMapDivContainer=document.createElement('div');
indoorMapDivContainer.id="indoorMapDivContainer";
document.body.appendChild(indoorMapDivContainer);

const indoorLayerName="indoor";
const indoorTransparentName=indoorLayerName+"Transparent";//透明图层 用于判断楼层控制按钮的显示 缩放到有室内地图的地方就显示楼层控制按钮等

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

map.on('load',function(){
    map.addSource(indoorLayerName,{
        'type': 'geojson',
        'data':'G:/code/indoorMap/code/data/indoor.geojson'//所有包含室内地图的建筑物构成的图层
    });

    //添加透明图层 用于判断楼层控制按钮的显示
    map.addLayer(constructLayer(indoorTransparentName, indoorLayerName, '', indoorThresholdZoom, 22, 0));//透明度0

    //添加室内地图 geojson文件中每个建筑物的属性数据包含了对应室内地图的相关信息 根据它初始化室内地图
    $.getJSON("data/indoor.geojson",function(data){
        data.features.forEach(feature=>{
            var fileName = feature.properties.fileName;
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
            _this.indoorMap.showAreaNames(false).showPubPoints(false).showAllFloors();
            document.body.appendChild(IndoorMap.getUL(_this.indoorMap,map));
            document.body.appendChild(IndoorMap.poicontrol(_this.indoorMap,map));
            _this.indoorMap.showSpecificLevelData(0);//显示墙体
            //IndoorMap.test(_this.indoormap);
            //添加室内地图到mapbox中并设置显示的级别范围
            var object3d=_this.indoorMap.mall.root;//所有的object3d（楼层房间等等）都在root这个group object3d下，直接把root从three.js场景迁到mapbox中
            _this.threeboxIndoor=new ThreeboxIndoor(fileName,position,object3d,_this.indoorMap);
            //map.addLayer(new ThreeJSIndoor(fileName,lon,lat,angle,scale,object3d));
            map.addLayer(_this.threeboxIndoor);//custom layer
            map.setLayerZoomRange(fileName, indoorThresholdZoom, 22);

            map.on('move',function (){
                var z = map.getZoom();
                var _ul = document.getElementById('_ul');
                var _div = document.getElementById('_div');
                if(z<=22&&z>=indoorThresholdZoom){
                    _ul.style.display = "block";
                    _div.style.display = "block";
                    mapboxIndoors[fileName].updateSprites();
                }
                else{
                    _ul.style.display = "none";
                    _div.style.display = "none";
                }
            })

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

function animate(time) {

    // stats.begin();

    // monitored code goes here
    TWEEN.update(time);

    // stats.end();

    //stats.update();

    requestAnimationFrame( animate );

}

requestAnimationFrame(animate);