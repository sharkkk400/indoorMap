import os 

for a in os.listdir(os.getcwd()):
    fileName, fileExtension = os.path.splitext(a)
    # shp to geojson
    if a.endswith('.shp'):
        os.system('ogr2ogr -f "geojson" %s %s' % (fileName+'.geojson', a))
    # geojson to shp
    # if a.endswith('.geojson'):
    #     cmd='ogr2ogr -lco ENCODING=UTF-8 -f "ESRI Shapefile" %s %s' % (fileName+'.shp', a)
    #     print(cmd)
    #     os.system(cmd)

# standard code for reference: ogr2ogr -lco ENCODING=UTF-8 -f "ESRI Shapefile" "F1.shp" "F1.geojson"
# ogr2ogr -f "geojson" "F1.geojson" "F1.shp"

