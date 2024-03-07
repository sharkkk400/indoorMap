/**
 * Created by gaimeng on 14/12/27.
 * Modified a lot by xiaoyi
 */
const THREE = window.THREE;
var System={};
var js=document.scripts;
js=js[js.length-1].src.substring(0,js[js.length-1].src.lastIndexOf("/"));
System.path = js;
System.libPath = System.path.substring(0,System.path.lastIndexOf("/"));
System.imgPath = System.libPath+"/img";

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik M ller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] +
            'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}());

//IDM namespace
var IDM = {}
IDM.Browser = {};
//Browser detection
(function() {
    var a = "ActiveXObject" in window,
        c = a && !document.addEventListener,
        e = navigator.userAgent.toLowerCase(),
        f = -1 !== e.indexOf("webkit"),
        m = -1 !== e.indexOf("chrome"),
        p = -1 !== e.indexOf("phantom"),
        isAndroid = -1 !== e.indexOf("android"),
        r = -1 !== e.search("android [23]"),
        gecko = -1 !== e.indexOf("gecko"),
        isIphone = -1 !== e.indexOf("iphone"),
        isSymbianOS = -1 !== e.indexOf("symbianos"),
        isWinPhone = -1 !== e.indexOf("windows phone"),
        isIpad =  -1 !== e.indexOf("ipad"),
        k = isIphone || isWinPhone || isSymbianOS || isAndroid ||isIpad,
        q = window.navigator && window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints && !window.PointerEvent,
        t = window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints || q,
        y = "devicePixelRatio" in window && 1 < window.devicePixelRatio || "matchMedia" in window && window.matchMedia("(min-resolution:144dppi)") &&
            window.matchMedia("(min-resolution:144dppi)").matches,
        l = document.documentElement,
        A = a && "transition" in l.style,
        x = "WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix && !r,
        B = "MozPerspective" in l.style,
        z = "OTransition" in l.style,
        G = !window.L_DISABLE_3D && (A || x || B || z) && !p,
        p = !window.L_NO_TOUCH && !p && function() {
                if (t || "ontouchstart" in l) return !0;
                var a = document.createElement("div"),
                    c = !1;
                if (!a.setAttribute) return !1;
                a.setAttribute("ontouchstart", "return;");
                "function" === typeof a.ontouchstart && (c = !0);
                a.removeAttribute("ontouchstart");
                return c
            }();
    IDM.Browser = {
        ie: a,
        ielt9: c,
        webkit: f,
        gecko: gecko && !f && !window.opera && !a,
        android: isAndroid,
        android23: r,
        iphone: isIphone,
        ipad: isIpad,
        symbian: isSymbianOS,
        winphone: isWinPhone,
        chrome: m,
        ie3d: A,
        webkit3d: x,
        gecko3d: B,
        opera3d: z,
        any3d: G,
        mobile: k,
        mobileWebkit: k && f,
        mobileWebkit3d: k && x,
        mobileOpera: k && window.opera,
        touch: p,
        msPointer: q,
        pointer: t,
        retina: y
    }
}());

//---------------------the IDM.GeomUtil class--------------------
//get the bounding Rect of the points
function Rect(minx,miny,maxx,maxy){
    this.tl = [minx || 0, miny || 0]; //top left point
    this.br = [maxx || 0, maxy || 0]; //bottom right point
}

Rect.prototype.isCollide = function(rect){
    if(rect.br[0] < this.tl[0] || rect.tl[0] > this.br[0] ||
        rect.br[1] < this.tl[1] || rect.tl[1] > this.br[1]){
        return false;
    }
    return true;
}

IDM.GeomUtil = {

    getBoundingRect: function (points) {
        var rect = new Rect();
        //if there are less than 1 point
        if (points.length < 2) {
            return rect;
        }
        var minX = 9999999, minY = 9999999, maxX = -9999999, maxY = -9999999;
        for (var i = 0; i < points.length - 1; i += 2) {

            if (points[i] > maxX) {
                maxX = points[i];
            }
            if (points[i] < minX) {
                minX = points[i];
            }
            if (points[i + 1] > maxY) {
                maxY = points[i + 1];
            }
            if (points[i + 1] < minY) {
                minY = points[i + 1];
            }
        }
        rect.tl = [minX, minY];
        rect.br = [maxX, maxY];
        return rect;
    }
}
//---------------------the IDM.DomUtil class--------------------
IDM.DomUtil = {

    getElementLeft: function (element) {
        var actualLeft = element.offsetLeft;
        var current = element.offsetParent;
        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    },

    getElementTop: function (element) {

        var actualTop = element.offsetTop;
        var current = element.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    },

    getTranslateString: function(point) {
        var dim = IDM.Browser.webkit3d;
        return "translate" + (dim ? "3d" : "") + "(" + point[0] + "px," + point[1] + "px" + ((dim ? ",0" : "") + ")");
    },

    getPos: function (element) {
        return element._idm_pos ? element._idm_pos : [IDM.DomUtil.getElementLeft(element), IDM.DomUtil.getElementTop(element)];
    },
    setPos: function (element, point) {
        element._idm_pos = point;
        IDM.Browser.any3d ? element.style[IDM.DomUtil.TRANSFORM] = IDM.DomUtil.getTranslateString(point) : (element.style.left = point[0] + "px", element.style.top = point[1] + "px")
        //element.style.left = point[0] + "px";
        //element.style.top = point[1] + "px";
    },

    testProp: function(props) {
        for (var c =
            document.documentElement.style, i = 0; i < props.length; i++)
            if (props[i] in c) return props[i];
        return false;
    }
}

IDM.DomUtil.TRANSFORM = IDM.DomUtil.testProp(["transform", "WebkitTransform", "OTransform", "MozTransform", "msTransform"]);
IDM.DomUtil.TRANSITION = IDM.DomUtil.testProp(["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]);
IDM.DomUtil.TRANSITION_END = "webkitTransition" === IDM.DomUtil.TRANSITION || "OTransition" === IDM.DomUtil.TRANSITION ? IDM.DomUtil.TRANSITION + "End" : "transitionend";

//---------------------the Mall class--------------------
function Mall(){
    var _this = this;
    this.floors = [];   //the floors
    this.building = null; //the building
    this.root = null; //the root scene
    this.is3d = true;
    this.jsonData = null; //original json data
    this.storeyHeight = null;//add by xy

    var _curFloorId;

    //get building id
    this.getBuildingId = function(){
        var mallid = _this.jsonData.data.building.Mall;
        return mallid? mallid : -1;
    }

    //get default floor id
    this.getDefaultFloorId = function(){
        return _this.jsonData.data.building.DefaultFloor;
    }

    //get current floor id
    this.getCurFloorId = function() {
        return _curFloorId;
    }

    //get floor num
    this.getFloorNum = function(){
        return _this.jsonData.data.Floors.length;
    }

    //get floor by id
    this.getFloor = function(id) {
        for(var i = 0; i < _this.floors.length; i++) {
            if(_this.floors[i]._id == id) {
                return _this.floors[i];
            }
        }
        return null;
    }

    //get floor by name
    this.getFloorByName = function(name){
        for(var i = 0; i < _this.floors.length; i++) {
            if(_this.floors[i].Name == name) {
                return _this.floors[i];
            }
        }
        return null;
    }

    //get current floor
    this.getCurFloor = function() {
        return _this.getFloor(_curFloorId);
    }

    //get Floor's json data
    this.getFloorJson = function(fid){
        var floorsJson = _this.jsonData.data.Floors;
        for(var i = 0; i < floorsJson.length; i++){
            if(floorsJson[i]._id == fid) {
                return floorsJson[i];
            }
        }
        return null;
    }

    //show floor by id
    this.showFloor = function(id){
        if(_this.is3d) {
            //set the building outline to invisible
            _this.root.remove(_this.building);
            //set all the floors to invisible
            for (var i = 0; i < _this.floors.length; i++) {
                if (_this.floors[i]._id == id) {
                    //set the specific floor to visible
                    _this.floors[i].position.set(0, 0, 0);
                    _this.root.add(_this.floors[i]);
                } else {
                    _this.root.remove(_this.floors[i]);
                }
            }
        }
        _curFloorId = id;
    }

    //show the whole building
    this.showAllFloors = function(){
        if(!_this.is3d){ //only the 3d map can show all the floors
            return;
        }

        _this.root.add(_this.building);

        var offset = this.storeyHeight/this.floors[0].height; //edit by xy 可拉大间距 原本是4 即楼层间距与房间高度的关系
        for(var i=0; i<_this.floors.length; i++){
            //_this.floors[i].position.set(0,0,i*_this.floors[i].height*offset);
            _this.floors[i].position.set(0,0,i*this.storeyHeight);
            _this.root.add(this.floors[i]);
        }
        this.building.scale.set(1,1,offset);

        _curFloorId = 0;

        return _this.root;
    }
}

//----------------------------the Loader class --------------------------
IndoorMapLoader= function ( is3d ) {
    THREE.Loader.call( this, is3d );

    this.withCredentials = false;
    this.is3d = is3d;
};

IndoorMapLoader.prototype = Object.create( THREE.Loader.prototype );

IndoorMapLoader.prototype.load = function ( url, format, theme, callback, texturePath ) {//edit by xy add parameter url and format

    var scope = this;

    this.url = url;//add by xy 后面还要读取该文件所在路径下的其他文件 我的数据是文件夹下有各个楼层的数据
    this.format = format;//add by xy indoor3d项目自定义的json格式，我定义的geojson格式，蜂鸟地图的格式等等
    this.theme = theme;//add by xy 每个室内地图的主题不同，根据主题在解析数据的时候设置好颜色
    //this.onLoadStart(); //继承three.js的loader 那里这个本来就是空的 换到新版本没这项可继承
    this.loadAjaxJSON( this, url, callback );

};

IndoorMapLoader.prototype.loadAjaxJSON = function ( context, url, callback, callbackProgress ) {

    var xhr = new XMLHttpRequest();

    var length = 0;

    xhr.onreadystatechange = function () {

        if ( xhr.readyState === xhr.DONE ) {

            if ( xhr.status === 200 || xhr.status === 0 ) {

                if ( xhr.responseText ) {

                    var json = JSON.parse( xhr.responseText );

                    var result = context.parse( json );
                    callback( result );

                } else {

                    console.error( 'IndoorMapLoader: "' + url + '" seems to be unreachable or the file is empty.' );

                }

                // in context of more complex asset initialization
                // do not block on single failed file
                // maybe should go even one more level up

                context.onLoadComplete();

            } else {

                console.error( 'IndoorMapLoader: Couldn\'t load "' + url + '" (' + xhr.status + ')' );

            }

        } else if ( xhr.readyState === xhr.LOADING ) {

            if ( callbackProgress ) {

                if ( length === 0 ) {

                    length = xhr.getResponseHeader( 'Content-Length' );

                }

                callbackProgress( { total: length, loaded: xhr.responseText.length } );

            }

        } else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {

            if ( callbackProgress !== undefined ) {

                length = xhr.getResponseHeader( 'Content-Length' );

            }

        }

    };

    xhr.open( 'GET', url, true );
    xhr.withCredentials = this.withCredentials;
    xhr.send( null );

};

IndoorMapLoader.prototype.parse = function (json) {
    //return ParseModel(json, this.is3d); edit by xy 改为三种格式的解析
    switch (this.format) { 
        case 'indoor3d':
            return ParseModel(json, this.is3d);
            break;
        case 'geojson':
            var standardJson = parseGeojson(json, this.url);
            return ParseModel(standardJson, this.is3d, this.theme);
            break;
        case 'baidu':
            var standardJson = parseBaidu(json, this.url);
            return ParseModel(standardJson, this.is3d, this.theme);
            break;
        default:
            return ParseModel(json, this.is3d);
            break;
    }
    

};

//-----------------------------the Parser class ---------------------------------------
//add by xy 解析数据 geojson 蜂鸟 indoor3d 三种来源的数据都转成统一标准的对象字面量
//数据模板 基于indoor3d原始的数据格式做减法
// var standardJson = {};
// var data = {
//     building: {
//         Outline: [],
//     },
//     Floors: []
// };
// var floor = {
//     Outline: [],
//     _id: null,
//     Name:null,
//     PubPoint: [],
//     FuncAreas: []        
// };
// var point = {
//     Type: null,
//     Outline: []
// };
// var area = {
//     Name: null,
//     Category: null,
//     Outline: [],
//     Center: []
// };

//解析indoor3d项目的格式的数据 (供实验用，为解析其他格式做准备，实际不会使用，直接用原格式)
function parseIndoor3dData(json) { 
    //数据模板 基于indoor3d原始的数据格式做减法
    var standardJson = {};
    var data = {
        building: {
            Outline: [],
        },
        Floors: []
    };
    standardJson.data = data;
    //解析indoor3d的数据 照搬
    data.building.Outline = json.data.building.Outline;
    json.data.Floors.forEach(itemFloor => { 
        var newFloor = {};
        newFloor.Outline = itemFloor.Outline;
        newFloor._id = itemFloor._id;
        newFloor.Name = itemFloor.Name;
        newFloor.PubPoint = [];
        newFloor.FuncAreas = [];
        itemFloor.PubPoint.forEach(itemPubPoint => {
            var newPubPoint = {};
            newPubPoint.Type = itemPubPoint.Type;
            newPubPoint.Outline = itemPubPoint.Outline;
            newFloor.PubPoint.push(newPubPoint);
        });
        itemFloor.FuncAreas.forEach(itemFuncArea => {
            var newFuncArea = {};
            newFuncArea.Name = itemFuncArea.Name;
            newFuncArea.Category = itemFuncArea.Category;
            newFuncArea.Outline = itemFuncArea.Outline;
            newFuncArea.Center=itemFuncArea.Center;
            newFloor.FuncAreas.push(newFuncArea);
        });
        data.Floors.push(newFloor);
    })
    return standardJson;
}

//解析geojson格式的数据 自己用arcgis画各个楼层 导出geojson 用json文件组织各楼层
function parseGeojson(json,url) {
    //数据模板 基于indoor3d原始的数据格式做减法
    var standardJson = {};
    var data = {
        building: {},
        Floors: []
    };
    standardJson.data = data;

    //获取当前读取的json文件所在的路径
    var slash = url.lastIndexOf("/");
    var directory = url.substr(0, slash+1);//不能漏了斜杠本身
    
    //后面都是用实际的web墨卡托的坐标减去中心的坐标
    var centerX = json.building.Center[0];
    var centerY = json.building.Center[1];

    //遍历各个楼层
    json.Floors.forEach(floorInfo => {
        //楼层对象
        var newFloor = {
            Outline: [],
            _id: floorInfo._id,
            Name: floorInfo.Name,
            PubPoint: [],
            FuncAreas: []
        };
        //打开单个楼层的geojson
        var floorGeoJSON;
        $.ajaxSettings.async = false;
        $.getJSON(directory + floorInfo.filename, function (floorGeoJson) {
            floorGeoJSON = floorGeoJson;
        });
        //遍历每个要素
        floorGeoJSON.features.forEach(feature => {
            //添加楼层的轮廓
            if (feature.properties.level === "boundary") {
                var polygons = feature.geometry.coordinates;
                polygons.forEach(polygon => {
                    var floorOutline = [];
                    polygon.forEach(point => {
                        floorOutline.push(point[0] - centerX);
                        floorOutline.push(point[1] - centerY);
                    });
                    newFloor.Outline.push([floorOutline]);
                });
            }
            //公共设施点 门 厕所 电梯 Wifi发射点等 用点表示
            else if (feature.properties.level === "pubpoint") { 
                var pubpoint = {};
                pubpoint.Outline = [[[feature.properties.CenterX - centerX, feature.properties.CenterY - centerY]]];
                pubpoint.Category = feature.properties.Category;
                newFloor.PubPoint.push(pubpoint);
            }
            //添加原始房间数据或墙 level null 或 wall 或 1234
            else{
                //房间对象
                var newFuncArea = {
                    Name: feature.properties.Name,
                    Category: feature.properties.Category,
                    Secondary:feature.properties.Secondary,
                    Outline: [],
                    Center: [feature.properties.CenterX - centerX, feature.properties.CenterY - centerY],
                    level: feature.properties.level,//只有geojson格式才有
                    Area:feature.properties.Area
                };
                //房间轮廓 注意带洞的多边形
                var polygons = feature.geometry.coordinates;
                polygons.forEach(polygon => {
                    var areaOutline = [];
                    polygon.forEach(point => {
                        areaOutline.push(point[0] - centerX);
                        areaOutline.push(point[1] - centerY);
                    });
                    newFuncArea.Outline.push([areaOutline]);
                });
                newFloor.FuncAreas.push(newFuncArea);
            }            
        });
        data.Floors.push(newFloor);
    });

    //用一楼的边界作为建筑的边界
    data.Floors.forEach(floor => {
        if (floor._id == "1") {
            data.building.Outline = floor.Outline;
        }
    });
    data.building.storeyHeight = json.building.storeyHeight;
    data.building.roomHeight = json.building.roomHeight;
    data.building.name = json.building.name;
    //console.log(standardJson);
    return standardJson;    
}

const HOLLOW_CODE=[20594,20596],FLOOR_CODE=[20642,20643];//貌似不一定都是20642
//解析百度的数据，也是自己处理成geojson的格式
function parseBaidu(json,url) {
    //数据模板 基于indoor3d原始的数据格式做减法
    var standardJson = {};
    var data = {
        building: {},
        Floors: []
    };
    standardJson.data = data;

    //获取当前读取的json文件所在的路径
    var slash = url.lastIndexOf("/");
    var directory = url.substr(0, slash+1);//不能漏了斜杠本身
    
    //后面都是用实际的web墨卡托的坐标减去中心的坐标
    var centerX = json.center[0];
    var centerY = json.center[1];
    data.building.centerX=centerX;
    data.building.centerY=centerY;

    //遍历各个楼层
    json.floor_names.forEach(floorName => {
        //楼层对象
        var newFloor = {
            Outline: [],
            _id: json.floor_indexs[json.floor_names.indexOf(floorName)],
            Name: floorName,
            PubPoint: [],
            FuncAreas: []
        };        

        //打开单个楼层点和面的geojson文件
        var pointGeoJSON,polygonGeojson;
        $.ajaxSettings.async = false;
        $.getJSON(directory + floorName+"_Point.geojson", function (json) {
            pointGeoJSON = json;
        });
        $.getJSON(directory + floorName+"_Polygon.geojson", function (json) {
            polygonGeoJSON = json;
        });

        //遍历每个POI
        pointGeoJSON.features.forEach(feature => { 
            //公共设施点 门 厕所 电梯 Wifi发射点等 用点表示
            var pubpoint = {};
            pubpoint.Outline = [[[feature.geometry.coordinates[0] - centerX, feature.geometry.coordinates[1] - centerY]]];
            pubpoint.Name = feature.properties.name;
            pubpoint.Category = feature.properties.type;//以下三个找一个最适合作为category的
            // pubpoint.type = feature.properties.type;
            // pubpoint.rank = feature.properties.rank;
            // pubpoint.sid = feature.properties.sid;
            pubpoint.icon = feature.properties.icon;//百度地图用的iconname
            newFloor.PubPoint.push(pubpoint);
        })

        //遍历每个多边形要素
        polygonGeoJSON.features.forEach(feature => {
            //添加楼层的轮廓
            if (FLOOR_CODE.indexOf(feature.properties.type) != -1) {//注意：这个情况要比下面这个先出现，数据中也确实是这样
                var polygons = feature.geometry.coordinates;
                polygons.forEach(polygon => {//要考虑多部件/带洞多边形的情况
                    var floorOutline = [];
                    polygon.forEach(point => {
                        floorOutline.push(point[0] - centerX);
                        floorOutline.push(point[1] - centerY);
                    });
                    newFloor.Outline.push([floorOutline]);
                });
            }
            else if (HOLLOW_CODE.indexOf(feature.properties.type) != -1 ){
                var polygons = feature.geometry.coordinates;
                polygons.forEach(polygon => {//这里的多部件多边形的情况会很复杂，带洞多边形多层次嵌套
                    var floorOutline = [];
                    polygon.forEach(point => {//注意，这里是倒过来的，关键 TODO要确保features列表里轮廓要在中空前面
                        floorOutline.unshift(point[1] - centerY);
                        floorOutline.unshift(point[0] - centerX);                        
                    });
                    newFloor.Outline[0].push(floorOutline);//只考虑了简单情况，只有最前面的那部分楼层轮廓带中空
                });
            }
            //添加背景房间
            else{
                //房间对象
                var newFuncArea = {//百度的数据背景多边形主要是区分颜色，属性较少，POI点信息多                    
                    id:feature.properties.id||0,
                    Category:feature.properties.type,
                    Outline: [],
                    level: feature.properties.level==1234?"1234":"0"//对于没做综合的数据，默认是在1234四个级别都显示同样的
                };
                //房间轮廓 注意带洞的多边形
                var polygons = feature.geometry.coordinates;
                polygons.forEach(polygon => {
                    var areaOutline = [];
                    polygon.forEach(point => {
                        areaOutline.push(point[0] - centerX);
                        areaOutline.push(point[1] - centerY);
                    });
                    newFuncArea.Outline.push([areaOutline]);
                });
                newFloor.FuncAreas.push(newFuncArea);
            }            
        });
        data.Floors.push(newFloor);
    });

    //建筑物的边界
    var buildingJSON;
    $.getJSON(directory + "building_outline.geojson", function (json) {
        buildingJSON = json;
    });
    buildingJSON.features.forEach(feature => { 
        var polygons = feature.geometry.coordinates;
        polygons.forEach(polygon => {//要考虑多部件多边形、带洞多边形的情况
            var buildingOutline = [];
            polygon.forEach(point => {
                buildingOutline.push(point[0] - centerX);
                buildingOutline.push(point[1] - centerY);
            });
            data.building.Outline = [[buildingOutline]];
        });
    })

    //其他关于建筑物的信息
    data.building.storeyHeight = json.storeyHeight;
    data.building.roomHeight = json.roomHeight;
    data.building.name = json.name;
    console.log(standardJson);
    return standardJson;    
}

//将标准化后的数据（json）解析为mesh 这段函数改动较大
function ParseModel(json, is3d, theme){

    var mall = new Mall();

    function parse() {

        mall.jsonData = json;
        mall.is3d = is3d;
        mall.storeyHeight = json.data.building.storeyHeight||30;

        if(theme == undefined) {
            if (is3d) {
                theme = default3dTheme;
            } else {
                theme = default2dTheme;
            }
        }

        //edit by xy 增加roomHeight,房间拉伸高度,floorHeight含义改为地板的厚度
        var building, shape, floorShape, extrudeSettings, geometry, material, mesh, wire, points;
        var scale = 0.1, floorHeight=2, roomHeight=json.data.building.roomHeight||4, buildingHeight = 0;

        //floor geometry
        for(var i=0; i<json.data.Floors.length; i++){
            var floor = json.data.Floors[i];
            floor.rect = IDM.GeomUtil.getBoundingRect(floor.Outline[0][0]);

            if(is3d) { // for 3d model
                var floorObj = new THREE.Object3D();//存储该楼层几乎所有三维对象
                buildingHeight += (floorHeight+roomHeight);//edit by xy 地板的高度也累加进去
                
                //添加楼层地板 有可能由多个部分组成
                floor.Outline.forEach(part=>{
                    var outline=part[0];//第一项是外围，后面还有的话就是洞
                    points = parsePoints(outline);
                    floorShape = new THREE.Shape(points);                
                    //增加带洞多边形的处理 即中空 可写成单独函数 （没有考虑多部件多边形的情况）
                    if (part.length > 1) {//增加带洞多边形的处理 即中空 可写成单独函数
                        for (var i=1;i<part.length;i++){
                            var holePoints = parsePoints(part[i]);
                            floorShape.holes.push(new THREE.Shape(holePoints));
                        }
                    }

                    floorObj.shape = floorShape;//记住楼层的形状，后面贴图可能还会用到 TODO这还是以前没考虑多部分时
                    extrudeSettings = {depth: floorHeight, bevelEnabled: false};//add by xy 地板加高 不再是扁的 
                    geometry = new THREE.ExtrudeGeometry(floorShape, extrudeSettings);
                    assignUVs(geometry);//后期可能会在地板上贴纹理 wifi信号热力图
                    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(theme.floor));//地板加亮 phong材质 可以考虑地板颜色也按照主题设置
                    mesh.position.set(0, 0, 0);//change by xy from 0 0 -5 to 0 0 0
                    //mesh.receiveShadow = true; 在地板上投影符号的阴影，现在用的sprite做点符号暂时无法投影
                    floorObj.add(mesh);
                })              
                
                floorObj.height = floorHeight+roomHeight;//edit by xy 用于设置放置poi点的高度
                floorObj.floorHeight = floorHeight;
                floorObj.roomHeight = roomHeight;                
                floorObj.points = [];
                floorObj._id = floor._id;
                mall.floors.push(floorObj);
            }else{//for 2d model
                floor.strokeStyle = theme.strokeStyle.color;
                floor.fillColor = theme.floor.color;
                mall.floors.push(floor);
            }

            createPoiSprites(floor, floorObj);                                   

            //funcArea geometry
            for(var j=0; j<floor.FuncAreas.length; j++){

                var funcArea = floor.FuncAreas[j];
                funcArea.rect = IDM.GeomUtil.getBoundingRect(funcArea.Outline[0][0]);

                //画多边形
                if(is3d) {
                    if (funcArea.Category==HOLLOW_CODE) continue;

                    points = parsePoints(funcArea.Outline[0][0]);
                    shape = new THREE.Shape(points);
                    //add by xy注意带洞多边形 墙和一些综合过后的房间都是
                    if (funcArea.Outline.length > 1) {
                        var count = 0;
                        funcArea.Outline.forEach(polygon => { 
                            count++;
                            if (count == 1) return;                            
                            var holePoints = parsePoints(polygon[0]);
                            shape.holes.push(new THREE.Shape(holePoints));
                        })
                    }

                    //var center = funcArea.Center; 这部分暂时去掉，用百度的数据用不到
                    //add by xy 加了个Category:funcArea.Category position改为了相对floorobj的位置，不考虑scale和旋转
                    //floorObj.points.push({ name: funcArea.Name, type: funcArea.Type, Category:funcArea.Category, position: new THREE.Vector3(center[0], center[1], floorHeight)});

                    //solid model 添加房间或墙
                    var extrudeHeight;
                    //如果在主题里为各个类别设置了高度就用这个高度 不同的类型可能对应全高空间，半高空间，半封闭空间等
                    if (theme.room("", funcArea.Category).height) {
                        extrudeHeight = theme.room("", funcArea.Category).height;
                    }
                    //如果没有为各个类别分别设置高度就用基础高度roomheight，再根据尺度调整
                    else { 
                        //level可能是0 1 2 3 4 也可能是01234 1234 表示这个funcarea在多个level都呈现
                        extrudeHeight = funcArea.level ? roomHeight - (funcArea.level.charAt(0)-1)*roomHeight/4:roomHeight;//综合后的要趴下去
                    }
                        
                    extrudeSettings = { depth: extrudeHeight, bevelEnabled: false };
                    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    material = new THREE.MeshBasicMaterial(theme.room(parseInt(funcArea.Type), funcArea.Category));
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.type = "solidroom";
                    mesh.fid = funcArea.id||funcArea._id; //本身three.js就会给每个mesh分配一个id 自己再定义一个fid更靠谱 但有些地方用的id字段查询 算了不改了 最早的indoor3d的数据格式里有_id这个字段
                    //mesh.fid=funcArea.id||funcArea._id;
                    mesh.position.z = floorHeight;
                    //mesh.castShadow = true;
                    floorObj.add(mesh);
                    
                    //top wireframe
                    geometry = new THREE.BufferGeometry().setFromPoints(points);
                    var roomColor = theme.room(parseInt(funcArea.Type), funcArea.Category).color;
                    var darkenColor = tinycolor(roomColor).darken(10).toString();//线的颜色稍微加深一些                    
                    wire = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: darkenColor }));
                    wire.position.set(0, 0, floorObj.floorHeight+extrudeHeight);
                    if (funcArea.level != "0") {//墙体不需要加分界线，已经分的很清楚了，房间才需要                         
                        floorObj.add(wire); //comment by xy 加到mapbox之后有锯齿
                    }                    

                    if (funcArea.level) { //add by xy 不同zoom显示不同层次的数据，根据level字段控制
                        mesh.level = funcArea.level;
                        wire.level = funcArea.level;

                        if (mesh.level.indexOf("1") == -1) {//默认先只显示级别为1的 
                            mesh.visible = false;
                            wire.visible = false;
                        } else {//如果是级别为1的,创建一个房间内的地板，在显示墙体的时候显示 
                            extrudeSettings = {depth: 0.1, bevelEnabled: false};
                            geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                            var lightenColor = tinycolor(roomColor).lighten(10).toString();//底板颜色变浅使得墙容易识别
                            material = new THREE.MeshLambertMaterial({color:lightenColor});
                            mesh = new THREE.Mesh(geometry, material);
                            mesh.level = "0";//0表示显示墙体的级别 这个地板跟墙体同时显示
                            mesh.visible = false;
                            mesh.type = "roomfloor";
                            mesh.fid=funcArea.id||funcArea._id; //跟solidroom的mesh公用fid 按id高亮的时候可能是高亮它
                            mesh.position.set(0, 0, floorHeight);//贴着地板
                            floorObj.add(mesh);
                        }
                    }
                    
                }else{
                    funcArea.fillColor = theme.room(parseInt(funcArea.Type), funcArea.Category).color;
                    funcArea.strokeColor = theme.strokeStyle.color;
                }
            }

            if(is3d) {
                //pubPoint geometry
                for (var j = 0; j < floor.PubPoint.length; j++) {
                    var pubPoint = floor.PubPoint[j];
                    var point = parsePoints(pubPoint.Outline[0][0])[0];
                    floorObj.points.push({name: pubPoint.Name, type: pubPoint.Type, Category:pubPoint.Category, position: new THREE.Vector3(point.x * scale, floorHeight * scale, -point.y * scale)});
                }
            }
        }

        //轮廓
        if(is3d) {
            mall.root = new THREE.Object3D(); //if is 3d, create a root object3D

            //building geometry
            building = json.data.building;
            points = parsePoints(building.Outline[0][0]);
            mall.FrontAngle = 0;//edit by xy 暂时不要这项，全都正北方向

            if (points.length > 0) {
                shape = new THREE.Shape(points);
                extrudeSettings = {depth: buildingHeight, bevelEnabled: false};//edit by xy amount-->depth new version of three.js
                geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(theme.building));

                //添加框线使得建筑更有整体感 对于轮廓复杂的建筑效果很差
                var geo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry( geometry )
                var mat = new THREE.LineBasicMaterial( { color: 0xcccccc } );
                var wireframe = new THREE.LineSegments(geo, mat);                

                mall.building = mesh;
                //mall.building.add(wireframe);
            }

            //scale the mall
            mall.root.scale.set(scale, scale, scale);
            mall.root.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        }

        //console.log(mall);
        return mall;
    };

    //parse the points to THREE.Vector2 (remove duplicated points)
    function parsePoints(pointArray){
        var shapePoints = [];
        for(var i=0; i < pointArray.length; i+=2){
            var point = new THREE.Vector2(pointArray[i], pointArray[i+1]);
            if(i>0) {
                var lastpoint = shapePoints[shapePoints.length - 1];
                if (point.x != lastpoint.x || point.y != lastpoint.y) { //there are some duplicate points in the original data
                    shapePoints.push(point);
                }
            }else{
                shapePoints.push(point);
            }
        }
        return shapePoints;
    }

    //为每个楼层的感兴趣点（funcarea的center）和公共设施创建poi符号
    function createPoiSprites(floor,floorObj) {
        var poiSprites = new THREE.Object3D();//每层楼的poi符号合集

        //房间的poi点，百度的没有房间poi点
        var funcAreaJson = floor.FuncAreas;
        for (var i = 0; i < funcAreaJson.length; i++) {
            var funcArea = funcAreaJson[i];
            if (funcArea.level&&funcArea.level.indexOf("1")==-1) continue;//注意,只加level为1的,否则会重复添加
            if (!funcArea.Category||!funcArea.Secondary) continue;//没有分类信息的不用POI点表示，比如非开放区域
            //实时服务信息，数据先存着
            funcArea["average price"] = Math.seededRandom(0.2,0.95);
            funcArea["waiting time"] = Math.seededRandom(0.2,0.95);
            //权重 优先级
            funcArea.priority=funcArea.Area;//一开始先设成面积，后面用户选择爱好之后再是popularity+area
            //根据poi点所属的类别和实时服务数据获取canvas
            var symbol=new Symbol(funcArea.Category,funcArea.Secondary,funcArea["average price"]);
            var canvas = symbol.getCanvas();
            var texture = new THREE.Texture(canvas);
            // 这个一加反而更多颗粒感
            // texture.magFilter = THREE.NearestFilter;
            // texture.minFilter = THREE.NearestFilter;
            // texture.anisotropy = 16;//手动从renderer获得的最大值 加了区别不大

            texture.needsUpdate = true;

            var material = new THREE.SpriteMaterial({map:texture,sizeAttenuation:false,transparent:true,alphaTest:0.1});//sizeAttenuation:false 大小不随距离相机远近渐变
            var sprite = new THREE.Sprite(material);
            
            //sprite的下沿刚好贴着房间的顶
            sprite.center.set(0.5, 0);
            sprite.position.set(funcAreaJson[i].Center[0], funcAreaJson[i].Center[1], floorObj.height);
            //如果不缩放，sizeAttenuation为false的情况下，sprite的大小是距离相机为1时的大小，很大，sprite本身是长宽为1,1的planegeometry
            //sprite.scale.set(20, 20, 20);
            //没选中的先不显示 selected用于手动选择是否显示 visible用于碰撞检测后是否显示
            sprite.selected = false;
            //sprite.visible = false;
            sprite.properties = funcArea;//里面的一些属性有用，例如权重，用于poi符号综合时的排序
            sprite.symbol=symbol;
            poiSprites.add(sprite);
        }
        
        //公共设施点的符号
        var pubpoints = floor.PubPoint;
        for (var i = 0; i < pubpoints.length; i++) {
            var pubpoint = pubpoints[i];
            if (pubpoint.icon) {
                var symbol = new Symbol("icons", pubpoint.icon.toString());
            }
            else {
                if (!pubpoint.Category) continue;
                var symbol = new Symbol("public", pubpoint.Category.toString());
            }
            
            var canvas = symbol.getCanvas();
            //document.body.appendChild(canvas); //测试符号是否生成成功
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;//图片不一定一下加载进来，有可能显示不了，后面还在再needsUpdate
            var material = new THREE.SpriteMaterial({
                map: texture,
                sizeAttenuation: false,
                transparent: true,
                side: THREE.DoubleSide,
                alphaTest:0.1
            });

            var sprite = new THREE.Sprite(material);
            sprite.center.set(0.5, 0);
            sprite.position.set(pubpoint.Outline[0][0][0], pubpoint.Outline[0][0][1], floorObj.height);
            sprite.scale.set(0.02, 0.02, 0.02);
            sprite.selected = false;
            sprite.visible = false;
            sprite.properties = pubpoint;
            // sprite.properties.defaultPriority = 0;//默认的pubpoint的权重
            sprite.properties.priority = i;
            // sprite.properties.priority = sprite.properties.defaultPriority;
            // console.log(sprite);
            poiSprites.add(sprite);
        }
        //所有poi符号加到楼层里
        floorObj.add(poiSprites);
        //console.log(poiSprites);
        floorObj.POIs = poiSprites;//方便读取控制poi大小
    }    

    return parse();
}
//-----------------------------the IndoorMap class ------------------------------------

var IndoorMap = function (params) {
    var _this = this;
    var _mapDiv, _uiRoot, _uiSelected;
    var _fullScreen = false;
    this.is3d = true;
    var _indoorMap;

    //initialization
    function init(params) {

        //parse the parameters
        if(params != undefined){
            //if the map container is specified
            if (params.hasOwnProperty("mapDiv")) {
                _mapDiv = document.getElementById(params.mapDiv);
                _fullScreen = false;
            }
            //if the map size is specified
            else if(params.hasOwnProperty("size") && params.size.length == 2){
                createMapDiv(params.size);
                _fullScreen = false;
            }
            //else create a full screen map
            else{
                createMapDiv([window.innerWidth,window.innerHeight]);
                _fullScreen = true;
            }
            // 2d or 3d view
            if(params.hasOwnProperty("dim")){
                _this.is3d = params.dim == "2d" ? false : true;
            }else{
                _this.is3d = true;
            }
        }else{
            createMapDiv([window.innerWidth,window.innerHeight]);
            _fullScreen = true;
        }

        // create 2d or 3d map by webgl detection
        if (_this.is3d && Detector.webgl) {
            _indoorMap = new IndoorMap3d(_mapDiv);
        } else {
            _indoorMap = new IndoorMap2d(_mapDiv);
            _this.is3d = false;
        }

        //var marker = document.createElement("image");
        //marker.style.position = "absolute";
        //marker.style.src = System.imgPath+"/marker.png";
        //marker.visibility = false;
        //marker.style.width = "39px";
        //marker.style.height = "54px";
        //document.body.appendChild(marker);
        ////_indoorMap.setSelectionMarker(marker);

    }

    function createMapDiv(size){
        _mapDiv = document.createElement("div");
        _mapDiv.style.width = size[0] + "px";
        _mapDiv.style.height = size[1] + "px";
        _mapDiv.style.top = "0px";
        _mapDiv.style.left = "0px";
        _mapDiv.style.position = "absolute";
        _mapDiv.id = "indoor3d";
        document.body.appendChild(_mapDiv);
        document.body.style.margin = "0";
    }


    function updateUI() {
        if(_uiRoot == null){
            return;
        }
        var ulChildren = _uiRoot.children;
        if(ulChildren.length == 0){
            return;
        }
        if(_uiSelected != null){
            _uiSelected.className = "";
        }
        var curid = _this.mall.getCurFloorId();
        if( curid == 0){
            _uiSelected = _uiRoot.children[0];
        }else{
            for(var i = 0; i < ulChildren.length; i++){
                if(ulChildren[i].innerText == _this.mall.getCurFloorId().toString() ){
                    _uiSelected = ulChildren[i];
                }
            }
        }
        if(_uiSelected != null){
            _uiSelected.className = "selected";
        }
    }

    init(params);
    return _indoorMap;
}

//get the UI 左边的楼层按钮
IndoorMap.getUI = function(indoorMap){
    var _indoorMap = indoorMap;
    if(_indoorMap == undefined || _indoorMap.mall == null){
        console.error("the data has not been loaded yet. please call this function in callback")
        return null;
    }
    //create the ul list
    _uiRoot = document.createElement('ul');
    _uiRoot.className = 'floorsUI';

    if(_indoorMap.is3d) {
        var li = document.createElement('li');
        var text = document.createTextNode('All');

        li.appendChild(text);
        _uiRoot.appendChild(li);
        li.onclick = function () {
            _indoorMap.showAllFloors();
        }
    }

    var floors = _indoorMap.mall.jsonData.data.Floors;
    for(var i = 0; i < floors.length; i++){
        (function(arg){
            li = document.createElement('li');
            text = document.createTextNode(floors[arg].Name);
            li.appendChild(text);
            li.onclick = function () {
                _indoorMap.showFloor(floors[arg]._id);
            }
            _uiRoot.appendChild(li);
        })(i);
    }
    return _uiRoot;
}

//add by xy 两种控制楼层的模式 显示全部楼层时，点楼层按钮就是抽出对应楼层；显示单独楼层时，点楼层按钮是切换楼层；两种模式可以切换
IndoorMap.getUL = function(indoorMap,outdoorMap){//outdoorMap获取bearing决定抽出来的角度
    var _indoorMap = indoorMap;
    if(_indoorMap == undefined || _indoorMap.mall == null){
        console.error("the data has not been loaded yet. please call this function in callback")
        return null;
    }
    //create the ul list
    _uiRoot = document.createElement('ul');
    _uiRoot.className = 'floorsUI';
    _uiRoot.mode = _indoorMap.mall.getCurFloorId()===0?"All":"One";//根据当前显示状态选择模式
    _uiRoot.id = "_ul";

    //创建最上面的li，选择地图显示模式，多楼层显示、单楼层显示的切换
    if (_indoorMap.is3d) {
        var li = document.createElement('li');
        //根据当前模式确定按钮图标是单个图层还是多个图层
        li.style.backgroundImage = _uiRoot.mode==="All"?"url('img/all_floors_min.png')":"url('img/one_floor_min.png')";
        li.style.backgroundRepeat = "no-repeat";
        li.style.backgroundPosition = "center";
        _uiRoot.appendChild(li);
        //切换模式
        li.onclick = function () {
            if (_uiRoot.mode === 'All') {
                _indoorMap.showFloor(1);
                _uiRoot.mode = 'One';
                this.style.backgroundImage = "url('img/one_floor_min.png')";
            } else { 
                _indoorMap.showAllFloors();
                _uiRoot.mode = 'All';
                this.style.backgroundImage = "url('img/all_floors_min.png')";
            }
        }
    }

    //遍历每个楼层，给每个楼层一个按钮
    var floors = _indoorMap.mall.jsonData.data.Floors;
    var rect = IDM.GeomUtil.getBoundingRect(_indoorMap.mall.jsonData.data.building.Outline[0][0]);
    const offset = 2 / 3 * (rect.br[1] - rect.tl[1]);//抽出来抽多远
    const interval = 30;//_indoorMap.mall.floors[1].position.z;//原本的楼层间隔
    for (var i = floors.length - 1; i >= 0;i--){//高楼层的按钮在上面
        (function(arg){
            li = document.createElement('li');
            text = document.createTextNode(floors[arg].Name);
            li.id = i;
            li.appendChild(text);
            li.atNormalPosition = true;//存储楼层是否在原来的位置上，即是否被点击过奇数次
            li.oncontextmenu = function(e){
                e.preventDefault();
            };
            li.onmouseup = function (e) {
                if (_uiRoot.mode === 'One') {//切换楼层

                    _indoorMap.showFloor(floors[arg]._id);
                    //updateUI();
                }
                //像抽屉抽出楼层的效果
                else {
                    if (e.button==0){
                        //根据地图的观察角度确定x，y分别抽出多少 这里用最小外接矩形简化计算 更准确的计算方法涉及对形状的认知
                        var m = rect.br[1] - rect.tl[1];
                        var n = rect.br[0] - rect.tl[0];
                        var angle = outdoorMap?outdoorMap.getBearing() + 90:90;
                        if (angle > 360) angle -= 360;
                        var theta = angle / 180 * Math.PI;
                        // var d = n * Math.abs(Math.cos(theta)) + m * Math.abs(Math.sin(theta));
                        d = (m + n)/4;
                        var dx = d * Math.cos(theta);
                        var dy = d * Math.sin(theta);
                        //if (arg === 0) return;//arg=0抽出来可能会撞到别的建筑
                        //this.className = this.atNormalPosition ? "selected" : "";
                        var object3d=indoorMap.mall.getFloor(floors[arg]._id);
                        const x = object3d.position.x;
                        const y = object3d.position.y;
                        var coords={x:x,y:y};
                        const end={x:this.atNormalPosition?x+dx:x-dx,y:this.atNormalPosition?y-dy:y+dy};//抽出来or推回去
                        var tween=new TWEEN.Tween(coords) 
                            .to(end,1000)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onUpdate(function(){//注意：有个requestAnimationFrame中在update Tween
                                object3d.position.x=coords.x;
                                object3d.position.y=coords.y;
                            })
                            .start();
                        //simplifyOtherFloors(arg,this.atNormalPosition);
                        this.atNormalPosition = !this.atNormalPosition;
                    }
                    else if (e.button==2){
                        const BASEDISTANCE = indoorMap.mall.storeyHeight/2;//基准移动距离 即被点击楼层上面一个楼层要向上移动的距离或二楼要往下移动的距离
                        var coords = {};//记录初始位置,tween实时更新这个位置
                        var end = {};//记录结束位置
                        for (var j = 0; j < floors.length; j++) {
                            var floor = indoorMap.mall.getFloor(floors[j]._id);
                            coords[floors[j]._id] = floor.position.z;//当前位置
                            if (j > arg) {//上面的楼层向上移动，或返回
                                floor.distance = (floors.length - 1 - j) * BASEDISTANCE;
                                end[floors[j]._id] = this.atNormalPosition ? floor.position.z + floor.distance : floor.position.z - floor.distance;//加大间隔or减小间隔
                            } else {//当前楼层或下面的楼层向下移动，或返回 
                                floor.distance = j * BASEDISTANCE;
                                end[floors[j]._id] = this.atNormalPosition ? floor.position.z - floor.distance : floor.position.z + floor.distance;//加大间隔or减小间隔
                            }                                
                        }
                        var tween=new TWEEN.Tween(coords) 
                            .to(end,1000)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onUpdate(function(){//注意：有个requestAnimationFrame中在update Tween
                                for (var k = 0; k < floors.length; k++) { 
                                    var floor = indoorMap.mall.getFloor(floors[k]._id);
                                    floor.position.z=coords[floors[k]._id];
                                }
                            })
                            .start(); 
                        //simplifyOtherFloors(arg,this.atNormalPosition);
                        this.atNormalPosition = !this.atNormalPosition;
                    }                    
                }
                
                //加大间隔，每个楼层都移动，给足被点击楼层空间
                // else {
                //     const BASEDISTANCE = indoorMap.mall.storeyHeight/2;//基准移动距离 即被点击楼层上面一个楼层要向上移动的距离或二楼要往下移动的距离
                //     var coords = {};//记录初始位置,tween实时更新这个位置
                //     var end = {};//记录结束位置
                //     for (var j = 0; j < floors.length; j++) {
                //         var floor = indoorMap.mall.getFloor(floors[j]._id);
                //         coords[floors[j]._id] = floor.position.z;//当前位置
                //         if (j > arg) {//上面的楼层向上移动，或返回
                //             floor.distance = (floors.length - 1 - j) * BASEDISTANCE;
                //             end[floors[j]._id] = this.atNormalPosition ? floor.position.z + floor.distance : floor.position.z - floor.distance;//加大间隔or减小间隔
                //         } else {//当前楼层或下面的楼层向下移动，或返回 
                //             floor.distance = j * BASEDISTANCE;
                //             end[floors[j]._id] = this.atNormalPosition ? floor.position.z - floor.distance : floor.position.z + floor.distance;//加大间隔or减小间隔
                //         }                                
                //     }
                //     var tween=new TWEEN.Tween(coords) 
                //         .to(end,1000)
                //         .easing(TWEEN.Easing.Quadratic.Out)
                //         .onUpdate(function(){//注意：有个requestAnimationFrame中在update Tween
                //             for (var k = 0; k < floors.length; k++) { 
                //                 var floor = indoorMap.mall.getFloor(floors[k]._id);
                //                 floor.position.z=coords[floors[k]._id];
                //             }
                //         })
                //         .start(); 
                //     simplifyOtherFloors(arg,this.atNormalPosition);
                //     this.atNormalPosition = !this.atNormalPosition;
                // }                
            }

            _uiRoot.appendChild(li);
        })(i);
    }

    //id：当前楼层的id，要淡化其他楼层 atNormalPosition:用于决定是淡化还是变回来
    function simplifyOtherFloors(id, atNormalPosition) { 
        var floors = _indoorMap.mall.floors;
        for (var i = 0; i < floors.length; i++) { 
            if (id == i) continue;
            var floor = floors[i];
            floor.children.forEach(obj => {
                if (obj.type == "solidroom" || obj.type == "Line") {
                    obj.material.opacity = atNormalPosition ? 0.4 : 0.9;//todo 0.9不能写死
                }
            });
            floor.POIs.children.forEach(sprite => { 
                sprite.material.opacity=atNormalPosition ? 0.4 : 1;
            })
        }
        //建筑外墙有点影响抽屉的效果
        //_indoorMap.mall.building.visible=atNormalPosition ? false : true;
    }

    return _uiRoot;
}

IndoorMap.poicontrol = function (indoorMap,outdoorMap){
    var div = document.createElement('div');
    div.id = "_div"
    div.className = 'indoormenu';

    var btn = document.createElement("button");
    btn.id = "poi";
    btn.innerHTML = "POI信息显示";
    btn.style.width = "144px";
    btn.clickCount = 0;

    div.appendChild(btn);
    div.appendChild(document.createElement("br"));

    var poiDiv = document.createElement('div');
    poiDiv.id = "poiDiv";
    poiDiv.style.display = "none";

    var typeBtn = document.createElement("button");
    typeBtn.id = "typeBtn";
    typeBtn.innerHTML = "类别查询";
    typeBtn.style.width = "72px";
    typeBtn.clickCount = 0;
    var inputBtn = document.createElement("button");
    inputBtn.id = "inputBtn";
    inputBtn.innerHTML = "输入查询";
    inputBtn.style.width = "72px";
    inputBtn.clickCount = 0;

    poiDiv.appendChild(typeBtn);
    poiDiv.appendChild(inputBtn);
    div.appendChild(poiDiv);

    var typeDiv = document.createElement('div');
    typeDiv.id = "typeDiv";
    typeDiv.style.display = "none";
    poiDiv.appendChild(typeDiv);
    var inputDiv = document.createElement('div');
    inputDiv.id = "inputDiv";
    inputDiv.style.display = "none";
    poiDiv.appendChild(inputDiv);

    var tpye = ["出入口", "楼梯", "厕所", "餐饮", "购物", "娱乐"];
    var code = [10,20,30,40,50,60]
    var tpyeEn = ["entry", "stair", "toilet", "food", "shopping", "entertainment"];
    tpye.forEach((category, i) => {
        var btn = document.createElement("button");
        btn.style.backgroundImage = `url('img/${tpyeEn[i]}.png')`;//按钮的图标
        btn.style.backgroundSize = "100% 100%";
        btn.style.width = "48px";
        btn.style.height = "48px";
        btn.clickCount = 0;
        btn.onclick = function () {
            this.clickCount++;
            if (this.clickCount % 2 == 1) {
                indoorMap.mytogglePoiSprites(true, code[i]);
            } else {
                indoorMap.togglePoiSprites(false, code[i]);
            }
        };
        typeDiv.appendChild(btn);
        if (i % 3 == 2) typeDiv.appendChild(document.createElement("br"));
    });

    var input = document.createElement('input');
    input.style.height = "40px";
    input.style.border = "4px";
    input.style.width = "100px";
    var search = document.createElement('button');
    search.style.height = "40px";
    search.style.width = "28";
    search.style.border = "4px";
    search.innerHTML = "搜索";
    inputDiv.appendChild(input);
    inputDiv.appendChild(search);

    search.onclick = function (){
        var res = indoorMap.searchPoi(input.value);
        console.log(res);
        var rect = IDM.GeomUtil.getBoundingRect(indoorMap.mall.jsonData.data.building.Outline[0][0]);
        for(var id of res){
            var temp = document.getElementById(id);
            //console.log(temp);
            //根据地图的观察角度确定x，y分别抽出多少 这里用最小外接矩形简化计算 更准确的计算方法涉及对形状的认知
            var m = rect.br[1] - rect.tl[1];
            var n = rect.br[0] - rect.tl[0];
            var angle = outdoorMap?outdoorMap.getBearing() + 90:90;
            if (angle > 360) angle -= 360;
            var theta = angle / 180 * Math.PI;
            // var d = n * Math.abs(Math.cos(theta)) + m * Math.abs(Math.sin(theta));
            d = (m + n)/4;
            var dx = d * Math.cos(theta);
            var dy = d * Math.sin(theta);
            //if (arg === 0) return;//arg=0抽出来可能会撞到别的建筑
            //this.className = this.atNormalPosition ? "selected" : "";
            var object3d=indoorMap.mall.getFloor(id);
            const x = object3d.position.x;
            const y = object3d.position.y;
            var coords={x:x,y:y};
            const end={x:temp.atNormalPosition?x+dx:x-dx,y:temp.atNormalPosition?y-dy:y+dy};//抽出来or推回去
            var tween=new TWEEN.Tween(coords)
                .to(end,1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(function(){//注意：有个requestAnimationFrame中在update Tween
                    object3d.position.x=coords.x;
                    object3d.position.y=coords.y;
                })
                .start();
            temp.atNormalPosition = !(temp.atNormalPosition);
            //console.log(temp.atNormalPosition);
        }
    }

    typeBtn.onclick = function () {
        this.clickCount++;
        if(inputBtn.clickCount){
            inputBtn.clickCount++;
        }
        if (this.clickCount % 2 == 1) {
            typeDiv.style.display = "block";
            inputDiv.style.display = "none";
        } else {
            typeDiv.style.display = "none";
            inputDiv.style.display = "block";
        }
    };

    inputBtn.onclick = function () {
        this.clickCount++;
        if(typeBtn.clickCount){
            typeBtn.clickCount++;
        }
        if (this.clickCount % 2 == 1) {
            inputDiv.style.display = "block";
            typeDiv.style.display = "none";
        } else {
            inputDiv.style.display = "none";
            typeDiv.style.display = "block";
        }
    };

    btn.onclick = function () {
        this.clickCount++;
        if (this.clickCount % 2 == 1) {
            indoorMap.my(true);
            btn.innerHTML = "关闭POI信息显示";
            poiDiv.style.display = "block";
        } else {
            indoorMap.my(false);
            btn.innerHTML = "POI信息显示";
            poiDiv.style.display = "none";
            inputDiv.style.display = "none";
            typeDiv.style.display = "none";
        }
    };

    return div;
}
//自己改的
IndoorMap.test = function (indoorMap){
    indoorMap.my(true);
}

//get the menu
IndoorMap.getMenu = function(indoorMap){
    //创建菜单
    var div = document.createElement('div');
    div.className = 'indoormenu';
    
    //公共设施的按钮
    var facilities = ["升降梯", "手扶梯", "出入口", "楼梯", "厕所", "wifi"];// 修改论文把最后一个按钮换成了休息区符号
    var facilitiesEn = ["lift", "escalator", "entry", "stair", "toilet", "wifi"];
    facilities.forEach((category, i) => {
        var btn = document.createElement("button");
        btn.style.backgroundImage = `url('img/${facilitiesEn[i]}.png')`;//按钮的图标
        btn.style.backgroundSize = "100% 100%";
        btn.clickCount = 0;
        btn.onclick = function () {
            this.clickCount++;
            if (this.clickCount % 2 == 1) {
                indoorMap.togglePoiSprites(true,category);
            } else { 
                indoorMap.togglePoiSprites(false,category);
            }
            //如果点的wifi的按钮还要加上热力图的显示隐藏
            if (category == "wifi") {
                indoorMap.toggleHeatmap(1, "./img/wifi1.png");
                // if (this.clickCount % 2 == 1) {
                //     indoorMap.addTexture(1, "./img/wifi1.png");
                // }else{
                //     indoorMap.removeTexture(1, "./img/wifi1.png");
                // }                
            }            
        };
        div.appendChild(btn);
        if (i % 2 == 1) div.appendChild(document.createElement("br"));
    });

    //兴趣点的按钮
    var poiCategories = ["餐饮", "购物", "娱乐", "服务"];
    var poiCategoriesEn = ["food", "shopping", "entertainment", "service"];
    poiCategories.forEach((category, i) => {
        var btn = document.createElement("button");
        btn.style.backgroundImage = `url('img/${poiCategoriesEn[i]}.png')`;
        btn.style.backgroundSize = "100% 100%";
        btn.clickCount = 0;
        btn.onclick = function () {
            this.clickCount++;
            if (this.clickCount % 2 == 1) {
                indoorMap.togglePoiSprites(true,category);
            } else { 
                indoorMap.togglePoiSprites(false,category);
            }            
        };
        div.appendChild(btn);
        if (i % 2 == 1) div.appendChild(document.createElement("br"));
    });   
    
    //切换显示的实时服务信息
    var infoItems = ["人均消费","用户评分","无"];//"等候时间" "营业时间" "最大折扣"
    var infoItemsEn = ["average price", "user rating", "none"];
    infoItems.forEach((item, i) => {
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "poiinfo";
        var id = item;
        input.id = id;
        input.value = item;
        input.onclick = function () { 
            indoorMap.showInformation(infoItemsEn[i]);
        }
        div.appendChild(input);
        var label=document.createElement("label");
        label.htmlFor=id;
        label.innerText=item;
        div.appendChild(label);
        div.appendChild(document.createElement("br"));
    });
    
    //做成下拉框可能会更美观
    // var select = document.createElement("select");
    // infoItemsEn.forEach((item, i) => {
    //     select.options.add(new Option(item,item));
    // });
    // select.onselect = function () { 
    //     var index = this.selectedIndex;
    //     var val = this.options[index].text;
    //     indoorMap.showInformation(val);
    // }
    // div.appendChild(select);

    //菜单栏的显示和隐藏
    var sideBtn=document.createElement("button");
    sideBtn.innerText="▶";
    sideBtn.style.position="absolute";
    sideBtn.style.left="-23px";
    sideBtn.style.top="10px";
    sideBtn.style.width="23px";
    sideBtn.style.height="48px";
    sideBtn.style.backgroundColor="rgba(255,255,255,0.9)";
    sideBtn.style.color="#D4D4D4";
    sideBtn.onclick=function(){
        if (this.innerText=="▶"){
            this.innerText="◀";
            div.style.right="-80px";
        }
        else{
            this.innerText="▶";
            div.style.right="0px";
        }
    };
    div.appendChild(sideBtn);

    return div;
};

//用户设置界面 实现用户自适应
IndoorMap.getSetting=function(indoorMap){
    //创建菜单
    var div = document.createElement('div');
    div.className = 'indoorsetting';

    //主的设置按钮，点一下就会弹出所有设置
    var btn = document.createElement("button");
    btn.id = "opensetting";
    btn.style.backgroundImage = `url('img/food.png')`;
    btn.style.backgroundSize = "100% 100%";
    div.appendChild(btn);

    //具体的设置在这个div里面
    var subdiv = document.createElement('div');
    subdiv.style.display="none";
    subdiv.id = "settingpanel";
    div.appendChild(subdiv);

    //控制具体设置界面的显示隐藏
    btn.onclick=function(){
        if (subdiv.style.display=="none"){
            subdiv.style.display="block";
        }
        else{
            subdiv.style.display="none";
        }
    }
    
    //获取所有小类别(这种方式顺序混乱，应该给每个建筑配置一个完整的poi分类体系)
    var types=[];
    indoorMap.mall.floors.forEach(floor=>{
        floor.POIs.children.forEach(poi => {
            if (poi.properties.Secondary) {//有二级类，是商铺
                var secondary = poi.properties.Secondary;
                if (types.indexOf(secondary) == -1) {
                    types.push(secondary);
                }
            }
            else {//没二级类，是pubpoints 
                var category = poi.properties.Category;
                if (types.indexOf(category) == -1) {
                    types.push(category);
                }
            }                     
        })
    });

    //每个小类别都是一个复选框 用户选择兴趣
    types.forEach(item=>{
        var input = document.createElement("input");
        input.type = "checkbox";
        input.name = "interestedclasses";
        input.class = "interestedclasses";
        var id = Math.random();
        input.id = id;
        input.value = item;
        input.onclick = function () {
            if (input.checked){
                indoorMap.setPoiPriority(item,1000);
            }
            else {
                indoorMap.setPoiPriority(item,0);
            } 
            
        }
        subdiv.appendChild(input);
        var label=document.createElement("label");
        label.htmlFor=id;
        label.innerText=item;
        input.class = "interestedclasses";
        subdiv.appendChild(label);
    })
    
    //测试用的 TODELETE
    var input=document.createElement("input");
    input.type = "button";
    input.onclick = function () { 
        mapboxIndoors["wanda/main.json"].indoorMap.showLegend();
    }
    subdiv.appendChild(input);

    return div;
}

function assignUVs(geometry) {
    geometry.computeBoundingBox();

    var max = geometry.boundingBox.max,
            min = geometry.boundingBox.min;
    var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
    var faces = geometry.faces;

    geometry.faceVertexUvs[0] = [];

    for (var i = 0; i < faces.length; i++) {

        var v1 = geometry.vertices[faces[i].a],
                v2 = geometry.vertices[faces[i].b],
                v3 = geometry.vertices[faces[i].c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
            new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
            new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
        ]);
    }
    geometry.uvsNeedUpdate = true;
}

//种子随机数 TODO 搬到统一的utility
Math.seed = 5; 
Math.seededRandom = function(max, min) { 
    max = max || 1;
    min = min || 0; 
    Math.seed = (Math.seed * 9301 + 49297) % 233280; 
    var rnd = Math.seed / 233280.0;
    return min + rnd * (max - min); 
};