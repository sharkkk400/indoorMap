class Symbol{
    constructor(type, subtype, percentag) { 
        this.type = type;
        this.subtype = subtype;
        this.percentag = percentag;
        this.showDetailSymbol = true;
        //创建canvas对象
        this.c = document.createElement('canvas');
        this.reso = 128;
        this.c.width=this.reso;
        this.c.height=this.reso;
        this.ctext = this.c.getContext('2d');

        //this.showCircle(this.percentag);
        this.showImage();
    }

    getCanvas() { 
        return this.c;
    }

    showImage() { 
        var img = new Image();
        if (this.showDetailSymbol) {
            img.src = "symbol/"+ this.type +"/" + this.subtype + ".png";
        }
        else { 
            img.src = "symbol/"+ this.type +"/" + this.type + ".png";
        }
        var _this=this;
        img.onload = function () {
            var leftTopX = _this.reso / 2 - _this.reso * 42 / 64 / 2;
            var leftTopY = _this.reso / 2 - _this.reso * 42 / 64 / 2;
            var width = _this.reso * 42 / 64;
            var height = _this.reso * 42 / 64;
            _this.ctext.drawImage(img,leftTopX,leftTopY,width,height);
        };
    }

    zoomInImage() {
        this.showDetailSymbol = true;
        this.showImage();
    }

    zoomOutImage(){
        this.showDetailSymbol = false;
        this.showImage();
    }

    hideCircle() {
        //法一：要重新加载图像，容易加载不上
        // this.ctext.clearRect(0, 0, this.c.width, this.c.height);
        // this.showImage();

        //法二：clip 不知能否clip环形
        this.ctext.lineWidth=10/64*this.reso;
        var centerX = this.reso / 2;
        var radius = this.reso / 2 * 25 / 32;
        // this.ctext.beginPath();
        // this.ctext.arc(centerX, centerX, radius, 0, 2 * Math.PI, false);
        // this.ctext.clip();
        // this.ctext.clearRect(0, 0, this.c.width, this.c.height);

        //法三：destination-out
        this.ctext.save();
        this.ctext.globalCompositeOperation = 'destination-out';
        this.ctext.beginPath();
        this.ctext.arc(centerX, centerX, radius, 0, 2 * Math.PI, false);
        this.ctext.stroke();
        this.ctext.restore();

        this.hasShownCircle = false;
    }

    showCircle(percentag) {        
        this.percentag = percentag;
        this.hasShownCircle = true;
        //准备画笔的宽度和颜色
        var redc, greenc, bluec;
        this.ctext.lineWidth=10/64*this.reso;
        var backgroudStrokeColor = "#E0E0E0";
        var foregroundStrokeColor;
        switch (this.type){
            case "餐饮":
                var baseColor = "#f5c089";
                foregroundStrokeColor = tinycolor(baseColor).darken(percentag*20).toString();
                break;
            case "购物":
                var baseColor = "#66bef5";
                foregroundStrokeColor = tinycolor(baseColor).darken(percentag*20).toString();
                break;
            case "服务":
                var baseColor = "#a6f57d";
                foregroundStrokeColor = tinycolor(baseColor).darken(percentag*20).toString();
                break;
            case "娱乐":
                var baseColor = "#cb91f5";
                foregroundStrokeColor = tinycolor(baseColor).darken(percentag*20).toString();
                break;
            default:
                break;
        }
        //绘制符号外面的圈
        this.ctext.strokeStyle=backgroudStrokeColor;
        this.ctext.beginPath();
        var centerX = this.reso / 2;
        var radius = this.reso / 2 * 25 / 32;
        this.ctext.arc(centerX,centerX,radius,0,2*Math.PI);
        this.ctext.stroke();
        this.ctext.strokeStyle=foregroundStrokeColor;
        this.ctext.beginPath();
        this.ctext.arc(centerX,centerX,radius,-0.5*Math.PI,(percentag*2-0.5)*Math.PI);
        this.ctext.stroke();        
    }
}

//扩展canvas的清除画布功能，清除圆形区域
// CanvasRenderingContext2D.prototype.clearArc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
//     this.beginPath();
//     this.globalCompositeOperation = 'destination-out';
//     this.fillStyle = "rgba(0,0,0,0.5)";//透明
//     this.arc(x, y, radius, startAngle, endAngle, anticlockwise);
//     // 参数分别是：圆心横坐标、纵坐标、半径、开始的角度、结束的角度、是否逆时针
//     this.fill();
//     this.closePath();
// };

 //type:类别;subtype:子类别;percentag:圈转多少 重载：没有第三个参数就是只有中间
// function symbol(type, subtype, percentag) {
//     //创建canvas对象
//     var c = document.createElement('canvas');
//     c.width=64;
//     c.height=64;
//     var ctext = c.getContext('2d');

//     if (percentag) { 
//         //准备画笔的宽度和颜色
//         var redc,greenc,bluec;
//         ctext.lineWidth=10;
//         var backgroudStrokeColor,foregroundStrokeColor;
//         switch (type){
//             case "canyin":
//                 redc=255-percentag*100;
//                 greenc=183-percentag*73;
//                 bluec=139-percentag*61;
//                 backgroudStrokeColor = "#ffffff";//"#ffe0cb";
//                 // foregroundStrokeColor="#ffb998";
//                 break;
//             case "gouwu":
//                 redc=168-percentag*89;
//                 greenc=189-percentag*91;
//                 bluec=255-percentag*124;
//                 backgroudStrokeColor = "#ffffff";//"#b4e5ff";
//                 // foregroundStrokeColor="#a8bdff";
//                 break;
//             case "fuwu":
//                 redc=173-percentag*88;
//                 greenc=255-percentag*131;
//                 bluec=155-percentag*77;
//                 backgroudStrokeColor = "#ffffff";//"#e0ffd2";
//                 // foregroundStrokeColor="#b0ff8f";
//                 break;
//             case "yule":
//                 redc=229-percentag*111;
//                 greenc=199-percentag*95;
//                 bluec=255-percentag*125;
//                 backgroudStrokeColor = "#ffffff";//"#e6d6ff";
//                 // foregroundStrokeColor="#e5c7ff";
//                 break;
//             default:
//                 break;
//         }
//         foregroundStrokeColor="rgb("+redc+","+greenc+","+bluec+")";
//         //绘制符号外面的圈
//         ctext.strokeStyle=backgroudStrokeColor;
//         ctext.beginPath();
//         ctext.arc(32,32,25,0,2*Math.PI);
//         ctext.stroke();
//         ctext.strokeStyle=foregroundStrokeColor;
//         ctext.beginPath();
//         ctext.arc(32,32,25,-0.5*Math.PI,(percentag*2-0.5)*Math.PI);
//         ctext.stroke();
//     }

//     //加载符号中间的图片
//     var img = new Image();
//     img.src = "symbol/"+ type +"/" + subtype + ".png";
//     img.onload=function(){
//         ctext.drawImage(img,11,11,42,42);
//     };

//     return c;
// };