// mapbox gl init
mapboxgl.accessToken = 'pk.eyJ1IjoidW5lcGdyaWQiLCJhIjoiY2lzZnowenUwMDAzdjJubzZyZ3R1bjIzZyJ9.uyP-RWjY-94qCVajU0u8KA';
var map = window.map = new mapboxgl.Map({
    container: 'map',
    zoom: 15.4,
    center: [114.33280771545384, 30.55882902416495],
    bearing: 80,
    pitch: 60,
    style: 'mapbox://styles/mapbox/streets-v11?optimize=true',//'mapbox://styles/arslxy/cjqly7jm000eq2ro676n5s68d',//用去掉建筑的底图
    hash: true,
    visualizePitch:true,
    antialias:true,//mapbox新功能，室内地图显示效果明显更细腻了
});
// var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/dark-v9',
//     center: [-14.66,-23.64],
//     zoom: 3
// });

// object to hold geojson
var data = {};

//add by xy 写死了拖的是土地利用 用土地利用图的配色方案
var landusePaint =
{
    'fill-color': [
        'match',
        ['get', 'DLBM'],
        '0303', '#31AD69',
        '0304',	'#31AD69',
        '0306',	'#64B968',
        '0402',	'#83C238',
        '0603',	'#0093DD',
        '1105',	'#B3DEF8',
        '1106',	'#B3DEF8',
        '1108',	'#AFC8DC',
        '0101',	'#F8D072',
        '0102',	'#FCEA9E',
        '0103',	'#FFFBB1',
        '0201',	'#D6A7C9',
        '0202',	'#D5A7B0',
        '0203',	'#E7CCE2',
        '0204',	'#E7CCE2',
        '0301',	'#31AD69',
        '0302',	'#64B968',
        '0305',	'#64B968',
        '0307',	'#97CFB2',
        '0401',	'#83C238',
        '0403',	'#9ACE7F',
        '0404',	'#C8E3A0',
        '05H1',	'#E2A195',
        '0508',	'#C59A8C',
        '0601',	'#C59A8C',
        '0602',	'#C59A8C',
        '0701',	'#E56766',
        '0702',	'#EC898A',
        '08H1',	'#F1A5B4',
        '08H2',	'#F1A5B4',
        '0809',	'#F1A5B4',
        '0810',	'#81C35D',
        '09',	'#C17261',
        '1001',	'#D1C9D3',
        '1002',	'#D1C9D3',
        '1003',	'#D2D8C9',
        '1004',	'#DEDEDD',
        '1005',	'#AAA9A9',
        '1006',	'#C2C1C1',
        '1007',	'#EB897E',
        '1008',	'#EB897E',
        '1009',	'#EB897E',
        '1101',	'#A3D6F5',
        '1102',	'#A3D6F5',
        '1103',	'#A3D6F5',
        '1104',	'#90AACF',
        '1107',	'#A0CDF0',
        '1109',	'#E68264',
        '1110',	'#D7EDFB',
        '1201',	'#E1DCE1',
        '1202',	'#DCB482',
        '1203',	'#C8B6B2',
        '1204',	'#C8CCD2',
        '1205',	'#C8BEAA',
        '1206',	'#D7C8B9',
        '1207',	'#DEDDD6',
        /* other */ '#ccc'
    ],
    'fill-outline-color': '#111',
    'fill-opacity': 0.8
}

// test if file api is available
if (window.File && window.FileReader && window.FileList && window.Blob) {


    // handle read geojson
    // Update progress
    var updateProgress = function(theFile) {
        return function(e) {
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
    var startProgress = function(theFile) {
        return function(e) {
            progressScreen(
                true,
                theFile.name,
                0,
                theFile.name + " init .. "
            );
        };
    };
    // on error, set progress to 100 (remove it)
    var errorProgress = function(theFile) {
        return function(e) {
            progressScreen(
                true,
                theFile.name,
                100,
                theFile.name + "stop .. "
            );
        };
    };

    // handle worker
    var startWorker = function(theFile) {
        return function(e) {
            // Create a worker to handle this file
            var w = new Worker("handleReadJson.js");

            // parse file content before passing to worker.
            var gJson = JSON.parse(e.target.result);

            // Message to pass to the worker
            var res = {
                json: gJson,
                fileName: theFile.name
            };

            // handle message received
            w.onmessage = function(e) {
                var m = e.data;
                if ( m.progress ) {
                    progressScreen(
                        true,
                        theFile.name,
                        m.progress,
                        theFile.name + ": " + m.message
                    );
                }

               // send alert for errors message
                if( m.errorMessage ){
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
                    m.layer.paint=landusePaint;// add by xy 土地利用的颜色
                    map.addLayer(m.layer,labelLayerId);//edit by xy 改了第二个参数 在city.js中定义的全局变量
                    console.log(m);
                    // set progress to max
                    data[m.id] = gJson;
                  }
                  catch(err){
                    alert(err);
                  }
                  // close worker
                   w.terminate();
                }

            };

            // launch process
            try {
            w.postMessage(res);
            }catch(err){
              alert("An error occured, quick ! check the console !");
              console.log({
                res : res,
                err : err
              });
            }
        };
    };

    var updateLayerList = function(theFile) {
        return function(e) {};
    };
    // handle drop event
    var handleDropGeojson = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files;

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
    var handleDragOver = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    };

    // Set events
    mapEl = document.getElementById("map");
    mapEl.addEventListener('dragover', handleDragOver, false);
    mapEl.addEventListener('drop', handleDropGeojson, false);


} else {
    alert('The File APIs are not fully supported in this browser.');
}
