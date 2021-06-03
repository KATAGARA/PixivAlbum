import {BrowserWindow, dialog, ipcMain, shell, clipboard} from 'electron'

const fs = require('fs')
const childProcess = require('child_process')
let mainWindow = BrowserWindow.getFocusedWindow()
let webContents = mainWindow.webContents
const diskInfo = require('diskinfo')
const path = require('path')
const mongoose = require('mongoose')

let moveImageIsRun = false

// global.config = undefined
// global.imageReadPathList = undefined

// getConfig()

ipcMain.on('get-config', () => {
    webContents.send('return-config', global.config)
})

ipcMain.on('get-available-size', () => {
    getSize()
})


ipcMain.handle('alter-config', (event, params) => {
    return new Promise((resolve) => {
        if (params.key === 'dbName' && params.value === global.config.dbName) {
            resolve([true, params.key, params.value, '未更改'])
        } else {
            writeConfig(resolve, params.key, params.value, params.operate)
        }
    })
})

ipcMain.handle('alter-cookie', () => {
    return new Promise((resolve) => {
        let cookiePath = path.join(path.dirname(global.config.pixivCollectPath), 'cookie.txt')
        fs.access(cookiePath, err => {
            if (err) resolve(false)
            else {
                fs.writeFile(cookiePath, clipboard.readText(), err => {
                    if (err) {
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                })
            }
        })
    })
})

ipcMain.handle('open-show-open-dialog', (e, params) => {
    return new Promise((resolve) => {
        let options = undefined
        if (params.key === 'imageSavePath') {
            options = {
                title: '选择图片保存目录',
                defaultPath: global.config.imageSavePath,
                properties: ['openDirectory'],
            }
        } else if (params.key === 'imageReadPathList') {
            let len = global.config.imageReadPathList.length
            let defaultPath = len === 0 ? global.config.imageSavePath : global.config.imageReadPathList[len - 1]
            options = {
                title: '选择图片读取目录',
                defaultPath: defaultPath,
                properties: ['openDirectory'],
            }
        } else if (params.key === 'pixivCollectPath') {
            options = {
                title: 'PixivCollect文件选择',
                defaultPath: global.config.pixivCollectPath,
                filters: [{ name: 'Python可执行文件', extensions: ['exe'] }],
                properties: ['openFile'],
            }
        } else {
            resolve([false, '参数错误'])
            return
        }
        dialog.showOpenDialog(options).then(result => {
            if (result.filePaths.length === 1) {
                let filePath = result.filePaths[0]
                if (filePath === global.config[params.key] ||
                    (params.key === 'imageReadPathList' &&
                        (global.config[params.key].indexOf(filePath) !== -1) || filePath === global.config.imageSavePath)) {
                    resolve([true, params.key, global.config[params.key], '未更改'])
                    return
                }
                writeConfig(resolve, params.key, filePath, params.operate)
            } else {
                resolve([false, params.key, global.config[params.key], '取消'])
            }
        })
    })
})

ipcMain.on('open-path', (e, msg) => {
    if (msg === 'pixivCollectPath') {
        shell.showItemInFolder(global.config.pixivCollectPath)
    } else if (msg === 'configPath') {
        shell.showItemInFolder(global.configPath)
    }
})

ipcMain.handle('open-cookie-file', () => {
    return new Promise((resolve) => {
        let cookiePath = path.join(path.dirname(global.config.pixivCollectPath), 'cookie.txt')
        fs.access(cookiePath, err => {
            if (err) resolve(false)
            else {
                shell.openPath(cookiePath)
                    .then(() => resolve(true))
                    .catch(() => resolve(false))
            }
        })
    })
})

ipcMain.on('move-image-is-run', () => {
    webContents.send('return-move-image-is-run', moveImageIsRun)
})

ipcMain.handle('move-image', (e, params) => {
    let pyCmd = `${global.config.pixivCollectPath} -t im --src ${params.src} --tra ${params.tra} -m ${params.mode} ` +
        `-md ${params.date} -pb F -pt ${global.config.dbPort} -db ${global.config.dbName}`
    moveImageIsRun = true
    webContents.send('return-move-image-is-run', true)
    return new Promise((resolve) => {
        childProcess.exec(pyCmd, {encoding: "utf-8"}, (err) => {
            moveImageIsRun = false
            resolve(!err)
            webContents.send('return-move-image-is-run', false)
        })
    })
})

function writeConfig (resolve, key, value, operate) {
    let lastValue = deepCopyT(global.config[key])
    if (operate === undefined) {
        global.config[key] = value
    } else if (operate === 'add') {
        global.config[key].push(value)
    } else if (operate === 'del') {
        global.config[key].splice(global.config[key].indexOf(value), 1)
    } else {
        resolve([false, key, lastValue, '参数错误'])
        return
    }
    fs.writeFile(global.configPath, JSON.stringify(global.config, null, 4), err => {
        if (err) {
            global.config[key] = lastValue
            resolve([false, key, lastValue, '保存错误'])
        } else {
            if (key === 'imageSavePath') {
                global.imageReadPathList[0] = value
                if (lastValue.split(':')[0] !== value.split(':')[0]) getSize()
            } else if (key === 'imageReadPathList') {
                global.imageReadPathList = [global.config.imageSavePath].concat(global.config.imageReadPathList)
            } else if (key === 'dbName') {
                mongoose.connect(`mongodb://localhost:${global.config.dbPort}/${global.config.dbName}`)
            }
            resolve([true, key, global.config[key]])
        }
    })
}

function getSize () {
    let mounted = global.config.imageSavePath.split(':')[0] + ':'
    diskInfo.getDrives(function(err, aDrives) {
        for (let i = 0; i < aDrives.length; i++) {
            if (aDrives[i].mounted === mounted) {
                let total = (aDrives[i].blocks / 1024 / 1024 / 1024).toFixed(0)
                let available = (aDrives[i].available / 1024 / 1024 / 1024).toFixed(0)
                let capacity = aDrives[i].capacity
                webContents.send('return-available-size', [available, total, capacity])
            }
        }
    })
}

// eslint-disable-next-line no-unused-vars
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
                        global.imageReadPathList = [global.config.imageSavePath].concat(global.config.imageReadPathList)
                        getSize()
                        webContents.send('return-config', options)
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
    if (options === undefined || options.length === 6) {
        options = {
            imageSavePath: await getDefaultImageSavePath(),
            imageReadPathList: [],
            processNumber: [1, 5, 10],
            imageAnalyseOpen: true,
            dbInfoOpen: true,
            pixivCollectPath: path.join(global.appPath, 'collect/pixiv_collect.exe'),
            dbName: 'Pixiv'
        }
    } else {
        if (errorOption.indexOf('imageSavePath') !== -1) options.imageSavePath = await getDefaultImageSavePath()
        if (errorOption.indexOf('imageReadPathList') !== -1) options.imageReadPathList = []
        if (errorOption.indexOf('processNumber') !== -1) options.processNumber = [1, 5, 10]
        if (errorOption.indexOf('imageAnalyseOpen') !== -1) options.imageAnalyseOpen = true
        if (errorOption.indexOf('dbInfoOpen') !== -1) options.dbInfoOpen = true
        if (errorOption.indexOf('pixivCollectPath') !== -1)
            options.pixivCollectPath = path.join(global.appPath, 'collect/pixiv_collect.exe')
        if (errorOption.indexOf('dbName') !== -1) options.dbName = 'Pixiv'
    }

    fs.writeFile(global.configPath, JSON.stringify(options, null, 4), err => {
        if (err) {
            console.log(err)
        } else {
            global.config = options
            global.imageReadPathList = [global.config.imageSavePath].concat(global.config.imageReadPathList)
            getSize()
            webContents.send('return-config', options)
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
    return res
}

function deepCopyT (data) {
    return JSON.parse(JSON.stringify(data))
}
