//临时这样

import {app} from "electron";

const fs = require('fs')
const diskInfo = require('diskinfo')
const path = require('path')

global.config = undefined
global.imageReadPathList = undefined
global.proxy = null
global.userDataPath = app.getPath("userData")

global.appPath = path.resolve()
if (app.isPackaged) {
    global.configPath = path.resolve('config', 'config.json')
    global.collectModePresetPath = path.resolve('config', 'collectModePreset.json')
    global.collectDir = path.resolve('collect')
} else {
    global.configPath = path.resolve('config_dev', 'config.json')
    global.collectModePresetPath = path.resolve('config_dev', 'collectModePreset.json')
    global.collectDir = path.resolve('collect_dev')
}


getConfig()

function getConfig () {
    fs.access(global.configPath, err => {
        if (err) {
            defaultSetting().then()
        } else {
            fs.readFile(global.configPath, {encoding: "utf-8"}, (error, data) => {
                try {
                    let options = JSON.parse(data)
                    let errorOptions = checkConfig(options)
                    if (errorOptions.length === 0) {
                        global.config = options
                        require('mongoose').connect(`mongodb://localhost:${global.config.dbPort}/${global.config.dbName}`)
                        global.imageReadPathList = [global.config.imageSavePath].concat(global.config.imageReadPathList)
                    } else {
                        defaultSetting(options, errorOptions).then()
                    }
                } catch (SyntaxError) {
                    defaultSetting().then()
                }
            })
        }
    })
}

async function defaultSetting (options, errorOption) {
    if (options === undefined || options.length === 8) {
        options = {
            imageSavePath: await getDefaultImageSavePath(),
            imageReadPathList: [],
            processNumber: [1, 5, 10],
            imageAnalyseOpen: true,
            dbInfoOpen: true,
            pixivCollectPath: path.join(global.collectDir, 'pixiv_collect.exe'),
            dbName: 'Pixiv',
            dbPort: 27017,
        }
    } else {
        if (errorOption.indexOf('imageSavePath') !== -1) options.imageSavePath = await getDefaultImageSavePath()
        if (errorOption.indexOf('imageReadPathList') !== -1) options.imageReadPathList = []
        if (errorOption.indexOf('processNumber') !== -1) options.processNumber = [1, 5, 10]
        if (errorOption.indexOf('imageAnalyseOpen') !== -1) options.imageAnalyseOpen = true
        if (errorOption.indexOf('dbInfoOpen') !== -1) options.dbInfoOpen = true
        if (errorOption.indexOf('pixivCollectPath') !== -1)
            options.pixivCollectPath = path.join(global.collectDir, 'pixiv_collect.exe')
        if (errorOption.indexOf('dbName') !== -1) options.dbName = 'Pixiv'
        if (errorOption.indexOf('dbPort') !== -1) options.dbPort = 27017
    }

    fs.writeFile(global.configPath, JSON.stringify(options, null, 4), err => {
        if (err) {
            console.log(err)
        } else {
            global.config = options
            require('mongoose').connect(`mongodb://localhost:${global.config.dbPort}/${global.config.dbName}`)
            global.imageReadPathList = [global.config.imageSavePath].concat(global.config.imageReadPathList)
        }
    })
}

function getDefaultImageSavePath () {
    return new Promise(function (resolve) {
        diskInfo.getDrives(function(err, aDrives) {
            let maxAvailable = -1
            let mounted = ''
            if (err) {
                mounted = 'C:'
            } else {
                for (let i = 0; i < aDrives.length; i++) {
                    if (aDrives[i].available > maxAvailable) {
                        maxAvailable = aDrives[i].available
                        mounted = aDrives[i].mounted
                    }
                }
            }
            resolve(mounted + '\\Pixiv')
        })
    })
}

function checkConfig (options) {
    let res = []
    let reg = new RegExp(/^[A-z]:\\{1,2}(.+?\\{0,2})*$/)
    if (!(typeof options.imageSavePath === 'string' && reg.test(options.imageSavePath))) res.push('imageSavePath')
    if (!options.imageReadPathList.every(v => typeof v === 'string' && reg.test(v))) res.push('imageReadPathList')
    if (!options.processNumber.every(v => typeof v === 'number' && v >= 1 && v <= 99)) res.push('processNumber')
    if (typeof options.imageAnalyseOpen !== 'boolean') res.push('imageAnalyseOpen')
    if (typeof options.dbInfoOpen !== 'boolean') res.push('dbInfoOpen')
    if (!reg.test(options.pixivCollectPath)) res.push('pixivCollectPath')
    if (typeof options.dbName !== 'string' || options.dbName.length > 15 || options.dbName.length < 1) res.push('dbName')
    if (typeof options.dbPort !== 'number' || options.dbPort % 1 !== 0 || options.dbPort > 49151 || options.dbPort < 1024) res.push('dbPort')
    return res
}
