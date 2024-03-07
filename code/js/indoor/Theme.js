/**
 * Created by gaimeng on 2015/11/3.
 * Modified a lot by xiaoyi
 * Some themes for test
 */

//----------------------------theme--------------------------------------
//add by xy 针对我们自己生产的数据自定义的主题 由于光照的影响 效果跟实际颜色有出入

//调试颜色的工具
// var datGuiTestMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
// var controls = new function () {
//     this.opacity = datGuiTestMaterial.opacity;
//     this.color = datGuiTestMaterial.color.getStyle();
// };

// var gui = new dat.GUI();
// var spGui = gui.addFolder("Mesh");
// spGui.add(controls, 'opacity', 0, 1).onChange(function (e) {
//     datGuiTestMaterial.opacity = e
// });
// spGui.addColor(controls, 'color').onChange(function (e) {
//     datGuiTestMaterial.color.setStyle(e)
// });

var wanda3dTheme = {
    name: "test", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.15,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {
                default :
                    break;
            }
        }

        switch(category) {//前四个是为万达四个大类设的色，后面十个是indoor3D最原始的十种配色，数量合适，把自己的过于详细的分类归入其中
            case "餐饮":
                roomStyle = {
                    color: "#FFA07A",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "购物": 
                roomStyle = {
                    color: "#778fff",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "服务": 
                roomStyle = {
                    color: "#66bb89",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "娱乐": 
                roomStyle = {
                    color: "#C39BD3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            default :
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#000000",//"#5C4433",
        opacity: 1,
        transparent: true,
        linewidth: 10//windows的webgl renderer不支持linewidth
    },

    fontStyle:{
        color: "#231815",
        fontsize: 40,
        fontface: "Helvetica, MicrosoftYaHei "
    }
}

var chiconyTheme = {
    name: "baidu", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#e0e0e0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {

                case 100: //hollow. u needn't change this color. because i will make a hole on the model in the final version.
                    return {
                        color: "#F2F2F2",
                        opacity: 0.8,
                        transparent: true
                    }
                case 300: //closed area
                    return {
                        color: "#AAAAAA",
                        opacity: 0.7,
                        transparent: true
                    };
                case 400: //empty shop
                    return {
                        color: "#D3D3D3",
                        opacity: 0.7,
                        transparent: true
                    };
                default :
                    break;
            }
        }

        switch(category) {
            case 4: //非开放区域
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 9: //停车场
                roomStyle = {
                    color: "#DEEEFD",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 11: //vip候车区
                roomStyle = {
                    color: "BFE0FF",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 14: //厕所
                roomStyle = {
                    color: "#66bb89",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 20584:
            case 20586: //购物
                roomStyle = {
                    color: "#778fff",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 20593: //未知
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 20597: //火车站的站台
            case 20599: //休息区
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 20600:
            case 20602: //公共设施交通
                return {
                    color: "#66bb89",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 20623: //火车站的售票处、自动售票机等
            case 20625: //服务台
                roomStyle = {
                    color: "#66bb89",
                    opacity: 0.9,
                    transparent: true
                };
                break;            
            case 20629: //餐饮
            case 20633:
                roomStyle = {
                    color: "#FFA07A",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 20635: //娱乐 
                roomStyle = {
                    color: "#C39BD3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 20641: //atm
                roomStyle = {
                    color: "#D9EAFD",
                    opacity: 1,
                    transparent: true
                };
                break;
            default :
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#5C4433",
        opacity: 0.5,
        transparent: true,
        linewidth: 2
    },

    fontStyle:{
        color: "#231815",
        fontsize: 40,
        fontface: "Helvetica, MicrosoftYaHei "
    },

    pubPointImg: {

        "11001": System.imgPath+"/toilet.png",
        "11002": System.imgPath+"/ATM.png",
        "21001": System.imgPath+"/stair.png",
        "22006": System.imgPath+"/entry.png",
        "21002": System.imgPath+"/escalator.png",
        "21003": System.imgPath+"/lift.png"
    }
}

var conferenceVenueTheme = {
    name: "test", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#e0e0e0",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {
                default :
                    break;
            }
        }

        switch(category) {
            case "房间":
                roomStyle = {
                    color: "#9EB7D6",
                    opacity: 0.9,
                    transparent: true,
                    height:6
                };
                break;
            case "功能区":
                roomStyle = {
                    color: "#9EB7D6",
                    opacity: 0.9,
                    transparent: true,
                    height:3
                };
                break;
            case "通道": 
                roomStyle = {
                    color: "#EDAD3E",
                    opacity: 0.9,
                    transparent: true,
                    height:2
                };
                break;
            case "未开放区域": 
                roomStyle = {
                    color: "#a2a2a7",
                    opacity: 1,
                    transparent: false
                };
                break;
            default :
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#000000",//"#5C4433",
        opacity: 1,
        transparent: true,
        linewidth: 10//windows的webgl renderer不支持linewidth
    },

    fontStyle:{
        color: "#231815",
        fontsize: 35,
        fontface: "Helvetica, MicrosoftYaHei "
    }
}

var creativeCity3dTheme = {
    name: "test", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {
                default :
                    break;
            }
        }

        switch(category) {//前四个是为万达四个大类设的色，后面十个是indoor3D最原始的十种配色，数量合适，把自己的过于详细的分类归入其中
            case "餐饮":
                roomStyle = {
                    color: "#FFA07A",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "购物":
            case "超市":   
            case "医药":     
                roomStyle = {
                    color: "#778fff",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "母婴店": //parent-child
                roomStyle = {
                    color: "#98df8a",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "生活服务": //life services 跟服务一致
            case "医疗":
            case "照相馆":
            case "美容美发":
            case "摄影店":
                roomStyle = {
                    color: "#66bb89",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "教育机构": //education
            case "培训机构":
                return {
                    color: "#2ca02c",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "健身中心": //life style            
                roomStyle = {
                    color: "#dbdb8d",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "网咖": //entertainment 跟娱乐一致
            case "电影院":
            case "线下体验":
            case "儿童活动区":
            case "台球厅":
                roomStyle = {
                    color: "#C39BD3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "空铺": //others//todo未开放区域 非开放区域 厕所 电梯 再单独设个色
                roomStyle = {
                    color: "#8c564b",
                    opacity: 0.9,
                    transparent: true
                };
            default :
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#000000",//"#5C4433",
        opacity: 1,
        transparent: true,
        linewidth: 10//windows的webgl renderer不支持linewidth
    },

    fontStyle:{
        color: "#231815",
        fontsize: 40,
        fontface: "Helvetica, MicrosoftYaHei "
    }
}

var popularWindow3dTheme = {
    name: "test", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {
                default :
                    break;
            }
        }

        switch(category) {//前四个是为万达四个大类设的色，后面十个是indoor3D最原始的十种配色，数量合适，把自己的过于详细的分类归入其中
            case "餐饮":
                roomStyle = {
                    color: "#FFA07A",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "购物": 
                roomStyle = {
                    color: "#778fff",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "服务": 
                roomStyle = {
                    color: "#66bb89",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "娱乐": 
                roomStyle = {
                    color: "#C39BD3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "餐饮店": //food 跟餐饮一致
                roomStyle = {
                    color: "#FFA07A",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "手表店": //retail 跟购物接近都是蓝色系的
            case "服装":
            case "服装店":
            case "服饰鞋包":
            case "杂货店":
            case "珠宝首饰":
            case "礼品店":
            case "花卉店":
            case "袜子店":
            case "鞋店":
                roomStyle = {
                    color: "#aec7e8",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "化妆品": //toiletry
                roomStyle = {
                    color: "#ffbb78",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "童装": //parent-child
                roomStyle = {
                    color: "#98df8a",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "婚纱店": //life services 跟服务一致
            case "纹身店":
            case "美容店":
            case "美容美发":
            case "美甲":
            case "美甲店":
                roomStyle = {
                    color: "#66bb89",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case 106: //education
                return {
                    color: "#2ca02c",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "内衣店": //life style            
                roomStyle = {
                    color: "#dbdb8d",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "娃娃机": //entertainment 跟娱乐一致
            case "游乐区":
            case "网吧":
                roomStyle = {
                    color: "#C39BD3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "物业": //others//todo未开放区域 非开放区域 厕所 电梯 再单独设个色
                roomStyle = {
                    color: "#8c564b",
                    opacity: 0.9,
                    transparent: true
                };
            default :
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#000000",//"#5C4433",
        opacity: 1,
        transparent: true,
        linewidth: 10//windows的webgl renderer不支持linewidth
    },

    fontStyle:{
        color: "#231815",
        fontsize: 40,
        fontface: "Helvetica, MicrosoftYaHei "
    }
}

var newWorld3dTheme = {
    name: "test", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {
                default :
                    break;
            }
        }

        switch(category) {//前四个是为万达四个大类设的色，后面十个是indoor3D最原始的十种配色，数量合适，把自己的过于详细的分类归入其中
            case "餐饮":
                roomStyle = {
                    color: "#FFA07A",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "箱包店":
            case "超市":
            case "户外用品":
            case "户外店":
            case "布艺家纺":
            case "个人用品":
            case "小电器":
            case "手表店": //retail 跟购物接近都是蓝色系的
            case "服装店":
            case "服饰鞋包":
            case "杂货店":
            case "珠宝首饰":
            case "鞋店":
            case "烟草店":
            case "烟草专卖":
                roomStyle = {
                    color: "#aec7e8",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "化妆品": //toiletry
                roomStyle = {
                    color: "#ffbb78",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "医药": //life services 跟服务一致
            case "美容美发":
                roomStyle = {
                    color: "#66bb89",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "内衣店": //life style  
            case "健身房": 
            case "眼镜店": 
            case "舞蹈房": 
            case "茶叶店":     
                roomStyle = {
                    color: "#dbdb8d",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "娃娃机": //entertainment 跟娱乐一致
                roomStyle = {
                    color: "#C39BD3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
            case "银行": //others//todo未开放区域 非开放区域 厕所 电梯 再单独设个色
                roomStyle = {
                    color: "#8c564b",
                    opacity: 0.9,
                    transparent: true
                };
            default :
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.9,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#000000",//"#5C4433",
        opacity: 1,
        transparent: true,
        linewidth: 10//windows的webgl renderer不支持linewidth
    },

    fontStyle:{
        color: "#231815",
        fontsize: 40,
        fontface: "Helvetica, MicrosoftYaHei "
    }
}

var baiduTheme = {
    name: "baidu", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#e0e0e0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {

                case 100: //hollow. u needn't change this color. because i will make a hole on the model in the final version.
                    return {
                        color: "#F2F2F2",
                        opacity: 0.8,
                        transparent: true
                    }
                case 300: //closed area
                    return {
                        color: "#AAAAAA",
                        opacity: 0.7,
                        transparent: true
                    };
                case 400: //empty shop
                    return {
                        color: "#D3D3D3",
                        opacity: 0.7,
                        transparent: true
                    };
                default :
                    break;
            }
        }

        switch(category) {
            case 4: //非开放区域
                roomStyle = {
                    color: "#EBEFF0",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 9: //停车场
                roomStyle = {
                    color: "#DEEEFD",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 11: //vip候车区
                roomStyle = {
                    color: "BFE0FF",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 14: //厕所
                roomStyle = {
                    color: "#DFEAFA",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 20584:
            case 20586: //购物
                roomStyle = {
                    color: "#D9DAF5",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 20593: //未知
                roomStyle = {
                    color: "#E5F1FF",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 20597: //火车站的站台
            case 20599: //休息区
                roomStyle = {
                    color: "#E6F3FF",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 20600:
            case 20602: //公共设施交通
                return {
                    color: "#EBF8E6",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 20623: //火车站的售票处、自动售票机等
            case 20625: //服务台
                roomStyle = {
                    color: "#C6DCFF",
                    opacity: 1,
                    transparent: true
                };
                break;            
            case 20629: //餐饮
            case 20633:
                roomStyle = {
                    color: "#FEEFD1",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 20635: //娱乐 
                roomStyle = {
                    color: "#F3DAF5",
                    opacity: 1,
                    transparent: true
                };
                break;
            case 20641: //atm
                roomStyle = {
                    color: "#D9EAFD",
                    opacity: 1,
                    transparent: true
                };
                break;
            default :
                roomStyle = {
                    color: "#c49c94",
                    opacity: 1,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#5C4433",
        opacity: 0.5,
        transparent: true,
        linewidth: 2
    },

    fontStyle:{
        color: "#231815",
        fontsize: 40,
        fontface: "Helvetica, MicrosoftYaHei "
    },

    pubPointImg: {

        "11001": System.imgPath+"/toilet.png",
        "11002": System.imgPath+"/ATM.png",
        "21001": System.imgPath+"/stair.png",
        "22006": System.imgPath+"/entry.png",
        "21002": System.imgPath+"/escalator.png",
        "21003": System.imgPath+"/lift.png"
    }
}

var default3dTheme = {
    name: "test", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //add by xy 奇数层和偶数层颜色不一样，好区分
    floorOdd: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    floorEven: {
        color: "#C0C0C0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {

                case 100: //hollow. u needn't change this color. because i will make a hole on the model in the final version.
                    return {
                        color: "#F2F2F2",
                        opacity: 0.8,
                        transparent: true
                    }
                case 300: //closed area
                    return {
                        color: "#AAAAAA",
                        opacity: 0.7,
                        transparent: true
                    };
                case 400: //empty shop
                    return {
                        color: "#D3D3D3",
                        opacity: 0.7,
                        transparent: true
                    };
                default :
                    break;
            }
        }

        switch(category) {
            case 101: //food
                roomStyle = {
                    color: "#1f77b4",
                    opacity: 0.7,//comment by xy 为了让wifi热力图更清楚可调低透明度
                    transparent: true
                };
                break;
            case 102: //retail
                roomStyle = {
                    color: "#aec7e8",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 103: //toiletry
                roomStyle = {
                    color: "#ffbb78",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 104: //parent-child
                roomStyle = {
                    color: "#98df8a",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 105: //life services
                roomStyle = {
                    color: "#bcbd22",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 106: //education
                return {
                    color: "#2ca02c",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 107: //life style
                roomStyle = {
                    color: "#dbdb8d",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 108: //entertainment
                roomStyle = {
                    color: "#EE8A31",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 109: //others
                roomStyle = {
                    color: "#8c564b",
                    opacity: 0.7,
                    transparent: true
                };
            default :
                roomStyle = {
                    color: "#c49c94",
                    opacity: 0.7,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#5C4433",
        opacity: 0.5,
        transparent: true,
        linewidth: 2
    },

    fontStyle:{
        color: "#231815",
        fontsize: 40,
        fontface: "Helvetica, MicrosoftYaHei "
    },

    pubPointImg: {

        "11001": System.imgPath+"/toilet.png",
        "11002": System.imgPath+"/ATM.png",
        "21001": System.imgPath+"/stair.png",
        "22006": System.imgPath+"/entry.png",
        "21002": System.imgPath+"/escalator.png",
        "21003": System.imgPath+"/lift.png"
    }
}