import {BrowserWindow, ipcMain} from 'electron'
const childProcess = require('child_process')
import dayjs from "dayjs";
let mainWindow = BrowserWindow.getFocusedWindow()
let webContents = mainWindow.webContents

const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

ipcMain.on('get-db-info', (e, db) => {
    // let pyCmd = 'python E:\\Projects\\Pixiv_3\\tool\\get_db_info.py ' + db
    let pyCmd = `"${global.config.pixivCollectPath}" -t gdi -pt ${global.config.dbPort} -db ${global.config.dbName}`
    childProcess.exec(pyCmd, {encoding: "utf-8"}, (err, stdout) => {
        let res = stdout.split('\r\n')
        if (res[0].endsWith('not found')) {
            webContents.send('db-info', [false, stdout])
            return
        }
        let stats = JSON.parse(res[0])
        let log = JSON.parse(res[1])
        let gb = 1024 * 1024 * 1024

        stats = [
            { name: '集合:',     value: stats.collections },
            { name: '文档:',     value: Math.round(stats.documents / 1000), unit: 'K' },
            { name: '数据大小:', value: (stats.data_size / gb).toFixed(1), unit: 'GB' },
            { name: '索引大小:', value: (stats.index_size / gb).toFixed(1), unit: 'GB' },
        ]
        log = [
            { name: '模式:',     value: log.mode },
            { name: '日期:',     value: log.rank_date },
            { name: '参数:',     value: log.params },
            { name: '总插画:',   value: log.total_illust },
            { name: '实际插画:', value: log.real_illust },
            { name: '下载插画:', value: log.download_illust },
            { name: '下载图片:', value: log.download_image },
            { name: '下载动图:', value: log.download_gif },
            { name: '运行时长:', value: log.use_time, unit: 's' },
            { name: '完成时间:', value: dayjs(log.finish_time, 'YYYY-MM-DD_HH:mm:ss').format('M月D日H:mm') },
        ]
        let info = [
            { title: db, data: stats },
            { title: 'log', data: log }
        ]
        webContents.send('db-info', info)
    })
})

ipcMain.on('get-image-info', () => {
    let pyCmd = `"${global.config.pixivCollectPath}" -t ifa -p "${global.config.imageSavePath}"\\ -pb F -pt ${global.config.dbPort} -db ${global.config.dbName}`
    childProcess.exec(pyCmd, {encoding: "utf-8"}, (err, stdout) => {
        try {
            webContents.send('image-info', JSON.parse(stdout))
        } catch (SyntaxError) {
            let res = {
                illust: {album: 0, image: 0, size: 0},
                manga: {album: 0, image: 0, size: 0},
                ugoira: {album: 0, image: 0, size: 0},
            }
            webContents.send('image-info', res)
        }
    })
    // let res = {
    //     illust: {album: 13771 + Math.ceil(Math.random()*1000), image: 53868, size: 86685959026},
    //     manga: {album: 1357 + Math.ceil(Math.random()*1000), image: 12258, size: 15736811602},
    //     ugoira: {album: 1595, image: 92900, size: 8752963990},
    // }
    // setTimeout(() => {
    //     webContents.send('image-info', res)
    // }, 3000)
})

ipcMain.handle('get-func-open', (event, name) => {
    return new Promise((resolve) => {
        resolve(global.config[name])
    })
})


