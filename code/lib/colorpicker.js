function interpolate(a,b,c){"use strict";Array.isArray(a)&&(b=a[1],c=a[2],a=a[0]),a+=Math.PI/2-(Math.PI-2),b>1-2*Math.abs(c-.5)&&(b=1-2*Math.abs(c-.5));var d=.417211*Math.sin(a+Math.PI-2)*b+c,e=.158136*Math.sin(a+Math.PI+1.5)*b+c,f=.455928*Math.sin(a+Math.PI)*b+c;return[255*Math.exp(1.25*Math.log(.923166*d+.0791025)),255*Math.exp(1.25*Math.log(.923166*e+.0791025)),255*Math.exp(1.25*Math.log(.923166*f+.0791025))]}

function ColorPicker() {
    var w = 628,
      h = 100,
      canvW = 600,
      canvH = 400;

    var events = d3.dispatch('change');

    var canv = document.createElement('canvas');
    canv.width = w;
    canv.height = h;

    var colors = canv.getContext('2d');
    var image = colors.getImageData(0, 0, w, h);
    var imageMap = {};
    for (var i = 0, j = -1, c; i < w * h; ++i) {
        c = interpolate((i % w)/h, 1, Math.floor(i/w)/h);
        image.data[++j] = c[0];
        image.data[++j] = c[1];
        image.data[++j] = c[2];
        image.data[++j] = 255;
        var thisC = [];
        c.forEach(function(i){ thisC.push(Math.round(i)); });
        if (!imageMap[thisC]) imageMap[thisC] = [j];
        else imageMap[thisC].push(j);
    }

    colors.putImageData(image, 0, 0);

    function findColor(rgb) {
        var l = imageMap[rgb];
        if (!l) return null;
        var loc = l.reduce(function(a,b){return a+b;}) / l.length;
        var x, y;
        var pxW = w*4;
        y = Math.ceil(loc/pxW);
        x = Math.floor((loc % pxW) / 4);
        return [x,y];
    }

    var center;

    function cp(selection) {

        var canvasBox = selection.append('canvas')
          .attr('width', w)
          .attr('height', h)
          .attr('style', 'width:' + canvW + 'px;height:' + canvH + 'px;')
          .style('position', 'absolute');

        var canvasSVG = selection.append('svg')
          .attr('width', w)
          .attr('height', h)
          .attr('class', 'crosshair')
          .attr('style', 'width:' + canvW + 'px;height:' + canvH + 'px;')
          .style('position', 'absolute')
          .call(d3.behavior.drag()
            .on('drag', dragged));
        var block = selection.append('div')
          .attr('width', w)
          .attr('height', h)
          .attr('style', 'width:' + canvW + 'px;height:' + canvH + 'px;')
          .style('display', 'block');

        var cx,
            cy;
        var circle = canvasSVG.append('circle')
            .attr('r', 3)
            .attr('stroke', '#fff')
            .attr('fill','rgba(0,0,0,0)')
            .attr('cx', cx)
            .attr('cy', cy);

        canvasSVG.on('click', function(e) {
            changeColor(d3.event.offsetX, d3.event.offsetY);
        });

        function dragged() {
            changeColor(d3.event.x, d3.event.y);
        }

        function changeColor(x, y) {
            var newX, newY;
            if (x > 0 && x < canvW) newX = x;
            if (y > 0 && y < canvH) newY = y;
            if (newX || newY) {
                moveDot([newX || cx, newY || cy]);
                events.change(getColor(DOMSizeToColorCanvas(newX || cx, newY || cy)));
            }
        }

        function moveDot(loc) {
            circle.attr('cx', loc[0]).attr('cy', loc[1]);
            cx = loc[0];
            cy = loc[1];
        }

        var canvas = canvasBox
          .node().getContext("2d");

        cp.draw(canvas);

        function getColor(p) {
            while (p[0] < 0) p[0] += w;
            while (p[0] > 628) p[0] -= w;
            var rgba = colors.getImageData(Math.round(p[0]), Math.round(p[1]), 1, 1).data;
            if (rgba.length > 4) {
                var r = [], g = [], b = [], a = [];
                for (var i=0; i<rgba.length; i+=4) {
                    r.push(rgba[i]);
                    g.push(rgba[i+1]);
                    b.push(rgba[i+2]);
                    a.push(rgba[i+3]);
                }
                rgba = [];
                [r,g,b,a].forEach(function(c){
                    rgba.push(Math.round(c.reduce(function(a,b){
                        return a+b;
                    }) / c.length));
                });
            }
            return rgbToHex(rgba);
        }

        function colorCanvasToDOMSize(x, y) {
            return [x * canvW / w, y * canvH / h];
        }

        function DOMSizeToColorCanvas(x, y) {
            return [x * w / canvW, y * h / canvH];
        }


        if (center) {
            var loc = findColor(hextoRGB(center.color));
            if (loc) moveDot(colorCanvasToDOMSize(loc[0], loc[1]));
        }

    }

    cp.draw = function(c) {
        c.drawImage(canv, 0, 0);
    };

    cp.width = function(_) {
        if (!arguments.length) return canvW;
        canvW = _;
        return cp;
    };

    cp.height = function(_) {
        if (!arguments.length) return canvH;
        canvH = _;
        return cp;
    };

    cp.center = function(color) {
      center = {color: color};
      return cp;
    }

    function hextoRGB(hex) {
        var shr = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shr, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return res ? [
            parseInt(res[1], 16),
            parseInt(res[2], 16),
            parseInt(res[3], 16)
        ] : null;
    }

    function rgbToHex (rgb) {
        var hexa = '#';
        [rgb[0],rgb[1],rgb[2]].forEach(function(c) {
            var h = c.toString(16);
            hexa += h.length == 1 ? '0' + h : h;
        });
        return hexa;
    }

    return d3.rebind(cp, events, 'on', 'off');
}
