function RainLayer() {
    var self = this;
    
    this.options= {
        isTile: !0,
        type: "apcp",
        showLabel: !0,
        opacity: 1,
        weight: .8,
        zindex: 0,
        num: 100,
        cellpx: 8,
        a: .8,
        minval: .2,
        Alldata: new Array,
        density: 30,
        labelCell: 50
    };
    this.texturepath = null;
    this._canvas = null;
    this._canvas_label = null;
    this.data = null;
    this._header = null;
    this.texture_data = null;
    this.begin = null;
    this.end = null;
    this.g_texUnit = !1;
    this.g_texUnit1 = !1;
    this.g_texUnit2 = !1;
    this._map = Config.map;

    var _shader={
        VSHADER_SOURCE_WAVE: "attribute vec4 a_Position;\nvoid main(){\n\tvec4 posi = a_Position;\n   gl_Position = posi;\n}\n",
        FSHADER_SOURCE_WAVE: "#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D u_Sampler;\nuniform sampler2D u_Sampler1;\nuniform sampler2D u_Sampler2;\nfloat getvalue(vec4 colo){\n   float _r = colo.r * 255.0 ;\n   float _g = colo.g * 255.0 ;\n   float _b = colo.b * 255.0 ;\n   float _a = colo.a * 255.0 ;\n   float _val = _r + _g / 100.0 ;\n   return _val;\n}\nuniform float u_Scale;\nuniform float u_Startlon;\nuniform float u_Startlat;\nuniform float pic_width;\nuniform float pic_height;\nuniform float lat_width;\nuniform float leftlon;\nuniform float loncell;\nuniform float toplat;\nuniform float latspan;\nuniform float lonspan;\nuniform vec2 widhei;\nuniform float data_resolution;\nvoid main(){\n   float lon = leftlon + lonspan * (gl_FragCoord.x / widhei.x);\n   lon = mod(lon , 360.0);\n   if(lon < 0.0){       lon = lon + 360.0;\n   }   vec2 texturecoor = vec2( 0.0 , gl_FragCoord.y / widhei.y );\n   vec4 color1 = texture2D(u_Sampler1,texturecoor) ;\n   float lat = color1.x;\n   vec2 v_Lonlat = vec2(lon,lat);\n   float col_left =float(floor((lon - u_Startlon)/u_Scale));\n   float col_right = col_left + 1.0;\n   float row_top =float(floor((u_Startlat - lat)/u_Scale));\n   float row_bottom = row_top + 1.0;\n   float left_p = col_left / pic_width;\n   float right_p = col_right / pic_width;\n\tif(lon > (360.0-data_resolution) && lon <= 360.0){\n\t\tright_p = 0.0;\n\t}\n\t\n   float top_p = 1.0 - (row_top / pic_height);\n   float bottom_p =1.0 - (row_bottom / pic_height);\n   vec4 color_lt =  texture2D(u_Sampler, vec2(left_p,top_p));\n   vec4 color_rt =  texture2D(u_Sampler, vec2(right_p,top_p));\n   vec4 color_lb =  texture2D(u_Sampler, vec2(left_p,bottom_p));\n   vec4 color_rb =  texture2D(u_Sampler, vec2(right_p,bottom_p));\n   float val_lt = getvalue(color_lt);\n   float val_rt = getvalue(color_rt);\n   float val_lb = getvalue(color_lb);\n   float val_rb = getvalue(color_rb);\n   vec2 left_top = vec2(u_Startlon + u_Scale * col_left , u_Startlat - u_Scale * row_top);\n   vec2 right_top = vec2(u_Startlon + u_Scale * col_right , u_Startlat - u_Scale * row_top);\n   vec2 left_bottom = vec2(u_Startlon + u_Scale * col_left , u_Startlat - u_Scale * row_bottom);\n   vec2 right_bottom = vec2(u_Startlon + u_Scale * col_right , u_Startlat - u_Scale * row_bottom);\n   float r_1 = (right_bottom.x - v_Lonlat.x)/(right_bottom.x - left_bottom.x) * val_lb + (v_Lonlat.x - left_bottom.x)/(right_bottom.x - left_bottom.x) * val_rb;\n   float r_2 = (right_bottom.x - v_Lonlat.x)/(right_bottom.x - left_bottom.x) * val_lt + (v_Lonlat.x - left_bottom.x)/(right_bottom.x - left_bottom.x) * val_rt;\n   float v_12 = (left_top.y - v_Lonlat.y)/(left_top.y - left_bottom.y) * r_1 + (v_Lonlat.y - left_bottom.y)/(left_top.y - left_bottom.y) * r_2;\n   vec4 necolor = texture2D(u_Sampler2,vec2(0.0 ,1.0- v_12/10.0)) ;\n   necolor.w=1.0 ;\n   if(v_12 == 0.0) {\n       necolor= vec4(0.0,0.0,0.0,0.0);\n   }\n   gl_FragColor = necolor;\n}\n",
        VSHADER_SOURCE_APCP: "attribute vec4 a_Position;\nvoid main(){\n\tvec4 posi = a_Position;\n   gl_Position = posi;\n}\n",
        FSHADER_SOURCE_APCP: "#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D u_Sampler;\nuniform sampler2D u_Sampler1;\nuniform sampler2D u_Sampler2;\nfloat getvalue(vec4 colo){\n   float _r = colo.r * 255.0 ;\n   float _g = colo.g * 255.0 ;\n   float _b = colo.b * 255.0 ;\n   float _a = colo.a * 255.0 ;\n   float _val = _r + _g + _b/100.0;\n   return _val;\n}\nvec4 getColor(float value,float minval) {\n   vec4 backcolor;\n   float _aval= 255.0 * 0.8;\n   if(value == 0.0) {\n       return vec4(0.0,0.0,0.0,0.0);\n   }\n   if(value < minval) {\n       return vec4(0.0,0.0,0.0,0.0);\n   }\n   if (value > 50.0) {\n       backcolor= vec4(84.0, 16.0, 41.0,_aval);\n   }\n   else if (value > 40.0 && value <= 50.0) {\n       backcolor= vec4(158.0, 32.0, 83.0,_aval);\n   }\n   else if (value > 30.0 && value <= 40.0) {\n       backcolor= vec4(215.0, 65.0, 113.0,_aval);\n   }\n   else if (value > 20.0 && value <= 30.0) {\n       backcolor= vec4(225.0, 92.0, 94.0,_aval);\n   }\n   else if (value > 15.0 && value <= 20.0) {\n       backcolor= vec4(233.0, 122.0, 73.0,_aval);\n   }\n   else if (value > 10.0 && value <= 15.0) {\n       backcolor= vec4(234.0, 162.0, 62.0,_aval);\n   }\n   else if (value > 8.0 && value <= 10.0) {\n       backcolor= vec4(193.0, 229.0, 60.0,_aval);\n   }\n   else if (value > 6.0 && value <= 8.0) {\n       backcolor= vec4(156.0, 220.0, 69.0,_aval);\n   }\n   else if (value > 4.0 && value <= 6.0) {\n       backcolor= vec4(69.0, 206.0, 66.0,_aval);\n   }\n   else if (value > 2.0 && value <= 4.0) {\n       backcolor= vec4(78.0, 194.0, 98.0,_aval);\n   }\n   else if (value > 1.0 && value <= 2.0) {\n       backcolor= vec4(71.0, 177.0, 139.0,_aval);\n   }\n   else if (value > 0.5 && value <= 1.0) {\n       backcolor= vec4(64.0, 160.0, 180.0,_aval);\n   }\n   else if (value > 0.2 && value <= 0.5) {\n       backcolor= vec4(67.0, 105.0, 196.0,_aval);\n   }\n   else{\n       backcolor= vec4(0.0, 0.0, 0.0,0.0);\n   }\n   return backcolor / 255.0;\n}\nuniform float u_Scale;\nuniform float u_Startlon;\nuniform float u_Startlat;\nuniform float pic_width;\nuniform float pic_height;\nuniform float lat_width;\nuniform float leftlon;\nuniform float loncell;\nuniform float toplat;\nuniform float latspan;\nuniform float lonspan;\nuniform vec2 widhei;\nuniform float data_resolution;\nuniform float Minval;\nvoid main(){\n   float lon = leftlon + lonspan * (gl_FragCoord.x / widhei.x);\n   lon = mod(lon , 360.0);\n   if(lon < 0.0){       lon = lon + 360.0;\n   }   vec2 texturecoor = vec2( 0.0 , gl_FragCoord.y / widhei.y );\n   vec4 color1 = texture2D(u_Sampler1,texturecoor) ;\n   float lat = color1.x  ;\n   vec2 v_Lonlat = vec2(lon,lat);\n   float col_left =float(floor((lon - u_Startlon)/u_Scale));\n   float col_right = col_left + 1.0;\n   float row_top =float(floor((u_Startlat - lat)/u_Scale));\n   float row_bottom = row_top + 1.0;\n   float left_p = col_left / pic_width;\n   float right_p = col_right / pic_width;\n\tif(lon > (360.0-data_resolution) && lon <= 360.0){\n\t\tright_p = 0.0;\n\t}\n\t\n   float top_p = 1.0 - (row_top / pic_height);\n   float bottom_p =1.0 - (row_bottom / pic_height);\n   vec4 color_lt =  texture2D(u_Sampler, vec2(left_p,top_p));\n   vec4 color_rt =  texture2D(u_Sampler, vec2(right_p,top_p));\n   vec4 color_lb =  texture2D(u_Sampler, vec2(left_p,bottom_p));\n   vec4 color_rb =  texture2D(u_Sampler, vec2(right_p,bottom_p));\n   float val_lt = getvalue(color_lt);\n   float val_rt = getvalue(color_rt);\n   float val_lb = getvalue(color_lb);\n   float val_rb = getvalue(color_rb);\n   vec2 left_top = vec2(u_Startlon + u_Scale * col_left , u_Startlat - u_Scale * row_top);\n   vec2 right_top = vec2(u_Startlon + u_Scale * col_right , u_Startlat - u_Scale * row_top);\n   vec2 left_bottom = vec2(u_Startlon + u_Scale * col_left , u_Startlat - u_Scale * row_bottom);\n   vec2 right_bottom = vec2(u_Startlon + u_Scale * col_right , u_Startlat - u_Scale * row_bottom);\n   float r_1 = (right_bottom.x - v_Lonlat.x)/(right_bottom.x - left_bottom.x) * val_lb + (v_Lonlat.x - left_bottom.x)/(right_bottom.x - left_bottom.x) * val_rb;\n   float r_2 = (right_bottom.x - v_Lonlat.x)/(right_bottom.x - left_bottom.x) * val_lt + (v_Lonlat.x - left_bottom.x)/(right_bottom.x - left_bottom.x) * val_rt;\n   float v_12 = (left_top.y - v_Lonlat.y)/(left_top.y - left_bottom.y) * r_1 + (v_Lonlat.y - left_bottom.y)/(left_top.y - left_bottom.y) * r_2;\n   vec4 necolor = getColor(v_12,Minval);\n   gl_FragColor = necolor;\n}\n",
        VSHADER_SOURCE_TMP: "attribute vec4 a_Position;\nvoid main(){\n\tvec4 posi = a_Position;\n   gl_Position = posi;\n}\n",
        FSHADER_SOURCE_TMP: "#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D u_Sampler;\nuniform sampler2D u_Sampler1;\nuniform sampler2D u_Sampler2;\nfloat getvalue(vec4 colo){\n   float _r = colo.r * 255.0 ;\n   float _g = colo.g * 255.0 ;\n   float _b = colo.b * 255.0 ;\n   float _a = colo.a * 255.0 ;\n   float _val = _r + _g + _b/100.0 - 273.15;\n   return _val;\n}\nuniform float u_Scale;\nuniform float u_Startlon;\nuniform float u_Startlat;\nuniform float pic_width;\nuniform float pic_height;\nuniform float lat_width;\nuniform float leftlon;\nuniform float loncell;\nuniform float toplat;\nuniform float latspan;\nuniform float lonspan;\nuniform vec2 widhei;\nuniform float data_resolution;\nvoid main(){\n   float lon = leftlon + lonspan * (gl_FragCoord.x / widhei.x);\n   lon = mod(lon , 360.0);\n   if(lon < 0.0){       lon = lon + 360.0;\n   }   vec2 texturecoor = vec2( 0.0 , gl_FragCoord.y / widhei.y );\n   vec4 color1 = texture2D(u_Sampler1,texturecoor) ;\n   float lat = color1.x ;\n   vec2 v_Lonlat = vec2(lon,lat);\n   float col_left =float(floor((lon - u_Startlon)/u_Scale));\n   float col_right = col_left + 1.0;\n   float row_top =float(floor((u_Startlat - lat)/u_Scale));\n   float row_bottom = row_top + 1.0;\n   float left_p = col_left / pic_width;\n   float right_p = col_right / pic_width;\n\tif(lon > (360.0-data_resolution) && lon <= 360.0){\n\t\tright_p = 0.0;\n\t}\n\t\n   float top_p = 1.0 - (row_top / pic_height);\n   float bottom_p =1.0 - (row_bottom / pic_height);\n   vec4 color_lt =  texture2D(u_Sampler, vec2(left_p,top_p));\n   vec4 color_rt =  texture2D(u_Sampler, vec2(right_p,top_p));\n   vec4 color_lb =  texture2D(u_Sampler, vec2(left_p,bottom_p));\n   vec4 color_rb =  texture2D(u_Sampler, vec2(right_p,bottom_p));\n   float val_lt = getvalue(color_lt);\n   float val_rt = getvalue(color_rt);\n   float val_lb = getvalue(color_lb);\n   float val_rb = getvalue(color_rb);\n   vec2 left_top = vec2(u_Startlon + u_Scale * col_left , u_Startlat - u_Scale * row_top);\n   vec2 right_top = vec2(u_Startlon + u_Scale * col_right , u_Startlat - u_Scale * row_top);\n   vec2 left_bottom = vec2(u_Startlon + u_Scale * col_left , u_Startlat - u_Scale * row_bottom);\n   vec2 right_bottom = vec2(u_Startlon + u_Scale * col_right , u_Startlat - u_Scale * row_bottom);\n   float r_1 = (right_bottom.x - v_Lonlat.x)/(right_bottom.x - left_bottom.x) * val_lb + (v_Lonlat.x - left_bottom.x)/(right_bottom.x - left_bottom.x) * val_rb;\n   float r_2 = (right_bottom.x - v_Lonlat.x)/(right_bottom.x - left_bottom.x) * val_lt + (v_Lonlat.x - left_bottom.x)/(right_bottom.x - left_bottom.x) * val_rt;\n   float v_12 = (left_top.y - v_Lonlat.y)/(left_top.y - left_bottom.y) * r_1 + (v_Lonlat.y - left_bottom.y)/(left_top.y - left_bottom.y) * r_2;\n   vec4 necolor = texture2D(u_Sampler2,vec2(0.0 ,1.0- (v_12 + 35.0)/100.0));\n   necolor.w = 0.9 ;\n   if(v_12 == 0.0) {\n       necolor= vec4(0.0,0.0,0.0,0.0);\n   }\n   gl_FragColor = necolor;\n}\n",
        VSHADER_SOURCE_SEATMP: "attribute vec4 a_Position;\nvoid main(){\n\tvec4 posi = a_Position;\n   gl_Position = posi;\n}\n",
        FSHADER_SOURCE_SEATMP: "#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D u_Sampler;\nuniform sampler2D u_Sampler1;\nuniform sampler2D u_Sampler2;\nfloat getvalue(vec4 colo){\n   float _r = colo.r * 255.0 ;\n   float _g = colo.g * 255.0 ;\n   float _b = colo.b * 255.0 ;\n   float _a = colo.a * 255.0 ;\n   float _val = _r + _g + _b/100.0 - 273.15;\n   return _val;\n}\nuniform float u_Scale;\nuniform float u_Startlon;\nuniform float u_Startlat;\nuniform float pic_width;\nuniform float pic_height;\nuniform float lat_width;\nuniform float leftlon;\nuniform float loncell;\nuniform float toplat;\nuniform float latspan;\nuniform float lonspan;\nuniform vec2 widhei;\nuniform float data_resolution;\nvoid main(){\n   float lon = leftlon + lonspan * (gl_FragCoord.x / widhei.x);\n   lon = mod(lon , 360.0);\n   if(lon < 0.0){       lon = lon + 360.0;\n   }   vec2 texturecoor = vec2( 0.0 , gl_FragCoord.y / widhei.y );\n   vec4 color1 = texture2D(u_Sampler1,texturecoor) ;\n   float lat = color1.x;\n   vec2 v_Lonlat = vec2(lon,lat);\n   float col_left =float(floor((lon - u_Startlon)/u_Scale));\n   float col_right = col_left + 1.0;\n   float row_top =float(floor((u_Startlat - lat)/u_Scale));\n   float row_bottom = row_top + 1.0;\n   float left_p = col_left / pic_width;\n   float right_p = col_right / pic_width;\n\tif(lon > (360.0-data_resolution) && lon <= 360.0){\n\t\tright_p = 0.0;\n\t}\n\t\n   float top_p = 1.0 - (row_top / pic_height);\n   float bottom_p =1.0 - (row_bottom / pic_height);\n   vec4 color_lt =  texture2D(u_Sampler, vec2(left_p,top_p));\n   vec4 color_rt =  texture2D(u_Sampler, vec2(right_p,top_p));\n   vec4 color_lb =  texture2D(u_Sampler, vec2(left_p,bottom_p));\n   vec4 color_rb =  texture2D(u_Sampler, vec2(right_p,bottom_p));\n   if(color_lt.w == 0.0&&color_rt.w == 0.0&&color_lb.w == 0.0&&color_rb.w == 0.0){       gl_FragColor = vec4(0.0,0.0,0.0,0.0);\n   }else{       float val_lt = getvalue(color_lt);\n       float val_rt = getvalue(color_rt);\n       float val_lb = getvalue(color_lb);\n       float val_rb = getvalue(color_rb);\n       vec2 left_top = vec2(u_Startlon + u_Scale * col_left , u_Startlat - u_Scale * row_top);\n       vec2 right_top = vec2(u_Startlon + u_Scale * col_right , u_Startlat - u_Scale * row_top);\n       vec2 left_bottom = vec2(u_Startlon + u_Scale * col_left , u_Startlat - u_Scale * row_bottom);\n       vec2 right_bottom = vec2(u_Startlon + u_Scale * col_right , u_Startlat - u_Scale * row_bottom);\n       float r_1 = (right_bottom.x - v_Lonlat.x)/(right_bottom.x - left_bottom.x) * val_lb + (v_Lonlat.x - left_bottom.x)/(right_bottom.x - left_bottom.x) * val_rb;\n       float r_2 = (right_bottom.x - v_Lonlat.x)/(right_bottom.x - left_bottom.x) * val_lt + (v_Lonlat.x - left_bottom.x)/(right_bottom.x - left_bottom.x) * val_rt;\n       float v_12 = (left_top.y - v_Lonlat.y)/(left_top.y - left_bottom.y) * r_1 + (v_Lonlat.y - left_bottom.y)/(left_top.y - left_bottom.y) * r_2;\n       vec4 necolor = texture2D(u_Sampler2,vec2(0.0 ,1.0- (v_12 + 3.0 )/35.0));\n       necolor.w = 0.9 ;\n       if(v_12 == 0.0) {\n           necolor= vec4(0.0,0.0,0.0,0.0);\n       }\n       gl_FragColor = necolor;\n   }\n}\n"
    };
    
    this._initCanvas = function () {
        //最终的内插后的图就是画在这个canvas上
        var canvas = document.createElement("canvas");
        canvas.id = "scalarLayer";
        canvas.width = Config.map.transform.width;
        canvas.height = Config.map.transform.height;
        canvas.style.position = "absolute";
        document.body.appendChild(canvas);
        canvas.style.display = "none";
        this._canvas = canvas;

        //画标注的canvas
        var canvas_label = document.createElement("canvas");
        canvas_label.id = "scalarLabelLayer";
        canvas_label.width = Config.map.transform.width;
        canvas_label.height = Config.map.transform.height;
        canvas_label.style.position = "absolute";
        document.body.appendChild(canvas_label);
        canvas_label.style.display = "none";
        this._canvas_label = canvas_label;
    };

    //添加到地图对应位置上
    this.putCanvas = function () {
        var map = this._map;

        var currentbounds = Config.map.getBounds();
        var left = currentbounds.getSouthWest().lng;
        var right = currentbounds.getNorthEast().lng;
        var top = currentbounds.getNorthEast().lat;
        var bottom = currentbounds.getSouthWest().lat;
        
        //mapbox中添加标量场图层
        if (this._map.getSource('scalarLayer')) {
            var source = map.getSource('scalarLayer');
            source.setCoordinates([
                [left, top],
                [right, top],
                [right, bottom],
                [left, bottom]
            ]);
        }
        else { 
            this._map.addSource('scalarLayer', {
                type: 'canvas',
                canvas: 'scalarLayer',
                coordinates: [
                    [left, top],
                    [right, top],
                    [right,bottom],
                    [left, bottom]
                ]
            });
    
            map.addLayer({
                "id":"scalarLayer",
                "type":"raster" ,
                "source":"scalarLayer"
            });
        }
        
        //mapbox中添加标量场图层的注记
        if (this._map.getSource('scalarLabelLayer')) {
            var source = map.getSource('scalarLabelLayer');
            source.setCoordinates([
                [left, top],
                [right, top],
                [right, bottom],
                [left, bottom]
            ]);
        }
        else { 
            Config.map.addSource('scalarLabelLayer', {
                type: 'canvas',
                canvas: 'scalarLabelLayer',
                coordinates: [
                    [left, top],
                    [right, top],
                    [right,bottom],
                    [left, bottom]
                ]
            });
            map.addLayer({
                "id":"scalarLabelLayer",
                "type":"raster" ,
                "source":"scalarLabelLayer"
            });
        }
    }

    this.clearCanvas = function () {
        //清除标记
        var canvas_label = self._canvas_label;
        canvas_label.getContext("2d").clearRect(0, 0, canvas_label.width, canvas_label.height);
        //清除标量场
        var canvas = this._canvas;
        gl = canvas.getContext("experimental-webgl", {
            preserveDrawingBuffer: !0
        });
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);
    };
        
    //从图片中获取数据
    this.getImageData = function () {
        var self = this;

        (function () {
    
            var image = new Image();
            image.crossOrigin = "Anonymous";
            image.src = self.texturepath;
    
            image.onload = function () {
    
                drawByImage(image);
            };
    
            image.onerror = function (err) {//如果full请求不到，请求wave_E_full，仅适用于海浪场，海温降水等忽略
                if (self.texturepath.indexOf("wave_E_full.png") > -1) {
                    self.texturepath = self.texturepath.replace("wave_E_full.png", "wave_G_full.png");
                    image.src = self.texturepath;
                    return;
                }
                //if (self.texturepath.indexOf("wave_E_full.png") > -1) {
                //    self.texturepath = self.texturepath.replace("wave_E_full.png", "wave_G_full.png");
                //    image.src = self.texturepath;
                //    return;
                //}
                Config.hideloading(self.options.type + "_icon");
                Config.shownodata(self.options.type + "_icon");
                try {
                    var gl = self.webglcontext;//第二次加载数据清除之前的
                    gl.clearColor(0.0, 0.0, 0.0, 0.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.clear(gl.DEPTH_BUFFER_BIT);
                } catch (e) {
                    console.log(e);
                };
    
            }
        })()
    
    }

    //用图片数据绘制
    function drawByImage(image) {
        //Config.hideloading(self.options.type + "_icon");
        var can = document.createElement("canvas");
        can.width = image.width;
        can.height = image.height;
        var ImgdataCtx = can.getContext("2d");
        ImgdataCtx.drawImage(image, 0, 0);
    
    
        //if (image.src.split('/')[4] === Config.currentTime) {
            Config.ImgData[self.texturepath] = ImgdataCtx.getImageData(0, 0, image.width, image.height);
        // } else {
        //     return;
        // }
    
    
    
        var imgdat = ImgdataCtx.getImageData(0, 0, image.width, image.height).data;
        //先读取头文件
        var startLon = Config.rasterHeader.startLon;
        var startLat = Config.rasterHeader.startLat;
        var scale = Config.rasterHeader.scale;
        var header = {
            scale: scale,
            startLat: startLat,
            startLon: startLon,
            nx: image.width,
            ny: image.height,
            nodata: -999
        }
    
        //change by xy 改成了按海温规则读取
        var data = new Array();
        for (i = 0; i < image.height; i++) {
            data[i] = new Array();
            for (j = 0; j < image.width; j++) {
                var x = (i * 4) * image.width + (j * 4);
                var a = imgdat[x + 3];
                if (a == 0) {
                    data[i][j] = -999;
                    continue;
                }
                var r = imgdat[x];
                var g = imgdat[x + 1];
                var b = imgdat[x + 2];
                var value_0 = r + g + b/ 100;
                data[i][j] = value_0;
            }
        }

        // var data = new Array();
        // for (i = 0; i < image.height; i++) {
        //     data[i] = new Array();
        //     for (j = 0; j < image.width; j++) {
        //         var x = (i * 4) * image.width + (j * 4);
        //         var a = imgdat[x + 3];
        //         if (a == 0) {
        //             data[i][j] = -999;
        //             continue;
        //         }
        //         var r = imgdat[x];
        //         var g = imgdat[x + 1];
        //         var b = imgdat[x + 2];
        //         var value_0 = r + g / 100.0;
        //         data[i][j] = value_0;
        //     }
        // }

        self.data = data;
        self._header = header;
        self.texture_data = image;
        self._drawbytexture();
    
        var ctx_label = self._canvas_label.getContext("2d");
        var Cwidth = self._canvas_label.width;
        var Cheight = self._canvas_label.height;
        if (self.options.type == "wave") {//
            Config.currentWaveData = self.data;
            self._drawlabel(ctx_label, Cwidth, Cheight, self._header.startLon, self._header.startLat, self._header.scale, self._header.nodata, self.data);
    
        };// 
    
        if (self.options.type == "gust") {
            Config.currentGustData = self.data;
            //self._drawlabel(ctx_label, Cwidth, Cheight, self._header.startLon, self._header.startLat, self._header.scale, self._header.nodata, self.data);
    
        };// 
    
        if (self.options.type == "seatem") {
    
            var _data = new Array();
            for (i = 0; i < image.height; i++) {
                _data[i] = new Array();
                for (j = 0; j < image.width; j++) {
                    var x = (i * 4) * image.width + (j * 4);
                    var a = imgdat[x + 3];
                    if (a == 0) {
                        _data[i][j] = -999;
                        continue;
                    }
                    var r = imgdat[x];
                    var g = imgdat[x + 1];
                    var value_0 = r + g / 100.0;
                    _data[i][j] = value_0;
                }
            }
            
            Config.currentSeaTemdata = self.data = _data;
            self._drawlabel(ctx_label, Cwidth, Cheight, self._header.startLon, self._header.startLat, self._header.scale, self._header.nodata, self.data);
        };
    
        if (self.options.type == "tmp") {
            var _data = new Array();
            for (i = 0; i < image.height; i++) {
                _data[i] = new Array();
                for (j = 0; j < image.width; j++) {
                    var x = (i * 4) * image.width + (j * 4);
                    var a = imgdat[x + 3];
                    if (a == 0) {
                        _data[i][j] = -999;
                        continue;
                    }
                    var r = imgdat[x];
                    var g = imgdat[x + 1];
                    var b = imgdat[x + 2];
                    var value_0 = r + g + b / 100.0 - 273.15;
                    _data[i][j] = value_0;
                }
            }
            Config.currentTempData = self.data = _data;
        }
        if (self.options.type == "apcp") {
            var data = new Array();
            for (i = 0; i < image.height; i++) {
                data[i] = new Array();
                for (j = 0; j < image.width; j++) {
                    var x = (i * 4) * image.width + (j * 4);
                    var a = imgdat[x + 3];
                    if (a == 0) {
                        data[i][j] = -999;
                        continue;
                    }
                    var r = imgdat[x];
                    var g = imgdat[x + 1];
                    var b = imgdat[x + 2];
                    var value_0 = r + g + b/ 100;
                    data[i][j] = value_0;
                }
            }
            Config.currentApcpData = self.data;
        }
    
    }

    this._drawbytexture=function() { 
        var self = this;
        var data = self.texture_data = Config.ImgData[self.texturepath];
        var currentbounds = Config.map.getBounds();
        var left = currentbounds.getSouthWest().lng;
        var right = currentbounds.getNorthEast().lng;
        var top = currentbounds.getNorthEast().lat;
        var bottom = currentbounds.getSouthWest().lat;
        var canvas = this._canvas;

        var Cwidth = canvas.clientWidth;
        var Cheight = canvas.clientHeight;

        var gl = canvas.getContext('experimental-webgl', {
            preserveDrawingBuffer: true
        });

        gl.viewport(0, 0, canvas.width, canvas.height);
        //var gl = getWebGLContext(canvas);
        self.webglcontext = gl;
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        var cZoom = Config.map.getZoom();
        //if (cZoom >= 12 && self.options.type == "wave") {
        //    gl.clearColor(0.0, 0.0, 0.0, 0.0);
        //    gl.clear(gl.COLOR_BUFFER_BIT);   // 清空canvas
        //    console.log("no ym");
        //    return;
        //}

        // if ((cZoom >= 12 && self.options.type == "seatem") || (cZoom >= 12 && self.options.type == "wave")) {
        //     //gl.clearColor(0.0, 0.0, 0.0, 0.0);
        //     //gl.clear(gl.COLOR_BUFFER_BIT);   // 清空canvas
        //     //console.log("no ym");
        //     //return;
        //     if (!Config.map.hasLayer(Config.AllLayers.worldBoundary)) {
        //         Config.AllLayers.worldBoundary.addTo(Config.map);
        //     }


        // } else {
        //     if (Config.map.hasLayer(Config.AllLayers.worldBoundary)) {
        //         //Config.AllLayers.worldBoundary.addTo(Config.map);
        //         Config.map.removeLayer(Config.AllLayers.worldBoundary);
        //     }
        // }

        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        if (self.options.type == "gust") {
            if (!initShaders(gl, _shader.VSHADER_SOURCE_GUST, _shader.FSHADER_SOURCE_GUST)) {
                console.log("初始化着色器失败！");
                return;
            }
        } else if (self.options.type == "wave") {
            if (!initShaders(gl, _shader.VSHADER_SOURCE_WAVE, _shader.FSHADER_SOURCE_WAVE)) {
                console.log("初始化着色器失败！");
                return;
            }
        }
        else if (self.options.type == "seatem") {
            if (!initShaders(gl, _shader.VSHADER_SOURCE_SEATMP, _shader.FSHADER_SOURCE_SEATMP)) {
                console.log("初始化着色器失败！");
                return;
            }
        }
        else if (self.options.type == "apcp") {
            if (!initShaders(gl, _shader.VSHADER_SOURCE_APCP, _shader.FSHADER_SOURCE_APCP)) {
                console.log("初始化着色器失败！");
                return;
            }
        }
        else if (self.options.type == "tmp") {
            if (!initShaders(gl, _shader.VSHADER_SOURCE_TMP, _shader.FSHADER_SOURCE_TMP)) {
                console.log("初始化着色器失败！");
                return;
            }
        } else {
            //alert("无效图层类型！");
            layer.open({
                title: '提示'
                , content: "无效图层类型！"
            });
            return;
        }

        //设置顶点的相关信息
        var n = self.initVertexBuffers(gl);
        if (n < 0) {
            console.log("无法获取到点的数据");
            return;
        }

        //配置纹理
        if (!self.initTextures(gl, n)) {
            console.log("无法配置纹理");
            return;
        }
    }

    this.initVertexBuffers=function(gl) { 
        var self = this;
        //var texturey = (self.texture_data.height - 1) / self.texture_data.height;
        var texturey = 1.0;

        var verticesSizes = new Float32Array([
            //四个顶点的位置和纹理数据范围
            -1, 1, 0.0, texturey,
            -1, -1, 0.0, 0.0,
            1, 1, 1.0, texturey,
            1, -1, 1.0, 0.0
        ]);

        var n = 4;
        var vertexSizeBuffer = gl.createBuffer();
        if (!vertexSizeBuffer) {
            console.log("无法创建缓冲区");
            return -1;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
        var a_Position = gl.getAttribLocation(gl.program, "a_Position");//
        if (a_Position < 0) {
            console.log("无法获取到存储位置");
            return;
        }

        //获取数组一个值所占的字节数 
        var fsize = verticesSizes.BYTES_PER_ELEMENT;
        //将顶点坐标的位置赋
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, fsize * 4, 0);
        gl.enableVertexAttribArray(a_Position);

        //将数据分辨率初始化_shader
        var dr = gl.getUniformLocation(gl.program, 'data_resolution');
        if (!dr) {
            console.log("未能获取data_resolution的存储位置！");
            return;
        }
        gl.uniform1f(dr, Config.rasterHeader.scale);


        var u_Scale = gl.getUniformLocation(gl.program, 'u_Scale');
        if (!u_Scale) {
            console.log("未能获取u_Scale的存储位置！");
            return;
        }
        gl.uniform1f(u_Scale, self._header.scale);

        var u_Startlon = gl.getUniformLocation(gl.program, 'u_Startlon');
        if (!u_Startlon) {
            console.log("未能获取u_Startlon的存储位置！");
            return;
        }
        gl.uniform1f(u_Startlon, self._header.startLon);

        

        var u_Startlat = gl.getUniformLocation(gl.program, 'u_Startlat');
        if (!u_Startlat) {
            console.log("未能获取u_Startlat的存储位置！");
            return;
        }
        gl.uniform1f(u_Startlat, self._header.startLat);

        var pic_width = gl.getUniformLocation(gl.program, 'pic_width');
        if (!pic_width) {
            console.log("未能获取pic_width的存储位置！");
            return;
        }
        gl.uniform1f(pic_width, self.texture_data.width);

        var pic_height = gl.getUniformLocation(gl.program, 'pic_height');
        if (!pic_height) {
            console.log("未能获取pic_height的存储位置！");
            return;
        }
        gl.uniform1f(pic_height, self.texture_data.height);

        var leftlon = gl.getUniformLocation(gl.program, 'leftlon');
        if (!leftlon) {
            console.log("未能获取leftlon的存储位置！");
            return;
        }
        //var Llon = Config.map.containerPointToLatLng(L.point(0, 0)).lng;
        var Llon = Config.map.unproject([0, 0]).lng;
        gl.uniform1f(leftlon, Llon);

        //var Rlon = Config.map.containerPointToLatLng(L.point(self._canvas.clientWidth, 0)).lng;
        var Rlon = Config.map.unproject([self._canvas.width, 0]).lng;
        var cell = (Rlon - Llon) / (self._canvas.width);

        var lonspan = gl.getUniformLocation(gl.program, 'lonspan');
        if (!lonspan) {
            console.log("未能获取lonspan的存储位置！");
            return;
        }
        gl.uniform1f(lonspan, Rlon - Llon);

        var widhei = gl.getUniformLocation(gl.program, 'widhei');
        if (!widhei) {
            console.log("未能获取widhei的存储位置！");
            return;
        }
        gl.uniform2f(widhei, self._canvas.width, self._canvas.height);

        if (self.options.type === "apcp") {//降水的话会传入这个值
            var Minval = gl.getUniformLocation(gl.program, 'Minval');
            if (!Minval) {
                console.log("未能获取u_Startlon的存储位置！");
                return;
            }
            gl.uniform1f(Minval, self.options.minval);
        }

        //if (self.options.type === "gust") {
        //    var u_Startlat = gl.getUniformLocation(gl.program, 'u_Startlat');
        //    if (!u_Startlat) {
        //        console.log("未能获取u_Startlat的存储位置！");
        //        return;
        //    }
        //    gl.uniform1f(u_Startlat, self._header.startLat);
        //}
        


        return n;
    }

    this.initTextures=function(gl, n) { 
        var self = this;
        gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear');
        var texture = gl.createTexture();//创建纹理对象
        var texture1 = gl.createTexture();
        var texture2 = gl.createTexture();
        if (!texture || !texture1 || !texture2) {
            console.log("无法创建纹理对象");
            return;
        }
        //获取u_Sampler的存储位置
        var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
        var u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
        var u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
        if (u_Sampler < 0 || u_Sampler1 < 0 || u_Sampler2 < 0) {
            console.log("无法获取变量的存储位置");
            return;
        }

        //var Cwidth = self._canvas.clientWidth;
        //var Cheight = self._canvas.clientHeight;
        var Cwidth = self._canvas.width;
        var Cheight = self._canvas.height;
        var canvas_lat = document.createElement("canvas");
        canvas_lat.width = 1;
        canvas_lat.height = Cheight;
        var latctx = canvas_lat.getContext("2d");
        var imgdata = latctx.getImageData(0, 0, 1, Cheight);

        var floatArr = [];

        for (var i = 0; i < Cheight; i++) {
            var lat = Config.map.unproject([0, i]).lat;
            floatArr.push(lat, 0, 0, 0);

            if (lat < 0) {
                imgdata.data[i * 4 + 3] = 255;//a
            } else {
                imgdata.data[i * 4 + 3] = 0;//a   
            }

            lat = Math.abs(lat);
            latInt = parseInt(lat);
            imgdata.data[i * 4] = latInt; //r

            var xiaoshu = (lat - latInt !== 0) ? ((lat - latInt).toString().split('.')[1]) : ("0");
            if (xiaoshu.length < 12) {
                xiaoshu = xiaoshu.PadRight(12, '0');
            }
            imgdata.data[i * 4 + 1] = parseInt(xiaoshu.substring(0, 2));//g
            imgdata.data[i * 4 + 2] = parseInt(xiaoshu.substring(2, 4));//b

        }
        var imgFloat = new Float32Array(floatArr);

        var colorbarArr = [];
        if (self.options.type == "wave") {
            colorbarArr = _colorramp.colorbar_wave;
        } else if (self.options.type === "gust") {
            colorbarArr = _colorramp.colorbar_gust;
        } else {
            colorbarArr = _colorramp.colorbar_tmp;
        }

        var colorbar = document.createElement("canvas");
        colorbar.width = 1;
        colorbar.height = colorbarArr.length;
        var colorbarctx = colorbar.getContext("2d");
        var colorbardata = colorbarctx.getImageData(0, 0, 1, colorbar.height);
        for (var i = 0; i < colorbarArr.length; i++) {
            colorbardata.data[i * 4] = colorbarArr[i].r;
            colorbardata.data[i * 4 + 1] = colorbarArr[i].g;
            colorbardata.data[i * 4 + 2] = colorbarArr[i].b;
            colorbardata.data[i * 4 + 3] = 255;
        }

        //colorbarctx.putImageData(colorbardata, 0, 0);
        //var img = self.convertCanvasToImage(colorbar);

        //var url = colorbar.toDataURL('image/png')
        //// 生成一个a元素
        //var a = document.createElement('a')
        //// 创建一个单击事件
        //var event = new MouseEvent('click')

        //// 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
        //a.download = name || '下载图片名称'
        //// 将生成的URL设置为a.href属性
        //a.href = url

        //// 触发a的单击事件
        //a.dispatchEvent(event)

        self.loadTexture(gl, n, texture, u_Sampler, self.texture_data, 0);
        //self.loadTexture(gl, n, texture1, u_Sampler1, imgdata, 1);  
        self.loadTexture(gl, n, texture1, u_Sampler1, imgFloat, 1);
        self.loadTexture(gl, n, texture2, u_Sampler2, colorbardata, 2);
        return true;
    }

    this.loadTexture=function(gl, n, texture, u_Sampler, image, texUnit) { 
        var self = this;
        //对纹理图像进行y轴反转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        //开启0号纹理单元
        if (texUnit == 0) {
            gl.activeTexture(gl.TEXTURE0);
            self.g_texUnit = true;
            //向target绑定纹理对象
            gl.bindTexture(gl.TEXTURE_2D, texture);
            //配置纹理参数
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            //配置纹理图像
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            //将0号纹理传递给着色器
            gl.uniform1i(u_Sampler, texUnit);
        } else if (texUnit == 1) {
            //gl.activeTexture(gl.TEXTURE1);
            //self.g_texUnit1 = true;
            ////向target绑定纹理对象
            //gl.bindTexture(gl.TEXTURE_2D, texture);
            ////配置纹理参数
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            ////配置纹理图像
            //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            ////将0号纹理传递给着色器
            //gl.uniform1i(u_Sampler, texUnit);


            gl.activeTexture(gl.TEXTURE1);
            self.g_texUnit1 = true;
            //向target绑定纹理对象
            gl.bindTexture(gl.TEXTURE_2D, texture);
            //配置纹理参数
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            //gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            //配置纹理图像
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, image.length / 4, 0, gl.RGBA, gl.FLOAT, image);
            //将0号纹理传递给着色器
            gl.uniform1i(u_Sampler, texUnit);

        } else if (texUnit == 2) {

            gl.activeTexture(gl.TEXTURE2);
            self.g_texUnit2 = true;
            //向target绑定纹理对象
            gl.bindTexture(gl.TEXTURE_2D, texture);
            //配置纹理参数
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);//NEAREST
            //配置纹理图像
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            //将0号纹理传递给着色器
            gl.uniform1i(u_Sampler, texUnit);

        }

        //绘制
        if (self.g_texUnit && self.g_texUnit1 && self.g_texUnit2) {
            //gl.clearColor(0.0, 0.0, 0.0, 1.0);
            //gl.clear(gl.COLOR_BUFFER_BIT);
            //gl.clear(gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

            self.g_texUnit = false;
            self.g_texUnit1 = false;
            self.g_texUnit2 = false;

            self.end = new Date();
            console.log(self.end - self.begin);
        }
    }

    this._drawlabel= function (ctx, Cwidth, Cheight, startLon, startLat, datacell, nodata, wavedata) {//

        var cZoom = Config.map.getZoom();
        //if (cZoom >= 12) {
        //    ctx.clearRect(0, 0, Cwidth, Cheight);
        //    return;
        //}
    
    
        var labelcell = this.options.labelCell;
        var labelcol = Math.ceil(Cwidth / labelcell);
        var labelrow = Math.ceil(Cheight / labelcell);
    
    
        //var labelcol = this.options.density;
        //var labelcell = Cwidth / labelcol;
        //var labelrow = Cheight / labelcell;
        ctx.clearRect(0, 0, Cwidth, Cheight);
        for (var i = 0; i < labelrow; i++) {
            for (var j = 0; j < labelcol; j++) {
                try {
                    var x = j * labelcell;
                    var y = i * labelcell;
                    var point0 = this._map.unproject([x, y]);
                    var lat0 = point0.lat;
                    var lon0 = point0.lng;
                    lon0 = lon0 % 360;
                    if (lon0 < 0) {
                        lon0 = lon0 + 360;
                    }
                    var _row = Math.floor((startLat - lat0) / datacell);
                    var _col = Math.floor((lon0 - startLon) / datacell);
                    if (_row < 0 || _row > wavedata.length || _col < 0 || _col >= wavedata[0].length) {
                        continue;
                    }
                    if (wavedata[_row][_col] == nodata) {
                        continue;
                    }
                    var txt = wavedata[_row][_col].toFixed(1);
                    ctx.font = "15px 微软雅黑";
                    ctx.fillStyle = "rgba(0,0,0,0.4)";
                    ctx.fillText(txt,x,y);
                }
                catch(e){
                    console.log(e);
                    continue;
                }
            }
        }
    }
}