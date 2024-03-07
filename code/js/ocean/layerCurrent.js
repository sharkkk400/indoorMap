
function Windy(params) {
    //下面是风场主要的参数
    var mapContainer = params.mapContainer;
    if (!mapContainer) {
        alert("map为必须参数！");
        return;
    }
    var MIN_VELOCITY_INTENSITY = params.minVelocity || 0; // velocity at which particle intensity is minimum (m/s)
    var MAX_VELOCITY_INTENSITY = params.maxVelocity || 10; // velocity at which particle intensity is maximum (m/s)
    var VELOCITY_SCALE = (params.velocityScale || 0.005) * (Math.pow(window.devicePixelRatio, 1 / 3) || 1); // scale for wind velocity (completely arbitrary--this value looks nice)
    var MAX_PARTICLE_AGE = params.particleAge || 90; // max number of frames a particle is drawn before regeneration
    var PARTICLE_LINE_WIDTH = params.lineWidth || 2; // line width of a drawn particle
    var PARTICLE_MULTIPLIER = params.particleMultiplier || 1 / 300; // particle count scalar (completely arbitrary--this values looks nice)//越大越少，控制粒子密度
    var PARTICLE_REDUCTION = Math.pow(window.devicePixelRatio, 1 / 3) || 1.6; // multiply particle count for mobiles by this amount
    var FRAME_RATE = params.frameRate || 15,
        FRAME_TIME = 1000 / FRAME_RATE; // desired frames per second

    //var defaulColorScale = ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"];

    var defaulColorScale = ["rgb(255,0,0)"];//控制粒子颜色 可以为颜色数组 目前设置为单一颜色，后续修改
    var colorScale = params.colorScale || defaulColorScale;

    var NULL_WIND_VECTOR = [NaN, NaN, null]; // singleton for no wind in the form: [u, v, magnitude]

    var builder;
    var grid;
    var gridData = params.data;
    var date;
    var λ0, φ0, Δλ, Δφ, ni, nj;

    var setData = function setData(data) {
        gridData = data;
    };

    // interpolation for vectors like wind (u,v,m)  u、v的插值
    var bilinearInterpolateVector = function bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
        var rx = 1 - x;
        var ry = 1 - y;
        var a = rx * ry,
            b = x * ry,
            c = rx * y,
            d = x * y;
        var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
        var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
        return [u, v, Math.sqrt(u * u + v * v)];
    };

    var createWindBuilder = function createWindBuilder(uComp, vComp) {
        var uData = uComp.data,
            vData = vComp.data;
        return {
            header: uComp.header,
            //recipe: recipeFor("wind-" + uComp.header.surface1Value),
            data: function data(i) {
                return [uData[i], vData[i]];
            },
            interpolate: bilinearInterpolateVector
        };
    };

    var createBuilder = function createBuilder(data) {//数据解析

        var uComp = null,
            vComp = null,
            temp = null,
            scalar = null;

        data.forEach(function (record) {

            switch (record.header.parameterNumber) {
                case 2:
                    uComp = record; break;
                case 3:
                    vComp = record; break;
                default:
                    scalar = record;
            }

        });

        return createWindBuilder(uComp, vComp);
    };

    var buildGrid = function buildGrid(data, callback) {//数据解析

        builder = createBuilder(data);
        var header = builder.header;

        λ0 = header.lo1;
        φ0 = header.la1; // the grid's origin (e.g., 0.0E, 90.0N)

        //Δλ = header.dx;
        //Δφ = header.dy; // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)

        Δλ = header.d;
        Δφ = header.d; // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)

        ni = header.nx;
        nj = header.ny; // number of grid points W-E and N-S (e.g., 144 x 73)

        date = new Date(header.refTime);
        date.setHours(date.getHours() + header.forecastTime);

        grid = [];
        var p = 0;
        var isContinuous = Math.floor(ni * Δλ) >= 360;

        for (var j = 0; j < nj; j++) {
            var row = [];
            for (var i = 0; i < ni; i++ , p++) {
                row[i] = builder.data(p);
            }
            if (isContinuous) {
                // For wrapped grids, duplicate first column as last column to simplify interpolation logic
                row.push(row[0]);
            }
            grid[j] = row;
        }

        callback({
            date: date,
            interpolate: interpolate
        });
    };

    /**
  * Get interpolated grid value from Lon/Lat position
  * @param λ {Float} Longitude
  * @param φ {Float} Latitude
  * @returns {Object}
  */
    var interpolate = function interpolate(λ, φ) {

        if (!grid) return null;

        var i = floorMod(λ - λ0, 360) / Δλ; // calculate longitude index in wrapped range [0, 360)
        var j = (φ0 - φ) / Δφ; // calculate latitude index in direction +90 to -90

        var fi = Math.floor(i),
            ci = fi + 1;
        var fj = Math.floor(j),
            cj = fj + 1;

        var row;
        if (row = grid[fj]) {
            var g00 = row[fi];
            var g10 = row[ci];
            if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
                var g01 = row[fi];
                var g11 = row[ci];
                if (isValue(g01) && isValue(g11)) {
                    // All four points found, so interpolate the value.
                    return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
                }
            }
        }
        return null;
    };

    /**
  * @returns {Boolean} true if the specified value is not null and not undefined.
  */
    var isValue = function isValue(x) {
        return x !== null && x !== undefined;
    };

    /**
  * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
  *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
  */
    var floorMod = function floorMod(a, n) {
        return a - n * Math.floor(a / n);
    };

    /**
  * @returns {Number} the value x clamped to the range [low, high].
  */
    var clamp = function clamp(x, range) {
        return Math.max(range[0], Math.min(x, range[1]));
    };

    /**
  * @returns {Boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
  */
    var isMobile = function isMobile() {
        return (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(navigator.userAgent)
        );
    };

    /**
  * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
  * vector is modified in place and returned by this function.
  */
    function distort(projection, λ, φ, x, y, scale, wind, windy) {



        if (φ > 85 || φ < -85) {
            wind[0] = 0;
            wind[1] = 0;
            return wind;
        } else {
            var u = wind[0] * scale;
            var v = wind[1] * scale;
            var d = distortion(projection, λ, φ, x, y, windy);

            // Scale distortion vectors by u and v, then add.
            wind[0] = d[0] * u + d[2] * v;
            wind[1] = d[1] * u + d[3] * v;
            //wind[0] = u * 15.0;
            //wind[1] = v * 15.0;
            return wind
        }

        ;
    };

    /**
     * 
     * @param {any} projection 空对象
     * @param {any} λ 经度
     * @param {any} φ 纬度
     * @param {any} x 屏幕像素x
     * @param {any} y y
     * @param {any} windy 范围
     */
    function distortion(projection, λ, φ, x, y, windy) {
        var τ = 2 * Math.PI;
        var H = Math.pow(10, -5.2);
        var hλ = λ < 0 ? H : -H;
        var hφ = φ < 0 ? H : -H;

        var pλ = project(φ, λ + hλ, windy);
        var pφ = project(φ + hφ, λ, windy);

        // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1º λ
        // changes depending on φ. Without this, there is a pinching effect at the poles.
        var k = Math.cos(φ / 360 * τ);
        //return [(pλ[0] - x) / hλ / k, (pλ[1] - y) / hλ / k, (pφ[0] - x) / hφ, (pφ[1] - y) / hφ];
        return [(pλ[0] - x) / hλ / k, (pλ[1] - y) / hλ / k, (pφ[0] - x) / hφ, (pφ[1] - y) / hφ];
    };

    var createField = function createField(columns, bounds, callback) {

        /**
   * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
   *          is undefined at that point.
   */
        function field(x, y) {
            var column = columns[Math.round(x)];
            return column && column[Math.round(y)] || NULL_WIND_VECTOR;
        }

        // Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
        // field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
        field.release = function () {
            columns = [];
        };

        field.randomize = function (o) {
            // UNDONE: this method is terrible
            var x, y;
            var safetyNet = 0;
            do {
                x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
                y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y);
            } while (field(x, y)[2] === null && safetyNet++ < 30);
            o.x = x;
            o.y = y;
            return o;
        };

        callback(bounds, field);
    };


    var buildBounds = function buildBounds(bounds, width, height) {
        var upperLeft = bounds[0];
        var lowerRight = bounds[1];
        var x = Math.round(upperLeft[0]); //Math.max(Math.floor(upperLeft[0], 0), 0);
        var y = Math.max(Math.floor(upperLeft[1], 0), 0);
        var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
        var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
        return { x: x, y: y, xMax: width, yMax: yMax, width: width, height: height };

        //return getBounds(1);
    };

    var deg2rad = function deg2rad(deg) {
        return deg / 180 * Math.PI;
    };

    var rad2deg = function rad2deg(ang) {
        return ang / (Math.PI / 180.0);
    };

    function invert(x, y, windy) {
        //var mapLonDelta = windy.east - windy.west;
        //var worldMapRadius = windy.width / rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
        //var mapOffsetY = worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south)));
        //var equatorY = windy.height + mapOffsetY;
        //var a = (equatorY - y) / worldMapRadius;

        //var lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
        //var lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
        //return [lon, lat];

        var lonlatPoint = mapContainer.unproject([x, y]);
        return [lonlatPoint.lng, lonlatPoint.lat];

    };

    var mercY = function mercY(lat) {
        return Math.log(Math.tan(lat / 2 + Math.PI / 4));
    };

    var project = function project(lat, lon, windy) {//经纬度转屏幕坐标
        // both in radians, use deg2rad if neccessary
        //var ymin = mercY(windy.south);
        //var ymax = mercY(windy.north);
        //var xFactor = windy.width / (windy.east - windy.west);
        //var yFactor = windy.height / (ymax - ymin);

        //var y = mercY(deg2rad(lat));
        //var x = (deg2rad(lon) - windy.west) * xFactor;
        //var y = (ymax - y) * yFactor; // y points south

        var lonlatPoint = mapContainer.project([lon, lat]);

        return [lonlatPoint.x, lonlatPoint.y];
    };

    function interpolateField(grid, bounds, extent, callback) {

        var projection = {};
        var mapArea = (extent.south - extent.north) * (extent.west - extent.east);
        var velocityScale = VELOCITY_SCALE * Math.pow(mapArea, 0.4);
        //velocityScale = 0.000016666666666666667 * bounds.height / 2 * VELOCITY_SCALE;
        var columns = [];
        var x = bounds.x;

        function interpolateColumn(x) {
            var column = [];
            for (var y = bounds.y; y <= bounds.yMax; y += 2) {
                var coord = invert(x, y, extent);
                if (coord) {
                    var λ = coord[0],
                        φ = coord[1];
                    if (isFinite(λ)) {
                        var wind = grid.interpolate(λ, φ);
                        if (wind) {
                            wind = distort(projection, λ, φ, x, y, velocityScale, wind, extent);
                            column[y + 1] = column[y] = wind;
                        }
                    }
                }
            }
            columns[x + 1] = columns[x] = column;
        }

        (function batchInterpolate() {
            var start = Date.now();
            while (x < bounds.width) {
                interpolateColumn(x);
                x += 2;
                if (Date.now() - start > 1000) {
                    //MAX_TASK_TIME) {
                    setTimeout(batchInterpolate, 25);
                    return;
                }
            }
            createField(columns, bounds, callback);
        })();
    };

    var animationLoop;
    var animate = function animate(bounds, field) {

        function windIntensityColorScale(min, max) {

            colorScale.indexFor = function (m) {
                // map velocity speed to a style
                return Math.max(0, Math.min(colorScale.length - 1, Math.round((m - min) / (max - min) * (colorScale.length - 1))));
            };

            return colorScale;
        }

        var colorStyles = windIntensityColorScale(MIN_VELOCITY_INTENSITY, MAX_VELOCITY_INTENSITY);
        var buckets = colorStyles.map(function () {
            return [];
        });

        var particleCount = Math.round(bounds.width * bounds.height * PARTICLE_MULTIPLIER);
        if (isMobile()) {
            particleCount *= PARTICLE_REDUCTION;
        }

        var fadeFillStyle = "rgba(0, 0, 0, 0.97)";

        var particles = [];
        for (var i = 0; i < particleCount; i++) {
            particles.push(field.randomize({ age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0 }));
        }

        function evolve() {
            buckets.forEach(function (bucket) {
                bucket.length = 0;
            });
            particles.forEach(function (particle) {
                if (particle.age > MAX_PARTICLE_AGE) {
                    field.randomize(particle).age = 0;
                }
                var x = particle.x;
                var y = particle.y;
                var v = field(x, y); // vector at current position
                var m = v[2];
                if (m === null) {
                    particle.age = MAX_PARTICLE_AGE; // particle has escaped the grid, never to return...
                } else {
                    var xt = x + v[0];
                    var yt = y + v[1];
                    if (field(xt, yt)[2] !== null) {
                        // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
                        particle.xt = xt;
                        particle.yt = yt;
                        buckets[colorStyles.indexFor(m)].push(particle);
                    } else {
                        // Particle isn't visible, but it still moves through the field.
                        particle.x = xt;
                        particle.y = yt;
                    }
                }
                particle.age += 1;
            });
        }

        var g = params.canvas.getContext("2d");
        g.lineWidth = PARTICLE_LINE_WIDTH;
        //g.lineWidth = 2;
        g.fillStyle = fadeFillStyle;
        g.globalAlpha = 0.6;

        function draw() {
            // Fade existing particle trails.
            var prev = "lighter";
            g.globalCompositeOperation = "destination-in";
            g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            g.globalCompositeOperation = prev;
            g.globalAlpha = 0.9;

            // Draw new particle trails.
            buckets.forEach(function (bucket, i) {
                if (bucket.length > 0) {
                    g.beginPath();
                    g.strokeStyle = colorStyles[i];
                    bucket.forEach(function (particle) {
                        g.moveTo(particle.x, particle.y);
                        g.lineTo(particle.xt, particle.yt);


                        //g.moveTo(getX(particle.x, nwMc, zoomUnit), getY(particle.y, nwMc, zoomUnit));
                        //g.lineTo(getX(particle.xt, nwMc, zoomUnit), getY(particle.yt, nwMc, zoomUnit));
                        particle.x = particle.xt;
                        particle.y = particle.yt;
                    });
                    g.stroke();
                }
            });
        }

        var then = Date.now();
        (function frame() {
            animationLoop = requestAnimationFrame(frame);
            var now = Date.now();
            var delta = now - then;
            if (delta > FRAME_TIME) {
                then = now - delta % FRAME_TIME;
                evolve();
                draw();
            }
        })();
    };

    var start = function start(bounds, width, height, extent) {

        var mapBounds = {
            south: deg2rad(extent[0][1]),
            north: deg2rad(extent[1][1]),
            east: deg2rad(extent[1][0]),
            west: deg2rad(extent[0][0]),
            width: width,
            height: height
        };

        stop();

        // build grid
        buildGrid(gridData, function (grid) {
            // interpolateField
            interpolateField(grid, buildBounds(bounds, width, height), mapBounds, function (bounds, field) {
                // animate the canvas with random points
                windy.field = field;
                animate(bounds, field);
            });
        });
    };

    var stop = function stop() {
        if (windy.field) windy.field.release();
        if (animationLoop) cancelAnimationFrame(animationLoop);
    };

    var clearCanvas = function clearCanvas() {
        stop();
        if (params.canvas) params.canvas.height = params.canvas.height;
    };



    //适用于流场的数据驱动方式

    /**获取图片数据
     * */
    function getPictureData() {
        var img = new Image;
        img.crossOrigin = '';
        img.onload = function () {
            rightCount++;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            var data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
            self.splitData(resolution, "L0/R0/C0/", data, canvasWidth, canvasHeight);//传入数据分辨率
        };
        img.src = allData[0];
        img.onerror = function () {
            var data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
            self.splitData(resolution, "L0/R0/C0/", data, canvasWidth, canvasHeight);//传入数据分辨率
        };
    }


    /**
     * 
     * @param {any} resolution
     * @param {any} alldata
     * @param {any} RowCol
     * @param {any} width
     * @param {any} height
     */
    function splitData(resolution, alldata, RowCol, width, height) {


        var RowColArr = alldata.split('/');
        var arrLength = RowColArr.length;
        var Row = parseInt(RowColArr[arrLength - 3].substring(1));//获取行号
        var Col = parseInt(RowColArr[arrLength - 2].substring(1));//获取列号
        var lo1 = Col * resolution;
        var la1 = Row * (-resolution) + 90;

        var nx = width;
        var ny = height;

        var d = resolution / 180;


        //lo1 = 120;
        //la1 = 35;
        //nx = ny = 100;

        var NewData = [];
        NewData[0] = [];

        NewData[0]['header'] = [];
        NewData[0]['data'] = [];

        //header头文件信息
        NewData[0]['header']['parameterNumber'] = 2;

        NewData[0]['header']['lo1'] = lo1;
        NewData[0]['header']['la1'] = la1;
        NewData[0]['header']['d'] = d;
        NewData[0]['header']['nx'] = nx;
        NewData[0]['header']['ny'] = ny;

        NewData[1] = [];
        NewData[1]['header'] = [];
        NewData[1]['data'] = [];



        //header头文件信息
        NewData[1]['header']['parameterNumber'] = 3;
        NewData[1]['header']['lo1'] = lo1;
        NewData[1]['header']['la1'] = la1;
        NewData[1]['header']['d'] = d;
        NewData[1]['header']['nx'] = nx;
        NewData[1]['header']['ny'] = ny;

        for (var i = 0; i < RowCol.length; i += 4) {
            var red = RowCol[i],//红色 u值
                green = RowCol[i + 1],//绿色 v值
                blue = RowCol[i + 2],//蓝色 记录uv正负号
                alpha = RowCol[i + 3];//透明度


            if (alpha === 0) {//透明
                u = 0;
                v = 0;
            } else if (alpha === 255) {
                if (red === 0 && green === 0) {
                    red = Math.random() * 5;
                    green = Math.random() * 10;
                }

                if (blue === 11) {//u,v大于等于0
                    red = Math.abs(red);//u正值
                    green = Math.abs(green);//v正值

                } else if (blue === 10) {//u大于等于0，v小于0
                    red = Math.abs(red);//u正值
                    green = -green;//v负值
                } else if (blue === 1) {//u小于0，v大于等于0
                    red = -red;//u负值
                    green = Math.abs(green);//v正值
                } else if (blue === 0) {//u,v小于0
                    red = -red;//u负值
                    green = -green;//v负值
                }

                var u = red / 100;
                var v = green / 100;

            }
            NewData[0]['data'].push(u);
            NewData[1]['data'].push(v);
        }
        var dataU = [];
        var dataV = [];
        var row = 35 / d;
        var col = 120 / d;

        var k = 0;
        for (var i = 0; i < 100; i++) {
            for (var j = 0; j < 100; j++ , k++) {

                dataU[k] = NewData[0]['data'][(col + i) * 180 + row + j];
                dataV[k] = NewData[1]['data'][(col + i) * 180 + row + j];
            }
        }
        //NewData[0]['data'] = dataU;
        //NewData[1]['data'] = dataV;

        setData(NewData);
        _startWindy();
    }


    //开始绘制
    function _startWindy() {
        var size = mapContainer.getCanvas();
        var bounds = mapContainer.getBounds();
        var swLng = bounds.getSouthWest().lng;
        var swLat = bounds.getSouthWest().lat;
        var neLng = bounds.getNorthEast().lng;
        var neLat = bounds.getNorthEast().lat;

        swLng = swLng;
        swLat = swLat;
        neLng = neLng;
        neLat = neLat;

        //开始绘制，参数为([[0,0],[画布宽,画布高]],画布宽,画布高,[[西南角经度,西南角纬度],[东北角经度,东北角纬度]])
        start([[0, 0], [size.width, size.height]], size.width, size.height, [[swLng, swLat], [neLng, neLat]]);//开始绘制
    }

    /**
     * 
     * @param {any} ctx
     * @param {any} allData
     * @param {any} RowIndex
     * @param {any} ColIndex
     * @param {any} self
     * @param {any} canvasWidth
     * @param {any} canvasHeight
     * @param {any} resolution
     */
    var hbhigh;
    var hbwidth;
    function joinPicture(ctx, allData, RowIndex, ColIndex, self, canvasWidth, canvasHeight, resolution) {
        var DataRow = allData.length;
        var DataCol = allData[RowIndex].length;
        var img = new Image;
        //img.src = "";
        img.crossOrigin = '';
        img.onload = function () {
            rightCount++;
            ctx.drawImage(img, ColIndex * 180, RowIndex * 180, img.width, img.height);
            ColIndex++;
            if (ColIndex < DataCol)
                joinPicture(ctx, allData, RowIndex, ColIndex, self, canvasWidth, canvasHeight, resolution);
            else {
                ColIndex = 0;
                RowIndex++;
                if (RowIndex >= DataRow) {
                    RowIndex = 0;
                    var data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
                    splitData(resolution, allData[0][0], data, canvasWidth, canvasHeight);//传入数据分辨率
                }
                else
                    joinPicture(ctx, allData, RowIndex, ColIndex, self, canvasWidth, canvasHeight, resolution);
            };
        }
        img.src = allData[RowIndex][ColIndex];
        img.onerror = function () {
            var tempURL = allData[RowIndex][ColIndex].toString();
            if (tempURL.indexOf("current_hl") !== -1) {
                ColIndex++;
                if (ColIndex < DataCol)
                    joinPicture(ctx, allData, RowIndex, ColIndex, self, canvasWidth, canvasHeight, resolution);
                else {
                    ColIndex = 0;
                    RowIndex++;
                    if (RowIndex >= DataRow) {
                        RowIndex = 0;
                        var data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;

                        splitData(resolution, allData[0][0], data, canvasWidth, canvasHeight);//传入数据分辨率
                    } else
                        joinPicture(ctx, allData, RowIndex, ColIndex, self, canvasWidth, canvasHeight, resolution);
                }
            }
            else {
                tempURL = tempURL.replace(/current_zl/g, "current_hl");
                allData[RowIndex][ColIndex] = tempURL;
                joinPicture(ctx, allData, RowIndex, ColIndex, self, canvasWidth, canvasHeight, resolution);
                hbwidth=canvasWidth;
                hbhigh=canvasHeight;
            }
        }
    }


    function getparamValue(zoomLevel) {
        var VelocityScale;
        var data_level;

        if (zoomLevel <= 3) {

            VelocityScale = 0.121;
            data_level = 0;
        }
        if (zoomLevel > 3 && zoomLevel <= 4) {

            VelocityScale = 0.125;
            data_level = 1;
        }
        else if (zoomLevel > 4 && zoomLevel <= 6) {
            data_level = 2;
            VelocityScale = 0.12;

        }
        else if (zoomLevel > 6 && zoomLevel <= 7) {
            data_level = 3;
            VelocityScale = 0.12;

        }
        else if (zoomLevel > 7 && zoomLevel <= 9) {
            data_level = 4;
            VelocityScale = 0.12;
        }
        else if (zoomLevel > 9 && zoomLevel <= 10) {
            data_level = 5;
            VelocityScale = 0.12;

        }
        else if (zoomLevel > 10 && zoomLevel <= 11) {
            data_level = 6;
            VelocityScale = 0.11;

        }
        else if (zoomLevel > 11 && zoomLevel <= 12) {
            data_level = 7;
            VelocityScale = 0.11;

        }
        else if (zoomLevel > 12 && zoomLevel <= 13) {
            data_level = 8;
            VelocityScale = 0.11;

        }
        else if (zoomLevel > 13) {
            data_level = 8;
            VelocityScale = 0.11;

        }
        //Config.AllLayers.currentParticleLayer.datalevel = data_level;
        return [VelocityScale, data_level];
    }

    /**计算图片数据
     * */
    function calculateImgData() {
        rightCount = 0;
        this.clearCanvas();
        if (Config.dataPath.indexOf(Config.currentTime) !== -1)
            var webUrl = Config.currentdataPath;
        else {
            var webUrl = Config.dataPath + "/" + Config.currentTime + "/";
        }
        var mapObj = mapContainer;
        //this._current.setMapObj(this._map);
        var zoom_level = mapObj.getZoom();
        var extent = mapObj.getBounds();
        var resolution = 1;
        var params = getparamValue(zoom_level);
        var data_level = params[1];
        //this._current.setVelocityScale(params[0]);
        VELOCITY_SCALE = params[0];//流线的长短
        var allData = [];

        var c = document.createElement('canvas');
        var ctx = c.getContext('2d');//将图片都绘制在canvas上，然后使用getImageData读取所有数据，然后拼出header数据，构造json数据格式

        var img = new Image();
        //img.src = "./current.png";//TODO 我是知道这里会报错的
        ctx.drawImage(img, 0, 0, hbwidth, hbhigh);        

        var RowIndex = 0;
        var ColIndex = 0;

        resolution = 1 / Math.pow(2, data_level);
        var southEast = extent.getSouthEast();
        var northWest = extent.getNorthWest();

        var start_lon = northWest.lng;//start_lon要始终小于end_lon
        var end_lon = southEast.lng;

        var start_lat = southEast.lat;
        var end_lat = northWest.lat;

        resolution = 180 * resolution;

        var nx = 180 / resolution;

        if (start_lon < 0 || start_lon > 360)
            start_lon = floorMod(start_lon, 360);

        if (end_lon < 0 || end_lon > 360)
            end_lon = floorMod(end_lon, 360);

        if (start_lon > end_lon && Math.abs(start_lon - end_lon) < 180) {

            start_lon = 360 - start_lon;
        }

        var startNYIndex = start_lon / resolution;

        var endNYIndex = end_lon / resolution;

        var start_ny = Math.floor(startNYIndex);
        var end_ny = Math.floor(endNYIndex);

        var start_nx;
        if (start_lat < 0)
            start_nx = Math.floor(nx / 2) + Math.floor(Math.abs(start_lat / resolution));
        else
            start_nx = Math.floor((90 - start_lat) / resolution);

        var end_nx;
        if (end_lat < 0)
            end_nx = Math.floor(nx / 2) + Math.floor(Math.abs(end_lat / resolution));
        else
            end_nx = Math.floor((90 - end_lat) / resolution);


        var nyNum = Math.abs(start_ny - end_ny) === 0 ? 1 : Math.abs(start_ny - end_ny) + 1;

        var nxNum = Math.abs(start_nx - end_nx) === 0 ? 1 : Math.abs(start_nx - end_nx) + 1;
        if (data_level === 0)
            nyNum = 2;
        var min_nx = start_nx < end_nx ? start_nx : end_nx;
        var min_ny = start_ny < end_ny ? start_ny : end_ny;

        var canvasWidth = nyNum * 180;
        var canvasHeight = nxNum * 180;

        c.width = canvasWidth;
        c.height = canvasHeight;

        for (var i = min_nx; i < min_nx + nxNum; i++) {
            var indexArr = [];
            for (var j = min_ny; j < min_ny + nyNum; j++) {

                var row = "R";
                var col = "C";
                if (i < 10)
                    row = row + "0" + i;
                else
                    row = row + i;

                if (j < 10)
                    col = col + "0" + j;
                else
                    col = col + j;

                //var dataPath = webUrl + "L" +data_level + "/" +row + "/" + col + "/" + dataName;
                var dataPath = webUrl + "L" + data_level + "/" + row + "/" + col + "/current_zl.png";

                var length = indexArr.length;
                indexArr[length] = dataPath;

            }
            var dataLength = allData.length;
            allData[dataLength] = indexArr;
        }
        joinPicture(ctx, allData, RowIndex, ColIndex, this, canvasWidth, canvasHeight, resolution);
    }




    var windy = {
        params: params,
        start: start,
        stop: stop,
        createField: createField,
        interpolatePoint: interpolate,
        setData: setData,
        clearCanvas: clearCanvas,
        calculateImgData: calculateImgData,
        _startWindy: _startWindy
    };

    return windy;
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
}
