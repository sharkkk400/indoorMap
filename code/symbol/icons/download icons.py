# -*- coding: UTF-8 -*-
# 根据百度地图给出的icon列表下载所有的室内地图icon

import urllib
# import requests
import json
import os

downloadedIcons={}
for file in os.listdir(os.getcwd()):
    fileName, fileExtension = os.path.splitext(file)
    if fileExtension=='.png':
        downloadedIcons[fileName]=0
print "已下载："+str(len(downloadedIcons))

with open("indoor icon list.json",'r') as load_f:
    iconList = json.load(load_f)
    count = 0
    for key in iconList:
        iconName = iconList[key][2]
        fileName = iconName+'.png'

        if iconName in downloadedIcons:
            downloadedIcons[iconName]=downloadedIcons[iconName]+1
        else:
            print fileName+" not found"

        # download icons
        # url = 'https://ss0.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/sty/map_icons2x/'+fileName
        # urllib.urlretrieve(url, fileName)
        # print "downloaded "+fileName
        #
        # count+=1
    print downloadedIcons

    for key,value in downloadedIcons.items():
        count+=value
    print "包含重复的共下载了："+str(count)
    #结果表明，共下载了319个icon，百度提供的列表共列出346个，部分是重复的，只有一个是无法下载的

