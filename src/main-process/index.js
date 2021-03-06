import { ipcMain, BrowserWindow, dialog } from 'electron'
const request = require('request')
const childProcess = require('child_process')
const fs = require('fs')
// const path = require('path')

let mainWindow = BrowserWindow.getFocusedWindow()
let webContents = mainWindow.webContents
// global.proxy = null
// global.userDataPath = app.getPath("userData")
//
// global.appPath = path.resolve()
// global.configPath = path.resolve('config', 'config.json')
// global.collectModePresetPath = path.resolve('config', 'collectModePreset.json')

let isConnectPixiv = false

pixivConnectTest()
setInterval(pixivConnectTest, 120000)

function pixivConnectTest() {
    updateProxyServer().then(() => {
        let params = {url: 'https://www.pixiv.net/', timeout: 2000}
        global.proxy ? params.proxy = 'http://' + global.proxy : {}
        request(params, (error, response) => {
            if (error || !response || (!error && response.statusCode !== 200)) {
                isConnectPixiv ? connectChange() : {}
            } else if (response.statusCode === 200 && !isConnectPixiv) {
                connectChange()
            }
        })
    })
}
function updateProxyServer() {
    return new Promise((resolve) => {
        childProcess.exec('whoami /user | find "S-"', (err, res) => {
            if (err) {
                global.proxy = null
                resolve()
                return
            }
            let sid = res.trim().split(/\s+/)[1]
            let command = 'REG QUERY "HKU\\' + sid +
                '\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" ' + '| findstr "Proxy[ES]"'
            childProcess.exec(command, (error, res) => {
                res = res.trim().split(/\s+/)
                if (res[2] === '0x0' || res.length <= 3) {
                    global.proxy = null
                } else {
                    global.proxy = res[5]
                }
                resolve()
            })
        })
    })
}

function connectChange() {
    isConnectPixiv = !isConnectPixiv
    webContents.send('return-pixiv-connect', isConnectPixiv)
}

ipcMain.on('pixiv-connect-test', () => {
    pixivConnectTest()
})

ipcMain.on('get-pixiv-connect', () => {
    webContents.send('return-pixiv-connect', isConnectPixiv)
})

// todo ?????????????????? ??????????????????
ipcMain.on('user-minimize', () => {
    mainWindow.minimize()
})
ipcMain.on('user-maximize', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
})

ipcMain.on('user-close', () => {
    mainWindow.close()
})

ipcMain.handle('open-save-dialog', (e, data) => {
    let illust_id = data[0]
    let images = data[1]
    let isGif = data[2] === 'gif'
    let defaultPath = isGif ? `${illust_id}` : ''
    let filtersName = isGif ? `?????? ${images.length}??? ????????????` : `?????? ${images.length}??? ';'????????????,???????????????`
    if (!isGif) {
        images.forEach(v => defaultPath += v.name + ';')
    }
    let options = {
        title: (isGif ? 'GIF ': '') + `id: ${illust_id} ?????????`,
        defaultPath: defaultPath,
        filters: [{ name: filtersName, extensions: [] }],
    }
    return new Promise((resolve, reject) => {
        dialog.showSaveDialog(options).then(result => {
            if (result.filePath) {
                isGif ? gifDir(result.filePath, images, resolve) : saveImage (result.filePath, images, resolve)
            } else {
                resolve([false, '??????'])
            }
        }).catch(err => {
            console.log(err)
            reject(err)
        })
    })
})

function gifDir (filePath, images, resolve) {
    let path = filePath.split('\\')
    if (path[path.length - 1] === path[path.length - 2]) {
        path.pop()
    }
    path = path.join('\\')
    fs.access(path, err => {
        if (err) {
            fs.mkdir(path, err => {
                if (err) {
                    console.log(err)
                    resolve([false, '??????????????????'])
                    return
                }
                saveGifImage(path, images, resolve)
            })
        } else {
            saveGifImage(path, images, resolve)
        }
    })
}

function saveGifImage (path, images, resolve) {
    let cnt = 0
    for (let i = 0; i < images.length; i++) {
        fs.writeFile(`${path}\\${images[i].name}`, images[i].file, err => {
            if (err) {
                resolve([false, '????????????'])
                return
            }
            if (++cnt === images.length) {
                resolve([true, '????????????'])
            }
        })
    }
}


function saveImage (filePath, images, resolve) {
    let index = filePath.lastIndexOf('\\') + 1
    let path = filePath.slice(0, index)
    let nameList = filePath.slice(index).split(';')
    if (nameList[nameList.length - 1] === '') nameList.pop()

    let str = ''
    for (let i = 0; i < nameList.length; i++) {
        if (nameList[i] !== '') {
            if (str.indexOf(nameList[i]) !== -1) {
                resolve([false, '???????????????'])
                return
            } else {
                str += `!${nameList[i]}`
            }
        }
    }

    let cnt = 0
    for (let i = 0; i < nameList.length; i++) {
        if (nameList[i] !== '') {
            fs.writeFile(path + nameList[i], images[i].file, err => {
                if (err) {
                    resolve([false, '????????????'])
                    return
                }
                if (++cnt === nameList.length) {
                    resolve([true, '????????????'])
                }
            })
        } else {
            cnt++
        }
    }
}

