function upload_data() {
    // row 
    // 0 表头
    // 1 第一条记录

    // cell 
    // 0 文件
    // 1 最小层级 zmin
    // 2 最大层级 zmax

    // 0	5k	17	    18
    // 1	7k5	16	    17
    // 2	1w	15	    16
    // 3	2w	14	    15
    // 4	3w	13	    14
    // 5	4w	12	    13
    // 6	5w	11	    12

    var mydata = document.getElementById("uptable");
    // var file = mydata.rows[1].cells[0].childNodes[0].files; //获取文件内容
    var records = mydata.rows

    for (i = 1; i < records.length; i++) {
        row = records[i]
        file = row.cells[0].childNodes[0].files;
        zmin = row.cells[1].childNodes[0].value
        zmax = row.cells[2].childNodes[0].value
        render_layer(file, zmin, zmax)
    }

    document.getElementById('upload_board').style.setProperty('visibility', 'hidden', 'important')

}


function update_level() {
    var mydata = document.getElementById("uptable");
    var records = mydata.rows
    for (i = 1; i < records.length; i++) {
        row = records[i]
        file = row.cells[0].childNodes[0].files;
        maxlevel = file[0].name.split('_')[1]
        row.cells[1].childNodes[0].value = maxlevel - 1
        row.cells[2].childNodes[0].value = maxlevel
        console.log(file, mydata.rows[i].cells[1].childNodes[0].value, mydata.rows[i].cells[2].childNodes[0].value)
    }
}

function addline() {
    console.log(111)
    var trObj = document.createElement("tr");





    trObj.id = new Date().getTime();
    trObj.innerHTML = "<td><input type='file'/></td> <td><input/></td> <td><input/></td> <td><input type='button' value='Del' onclick='delline(this)'></td>";
    document.getElementById("upload_tb").appendChild(trObj);
}
function delline(obj) {
    console.log(222)
    var trId = obj.parentNode.parentNode.id;
    var trObj = document.getElementById(trId);
    document.getElementById("upload_tb").removeChild(trObj);
}


function closs_board() {


    console.log(document.getElementById('upload_board').style.visibility)

    if (document.getElementById('upload_board').style.visibility === "hidden") { document.getElementById('upload_board').style.setProperty('visibility', 'visible', 'important') }

    else if (document.getElementById('upload_board').style.visibility === "visible") { document.getElementById('upload_board').style.setProperty('visibility', 'hidden', 'important') }


}


function render_layer(file, zmin, zmax) {

    var data = {} //edit by xy 之前弹出错误就是因为data是undefined
    //add by xy 写死了拖的是土地利用 用土地利用图的配色方案
    var landusePaint =
    {
        'fill-color': [
            'match',
            ['get', 'DLBM'],
            '0303', '#31AD69',
            '0304', '#31AD69',
            '0306', '#64B968',
            '0402', '#83C238',
            '0603', '#0093DD',
            '1105', '#B3DEF8',
            '1106', '#B3DEF8',
            '1108', '#AFC8DC',
            '0101', '#F8D072',
            '0102', '#FCEA9E',
            '0103', '#FFFBB1',
            '0201', '#D6A7C9',
            '0202', '#D5A7B0',
            '0203', '#E7CCE2',
            '0204', '#E7CCE2',
            '0301', '#31AD69',
            '0302', '#64B968',
            '0305', '#64B968',
            '0307', '#97CFB2',
            '0401', '#83C238',
            '0403', '#9ACE7F',
            '0404', '#C8E3A0',
            '05H1', '#E2A195',
            '0508', '#C59A8C',
            '0601', '#C59A8C',
            '0602', '#C59A8C',
            '0701', '#E56766',
            '0702', '#EC898A',
            '08H1', '#F1A5B4',
            '08H2', '#F1A5B4',
            '0809', '#F1A5B4',
            '0810', '#81C35D',
            '09', '#C17261',
            '1001', '#D1C9D3',
            '1002', '#D1C9D3',
            '1003', '#D2D8C9',
            '1004', '#DEDEDD',
            '1005', '#AAA9A9',
            '1006', '#C2C1C1',
            '1007', '#EB897E',
            '1008', '#EB897E',
            '1009', '#EB897E',
            '1101', '#A3D6F5',
            '1102', '#A3D6F5',
            '1103', '#A3D6F5',
            '1104', '#90AACF',
            '1107', '#A0CDF0',
            '1109', '#E68264',
            '1110', '#D7EDFB',
            '1201', '#E1DCE1',
            '1202', '#DCB482',
            '1203', '#C8B6B2',
            '1204', '#C8CCD2',
            '1205', '#C8BEAA',
            '1206', '#D7C8B9',
            '1207', '#DEDDD6',
            /* other */ '#ccc'
        ],
        'fill-outline-color': '#111',
        'fill-opacity': 1
    }
    // var reader = new FileReader()
    // reader.readAsText(file,'utf-8');
    // reader.onload = function () {

    // data = reader.result
    // console.log(data)

    // map.addLayer({
    //     'id': file.name,
    //     'type': 'fill',
    //     'source': {
    //         'type': 'geojson',
    //         'data': data,
    //     },
    //     'paint':landusePaint,
    // })
    // }
    if (file) {
        // handle read geojson
        // Update progress
        var updateProgress = function (theFile) {
            return function (e) {
                // evt is an ProgressEvent. 100/2 as loading is ~ half the process
                if (e.lengthComputable) {
                    var percentLoaded = Math.round((e.loaded / e.total) * 50);
                    progressScreen(
                        true,
                        theFile.name,
                        percentLoaded,
                        theFile.name + " loading (" + percentLoaded + "%)"
                    );
                }
            };
        };
        // init progress bar
        var startProgress = function (theFile) {
            return function (e) {
                progressScreen(
                    true,
                    theFile.name,
                    0,
                    theFile.name + " init .. "
                );
            };
        };
        // on error, set progress to 100 (remove it)
        var errorProgress = function (theFile) {
            return function (e) {
                progressScreen(
                    true,
                    theFile.name,
                    100,
                    theFile.name + "stop .. "
                );
            };
        };

        // handle worker
        var startWorker = function (theFile) {
            return function (e) {
                // Create a worker to handle this file
                var w = new Worker("js/upload/handleReadJson.js");//edit by xy 改了路径

                // parse file content before passing to worker.
                var gJson = JSON.parse(e.target.result);

                // Message to pass to the worker
                var res = {
                    json: gJson,
                    fileName: theFile.name
                };

                // handle message received
                w.onmessage = function (e) {
                    var m = e.data;
                    if (m.progress) {
                        progressScreen(
                            true,
                            theFile.name,
                            m.progress,
                            theFile.name + ": " + m.message
                        );
                    }

                    // send alert for errors message
                    if (m.errorMessage) {
                        alert(m.errorMessage);
                    }

                    // If extent is received
                    if (m.extent) {
                        map.fitBounds(m.extent);
                    }

                    // If layer is valid and returned
                    if (m.layer) {
                        try {
                            progressScreen(
                                true,
                                theFile.name,
                                100,
                                theFile.name + " done"
                            );
                            // add source to map
                            map.addSource(m.id, {
                                "type": "geojson",
                                "data": gJson
                            });
                            // add layer
                            m.layer.paint = landusePaint;// add by xy 土地利用的颜色
                            map.addLayer(m.layer,labelLayerId);//edit by xy 改了第二个参数 在city.js中定义的全局变量
                            map.setLayerZoomRange(m.layer.id, zmin, zmax);
                            console.log(m);
                            // set progress to max
                            data[m.id] = gJson;
                        }
                        catch (err) {
                            alert(err);
                        }
                        // close worker
                        w.terminate();
                    }

                };

                // launch process
                try {
                    w.postMessage(res);
                } catch (err) {
                    alert("An error occured, quick ! check the console !");
                    console.log({
                        res: res,
                        err: err
                    });
                }
            };
        };

        var updateLayerList = function (theFile) {
            return function (e) { };
        };
        // handle drop event
        var handleDropGeojson = function (file) {
            ;
            var files = file;

            var nFiles = files.length;
            var incFile = 100 / nFiles;
            var progressBar = 0;

            // In case of multiple file, loop on them
            for (var i = 0; i < nFiles; i++) {

                f = files[i];

                // Only process geojson files. Validate later.
                if (f.name.toLowerCase().indexOf(".geojson") == -1) {
                    alert(f.name + " not supported");
                    continue;
                }
                // get a new reader
                var reader = new FileReader();
                // handle events
                reader.onloadstart = (startProgress)(f);
                reader.onprogress = (updateProgress)(f);
                reader.onerror = (errorProgress)(f);
                reader.onload = (startWorker)(f);
                reader.onloadend = (updateLayerList)(f);
                // read the geojson
                reader.readAsText(f);
            }
        };

        handleDropGeojson(file)



    } else {
        alert('The File APIs are not fully supported in this browser.');
    }



}