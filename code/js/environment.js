//*********噪音、光照、云雾等环境信息的集成***********//
//*****噪音******/
document.getElementById("noiseLayer").flag = false;
document.getElementById("noiseLayer").addEventListener("click", function () {
    this.flag = !this.flag;

    if (map.getLayer("noise_L1") == undefined) { //没有噪音图层时，就首次加载
        loadNoiseLayers();
    }    

    //var visibility = this.checked ? 'visible' : 'none';
    var visibility = this.flag ? 'visible' : 'none';
    map.setLayoutProperty('noise_L1','visibility',visibility);
    map.setLayoutProperty('noise_L2','visibility',visibility);
    map.setLayoutProperty('noise_L3','visibility',visibility);
});

function loadNoiseLayers() {
    //新的噪音综合效果 矢量的方式 填补了缝隙 改进了综合效果 
    map.addLayer({
        'id': 'noise_L1',
        //直接加载geojson 
        source:{
            'type': 'geojson',
            'data': 'data/noise_L1.geojson'
        },
        //geoserver切片
        // 'source':{
        //     'type':'vector',
        //     'scheme':'tms',
        //     'tiles':['http://'+Config.host+'/geoserver/gwc/service/tms/1.0.0/moreLevel%3A'+'noise_L1'+'@EPSG:900913@pbf/{z}/{x}/{y}.pbf']
        // },
        // 'source-layer':'noise_L1',
        'type': 'fill',
        'minzoom': 17,
        'maxzoom': 22,
        'paint': {
            'fill-color': [
                'match',
                ['get', 'gridcode'],
                0, 'rgb(75,200,0)',
                1, 'rgb(85,255,0)',
                2, 'rgb(185,255,113)',
                3, 'rgb(255,255,0)',
                4, 'rgb(255,169,0)',
                5, 'rgb(255,0,0)',
                6, 'rgb(210,0,255)',
                7, 'rgb(155,0,99)',
                8, 'rgb(128,0,0)',
                /* other */ '#ccc'
            ],
            // 'fill-outline-color': '#111',
            'fill-opacity': 0.9
        }
    },"wuhan_L1");

    map.addLayer({
        'id': 'noise_L2',
        'source':{
            'type': 'geojson',
            'data': 'data/noise_L2.geojson'
        },
        // 'source':{
        //     'type':'vector',
        //     'scheme':'tms',
        //     'tiles':['http://'+Config.host+'/geoserver/gwc/service/tms/1.0.0/moreLevel%3A'+'noise_L2'+'@EPSG:900913@pbf/{z}/{x}/{y}.pbf']
        // },
        // 'source-layer':'noise_L2',
        'type': 'fill',
        'minzoom': 16,
        'maxzoom': 17,
        'paint': {
            'fill-color': [
                'match',
                ['get', 'code_L2'],
                0, 'rgb(80,227,0)',
                2, 'rgb(185,255,113)',
                3, 'rgb(255,255,0)',
                4, 'rgb(255,169,0)',
                5, 'rgb(255,0,0)',
                6, 'rgb(182,0,177)',
                8, 'rgb(128,0,0)',
                /* other */ '#ccc'
            ],
            // 'fill-outline-color': '#111',
            'fill-opacity': 0.9
        }
    },"wuhan_L1");

    map.addLayer({
        'id': 'noise_L3',
        'source':{
            'type': 'geojson',
            'data': 'data/noise_L3.geojson'
        },
        // 'source':{
        //     'type':'vector',
        //     'scheme':'tms',
        //     'tiles':['http://'+Config.host+'/geoserver/gwc/service/tms/1.0.0/moreLevel%3A'+'noise_L3'+'@EPSG:900913@pbf/{z}/{x}/{y}.pbf']
        // },
        // 'source-layer':'noise_L3',
        'type': 'fill',
        'minzoom': 15,
        'maxzoom': 16,
        'paint': {
            'fill-color': [
                'match',
                ['get', 'code_L3'],
                0, 'rgb(80,227,0)',
                2, 'rgb(220,255,56)',
                4, 'rgb(255,84,0)',
                6, 'rgb(182,0,177)',
                8, 'rgb(128,0,0)',
                /* other */ '#ccc'
            ],
            // 'fill-outline-color': '#111',
            'fill-opacity': 0.9
        }
    },"wuhan_L1");
    
    //旧的噪音综合，看栅格的，查询矢量的，不要了
    //加载三个tiff图层（数据在geoserver中noisesimple文件夹） 和三个shp图层 用于点击查询噪音分贝（noise_20190510文件夹）
    // //大比例尺数据
    // map.addLayer({
    //     'id': 'noise1',
    //     'type': 'raster',
    //     'minzoom': 17,
    //     'maxzoom': 22,
    //     'source': {
    //         'type': 'raster',
    //         'tiles': [
    //             'http://'+Config.host+'/geoserver/shzy/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&LAYERS=shzy%3Anoise1&SRS=EPSG%3A3857&WIDTH=753&HEIGHT=768&BBOX={bbox-epsg-3857}'
    //         ],

    //         'tileSize': 256
    //     },
    //     'paint': {
    //         "raster-opacity": 0.7
    //     }
    // },"wuhan_L1");
    // map.addSource('noise2c', {
    //     'type': 'vector',
    //     'scheme': 'tms',
    //     'tiles': ['http://'+Config.host+'/geoserver/gwc/service/tms/1.0.0/shzy%3Anoise2c@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf']
    // });
    // map.addLayer({
    //     'id': 'noise2c',
    //     'source': 'noise2c',
    //     'source-layer':'noise2c',
    //     'type': 'fill-extrusion',
    //     'minzoom': 17,
    //     'maxzoom': 22,
    //     'paint': {
    //         'fill-extrusion-color': 'red' ,
    //         'fill-extrusion-opacity': 0
    //     }
    // },"wuhan_L1");

    // //中比例尺数据
    // map.addLayer({
    //     'id': 'noise2',
    //     'type': 'raster',
    //     'minzoom': 15,
    //     'maxzoom': 17,
    //     'source': {
    //         'type': 'raster',
    //         'tiles': [
    //             'http://'+Config.host+'/geoserver/shzy/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&LAYERS=shzy%3Anoise2&SRS=EPSG%3A3857&WIDTH=753&HEIGHT=768&BBOX={bbox-epsg-3857}'
    //         ],

    //         'tileSize': 256
    //     },
    //     'paint': {
    //         "raster-opacity": 0.7
    //     }
    // },"wuhan_L1");
    // map.addSource('noise3c', {
    //     'type': 'vector',
    //     'scheme': 'tms',
    //     'tiles': ['http://'+Config.host+'/geoserver/gwc/service/tms/1.0.0/shzy%3Anoise3c@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf']
    // });
    // map.addLayer({
    //     'id': 'noise3c',
    //     'source': 'noise3c',
    //     'source-layer':'noise3c',
    //     'type': 'fill-extrusion',
    //     'minzoom': 15,
    //     'maxzoom': 17,
    //     'paint': {
    //         'fill-extrusion-color': 'red' ,
    //         'fill-extrusion-opacity': 0
    //     }
    // },"wuhan_L1");

    // //小比例尺数据
    // map.addLayer({
    //     'id': 'noise3',
    //     'type': 'raster',
    //     'minzoom': 13,
    //     'maxzoom': 15,
    //     'source': {
    //         'type': 'raster',
    //         'tiles': [
    //             'http://'+Config.host+'/geoserver/shzy/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&LAYERS=shzy%3Anoise3&SRS=EPSG%3A3857&WIDTH=753&HEIGHT=768&BBOX={bbox-epsg-3857}'
    //         ],

    //         'tileSize': 256
    //     },
    //     'paint': {
    //         "raster-opacity": 0.7
    //     }
    // },"wuhan_L1");
    // map.addSource('noise4c', {
    //     'type': 'vector',
    //     'scheme': 'tms',
    //     'tiles': ['http://'+Config.host+'/geoserver/gwc/service/tms/1.0.0/shzy%3Anoise4c@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf']
    // });
    // map.addLayer({
    //     'id': 'noise4c',
    //     'source': 'noise4c',
    //     'source-layer':'noise4c',
    //     'type': 'fill-extrusion',
    //     'minzoom': 13,
    //     'maxzoom': 15,
    //     'paint': {
    //         'fill-extrusion-color': 'red' ,
    //         'fill-extrusion-opacity': 0
    //     }
    // },"wuhan_L1");

    // //加载进去之后先设为不可见
    // map.setLayoutProperty('noise1','visibility',"none");
    // map.setLayoutProperty('noise2c','visibility',"none");
    // map.setLayoutProperty('noise2','visibility',"none");
    // map.setLayoutProperty('noise3c','visibility',"none");
    // map.setLayoutProperty('noise3','visibility',"none");
    // map.setLayoutProperty('noise4c','visibility',"none");
}

//点击查询噪音分贝
map.on('click', 'noise_L1', function (e) {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.noise)
        .addTo(map);
});
map.on('click', 'noise_L2', function (e) {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.noise)
        .addTo(map);
});
map.on('click', 'noise_L3', function (e) {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.noise)
        .addTo(map);
});

//*******建筑物阴影*******//
const shadowLayerName="building-shadows";
document.getElementById("lightToggle").addEventListener("change", function () {
    if (this.checked) {
        if (map.getLayer(shadowLayerName) == undefined) {
            //添加一个隐藏的三维建筑图层 根据这个图层来设置阴影 因为按高度设置不同颜色会影响阴影 所以要加个颜色统一的隐藏图层
            var xixi = "wuhan_L1_transparent";
            var minLevel = zoomForEachScale[8];//为最详细级别的建筑设置阴影
            var maxLevel = zoomForEachScale[9];
            map.addSource(xixi, {
                'type': 'vector',
                'scheme': 'tms',
                'tiles': ['http://' + Config.host + '/geoserver/gwc/service/tms/1.0.0/moreLevel%3A' + 'wuhan_L1' + '@EPSG:900913@pbf/{z}/{x}/{y}.pbf']
            });
            map.addLayer({
                'id': xixi,
                'source': xixi,
                'source-layer': "wuhan_L1",//这里不能是xixi
                'type': 'fill-extrusion',
                'minzoom': minLevel,
                'maxzoom': maxLevel,
                'paint': {
                    'fill-extrusion-color': 'rgb(255,240,174)',
                    'fill-extrusion-height': extrusionHeight,
                    'fill-extrusion-base': extrusionBase,
                    'fill-extrusion-opacity': 0,
                }
            });

            setBuildingShadows({ layerId: shadowLayerName, buildingsLayerId: 'wuhan_L1_transparent', beforeLayerId: 'wuhan_L1', minAltitude: 0.10 });
        }
        map.setLayoutProperty(shadowLayerName,'visibility','visible');
        map.on("render",simulateSunlight)
    }
    else{
        map.setLayoutProperty(shadowLayerName,'visibility','none');
        map.off("render",simulateSunlight);
    }
})

function simulateSunlight() {
    const { lng, lat } = map.getCenter();
    const sunPosition = getSunPosition(date, [lng, lat]);
    map.setLight({
        anchor: 'map',
        position: [3, 180 + sunPosition.azimuth * 180 / Math.PI, 90 - sunPosition.altitude * 180 / Math.PI],
        intensity: Math.cos(sunPosition.altitude), //0.4,
        color: `hsl(40, ${50 * Math.cos(sunPosition.altitude)}%, ${Math.max(20, 20 + (96 * Math.sin(sunPosition.altitude)))}%)`

    }, { duration: 0 });

    let dateTZ = dateToTimezone(date, "Asia/Shanghai");
    hour.innerHTML = "模拟" + dateTZ.toLocaleString() + "的日照";
}

//时间控制
let date = new Date(2020, 7, 14, 15, 3);
let time = (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds());
let timeInput = document.getElementById('time');
timeInput.value = time;
timeInput.oninput = () => {
    time = +timeInput.value;
    date.setHours(Math.floor(time / 3600));
    date.setMinutes(Math.floor(time / 60) % 60);
    date.setSeconds(time % 60);
    map.triggerRepaint();
};

function dateToTimezone(date = new Date(), timezone) {
    let tzTime = date.toLocaleString("en-US", { timeZone: timezone });
    return new Date(tzTime);
}

function setBuildingShadows(options) {
    if (map.getLayer(options.buildingsLayerId)) {
        let layer = new BuildingShadows(options);
        map.addLayer(layer, options.beforeLayerId);
    }
    else {
        console.warn("The layer '" + options.buildingsLayerId + "' does not exist in the map.");
    }
}

function getSunPosition(date, coords) {
    return SunCalc.getPosition(date || Date.now(), coords[1], coords[0]);
}

class BuildingShadows {
    constructor(options) {
        this.id = options.layerId;
        this.type = 'custom';
        this.renderingMode = '3d';
        this.opacity = 0.5;
        this.buildingsLayerId = options.buildingsLayerId;
        this.minAltitude = options.minAltitude || 0.10;
    }
    onAdd(map, gl) {
        this.map = map;
        const vertexSource = `
            uniform mat4 u_matrix;
            uniform float u_height_factor;
            uniform float u_altitude;
            uniform float u_azimuth;
            attribute vec2 a_pos;
            attribute vec4 a_normal_ed;
            attribute lowp vec2 a_base;
            attribute lowp vec2 a_height;
            void main() {
                float base = max(0.0, a_base.x);
                float height = max(0.0, a_height.x);
                float t = mod(a_normal_ed.x, 2.0);
                vec4 pos = vec4(a_pos, t > 0.0 ? height : base, 1);
                float len = pos.z * u_height_factor / tan(u_altitude);
                pos.x += cos(u_azimuth) * len;
                pos.y += sin(u_azimuth) * len;
                pos.z = 0.0;
                gl_Position = u_matrix * pos;
            }
            `;
        const fragmentSource = `
            void main() {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);
            }
            `;
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        gl.validateProgram(this.program);
        this.uMatrix = gl.getUniformLocation(this.program, "u_matrix");
        this.uHeightFactor = gl.getUniformLocation(this.program, "u_height_factor");
        this.uAltitude = gl.getUniformLocation(this.program, "u_altitude");
        this.uAzimuth = gl.getUniformLocation(this.program, "u_azimuth");
        this.aPos = gl.getAttribLocation(this.program, "a_pos");
        this.aNormal = gl.getAttribLocation(this.program, "a_normal_ed");
        this.aBase = gl.getAttribLocation(this.program, "a_base");
        this.aHeight = gl.getAttribLocation(this.program, "a_height");
    }
    render(gl, matrix) {
        gl.useProgram(this.program);
        //const source = this.map.style.sourceCaches['composite'];
        const source = this.map.style.sourceCaches['wuhan_L1_transparent'];
        const coords = source.getVisibleCoordinates().reverse();
        const buildingsLayer = this.map.getLayer(this.buildingsLayerId);
        const context = this.map.painter.context;
        const { lng, lat } = this.map.getCenter();
        const pos = getSunPosition(date, [lng, lat]);
        gl.uniform1f(this.uAltitude, (pos.altitude > this.minAltitude ? pos.altitude : 0));
        gl.uniform1f(this.uAzimuth, pos.azimuth + 3 * Math.PI / 2);
        //this.opacity = Math.sin(Math.max(pos.altitude, 0)) * 0.6;
        gl.enable(gl.BLEND);
        //gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.DST_ALPHA, gl.SRC_ALPHA);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        var ext = gl.getExtension('EXT_blend_minmax');
        //gl.blendEquationSeparate(gl.FUNC_SUBTRACT, ext.MIN_EXT);
        //gl.blendEquation(gl.FUNC_ADD);
        gl.disable(gl.DEPTH_TEST);
        for (const coord of coords) {
            const tile = source.getTile(coord);
            const bucket = tile.getBucket(buildingsLayer);
            if (!bucket) continue;
            const [heightBuffer, baseBuffer] = bucket.programConfigurations.programConfigurations[this.buildingsLayerId]._buffers;
            gl.uniformMatrix4fv(this.uMatrix, false, coord.posMatrix);
            gl.uniform1f(this.uHeightFactor, Math.pow(2, coord.overscaledZ) / tile.tileSize / 8);
            for (const segment of bucket.segments.get()) {
                const numPrevAttrib = context.currentNumAttributes || 0;
                const numNextAttrib = 2;
                for (let i = numNextAttrib; i < numPrevAttrib; i++) gl.disableVertexAttribArray(i);
                const vertexOffset = segment.vertexOffset || 0;
                gl.enableVertexAttribArray(this.aPos);
                gl.enableVertexAttribArray(this.aNormal);
                gl.enableVertexAttribArray(this.aHeight);
                gl.enableVertexAttribArray(this.aBase);
                bucket.layoutVertexBuffer.bind();
                gl.vertexAttribPointer(this.aPos, 2, gl.SHORT, false, 12, 12 * vertexOffset);
                gl.vertexAttribPointer(this.aNormal, 4, gl.SHORT, false, 12, 4 + 12 * vertexOffset);
                heightBuffer.bind();
                gl.vertexAttribPointer(this.aHeight, 1, gl.FLOAT, false, 4, 4 * vertexOffset);
                baseBuffer.bind();
                gl.vertexAttribPointer(this.aBase, 1, gl.FLOAT, false, 4, 4 * vertexOffset);
                bucket.indexBuffer.bind();
                context.currentNumAttributes = numNextAttrib;
                gl.drawElements(gl.TRIANGLES, segment.primitiveLength * 3, gl.UNSIGNED_SHORT, segment.primitiveOffset * 3 * 2);
            }
        }
    }
}

//*********光照**********// 
//TODO globe控件有点不跟手
//光照相关控件加进来并绑定事件
var canvEl = document.getElementById('canv');
var widgetWidth = menu.offsetWidth-20;//本来源代码是canv.offsetWidth，由于一开始面板要隐藏，改为使用menu的宽度
var g = Globe()
    .color('rgba(255,255,255,0.8)')
    .lightColor('#86cfd2')
    .width(widgetWidth)
    .on('change', function (rotation) {
        console.log(rotation);
        map.setLight({
            position: rotation,
            'position-transition': {
                duration: 0
            }
        });
    });
d3.select('#canv')
    .append('div')
    .call(ColorPicker()
        .width(widgetWidth)
        .height(Math.min(widgetWidth, 150))
        .center('#86cfd2')
        .on('change', function(color) {
            g.lightColor(color);
            map.setLight({
                color: color,
                'color-transition': {
                    duration: 0
                }
            });
        }));
d3.select('#globe')
    .append('div')
    .call(g);
document.getElementById('intensity').addEventListener('input', function(e) {
    map.setLight({
        intensity: +e.target.value,
        'intensity-transition': {
            duration: 0
        }
    });
}); 

//***********云*************//
var cloudMesh;
var cloudPosition = [map.getCenter().lng,map.getCenter().lat,1000];//直接加在地图的中心
var speedFactor=document.getElementById("cloud-speed").value/100000;
var cloudDirection=document.getElementById("cloud-direction").value;

document.getElementById("cloudToggle").addEventListener("change",function(){
    if (this.checked){
        if (cloudMesh){
            cloudMesh.visible=true;
            map.triggerRepaint();
            return;
        }        

        map.addLayer({
            id: 'cloud',
            type: 'custom',
            onAdd: function(map, mbxContext){
                tb = new Threebox(
                    map, 
                    mbxContext,
                    {defaultLights: true}
                );
    
                var geometry = new THREE.Geometry();

                var texture = THREE.ImageUtils.loadTexture( './data/cloud10.png');
                texture.magFilter = THREE.LinearMipMapLinearFilter;
                texture.minFilter = THREE.LinearMipMapLinearFilter;

                var fog = new THREE.Fog( 0xffffff, - 100, 3000 );

                var material = new THREE.ShaderMaterial( {
                    uniforms: {
                        "map": { type: "t", value: texture },
                        "fogColor" : { type: "c", value: fog.color },
                        "fogNear" : { type: "f", value: fog.near },
                        "fogFar" : { type: "f", value: fog.far },
                    },
                    vertexShader: document.getElementById( 'vs' ).textContent,
                    fragmentShader: document.getElementById( 'fs' ).textContent,
                    depthWrite: false,
                    depthTest: false,
                    transparent: true
                } );

                var plane = new THREE.Mesh( new THREE.PlaneGeometry( 64, 64 ) );

                for ( var i = 0; i < 10; i++ ) {
                    plane.position.x = getNumberInNormalDistribution(0,1)*200;
                    plane.position.y = getNumberInNormalDistribution(0,1)*200;
                    plane.position.z = getNumberInNormalDistribution(0,1)*100;
                    plane.rotation.z = Math.random() * Math.PI;
                    plane.scale.x = plane.scale.y = 10+Math.random() * 20;

                    THREE.GeometryUtils.merge( geometry, plane );//TODO改用新的
                }
                
                cloudMesh = new THREE.Mesh( geometry, material );
                cloudMesh = tb.Object3D({obj: cloudMesh, units:'meters'})
                    .setCoords(cloudPosition);
                tb.add(cloudMesh);
                map.triggerRepaint();
            },
            
            render: function(gl, matrix){
                tb.update();
            }
        })  
        
        function animate() {
            requestAnimationFrame( animate );
            cloudPosition[0]+=speedFactor*Math.cos(2 * Math.PI / 360 * cloudDirection);
            cloudPosition[1]+=speedFactor*Math.sin(2 * Math.PI / 360 * cloudDirection);
            cloudMesh.setCoords(cloudPosition);
        }
        animate();
    }else{
        cloudMesh.visible=false;
        map.triggerRepaint();
    }
});

document.getElementById("cloud-color").addEventListener("change",function(){
    var r = parseInt(this.value).toString(16);
    if (r.length === 1) r = 0 + r;
    var rgb = "0x" + r + r + r;
    var numRGB = Number(rgb);
    var color=new THREE.Color(numRGB);
    cloudMesh.children[0].material.uniforms.fogColor.value=color;
});

document.getElementById("cloud-size").addEventListener("change",function(e){
    var s=this.value/100;
    cloudMesh.children[0].scale.set(s,s,s);
});

document.getElementById("cloud-speed").addEventListener("change",function(e){
    speedFactor=e.target.value/100000;
});

document.getElementById("cloud-direction").addEventListener("change",function(){
    cloudDirection=this.value;
});

document.getElementById("cloud-position-control").addEventListener("click",function(e){
    const coordinateOffset=0.01;//每次移动多少
    const heightOffset=100;
    switch (e.target.id){
        case "cloud-north":
            cloudPosition[1]+=coordinateOffset;
            break;
        case "cloud-west":
            cloudPosition[0]-=coordinateOffset;
            break;
        case "cloud-east":
            cloudPosition[0]+=coordinateOffset;
            break;
        case "cloud-south":
            cloudPosition[1]-=coordinateOffset;
            break;
        case "cloud-up":
            cloudPosition[2]+=heightOffset;
            break;
        case "cloud-down":
            cloudPosition[2]-=heightOffset;
            break;
        default:
            break;
    }
    cloudMesh.setCoords(cloudPosition)
});

function getNumberInNormalDistribution(mean,std_dev){
    return mean+(randomNormalDistribution()*std_dev);
}

function randomNormalDistribution(){
    var u=0.0, v=0.0, w=0.0, c=0.0;
    do{
        //获得两个（-1,1）的独立随机变量
        u=Math.random()*2-1.0;
        v=Math.random()*2-1.0;
        w=u*u+v*v;
    }while(w==0.0||w>=1.0)
    //这里就是 Box-Muller转换
    c=Math.sqrt((-2*Math.log(w))/w);
    //返回2个标准正态分布的随机数，封装进一个数组返回
    //当然，因为这个函数运行较快，也可以扔掉一个
    //return [u*c,v*c];
    return u*c;
}