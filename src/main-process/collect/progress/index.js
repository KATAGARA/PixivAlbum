import {BrowserWindow, ipcMain} from 'electron'
const childProcess = require('child_process')

const fs = require('fs')
let mainWindow = BrowserWindow.getFocusedWindow()
let webContents = mainWindow.webContents
import dayjs from "dayjs";

let collectModePresets = undefined

let count = {
    list: [0, 0],
    illust: [0, 0],
    image: [0, 0]
}
let isDone = [false, false, false]
let isRun = false
let taskList = []

taskRun()

function taskRun () {
    if (taskList.length === 0) {
        setTimeout(() => {
            taskRun()
        }, 5000)
        return
    }
    let task = deepCopyT(taskList[0])
    let collectParams = ['-t', 'pc', '-d', task.dateList[0], '-pa', JSON.stringify(task.params), '-p', global.config.imageSavePath + '\\', '-pb', 'F',
        '-wr', task.waitRank ? 'T' : 'F', '-pt', global.config.dbPort, '-db', global.config.dbName, '-pn', JSON.stringify(global.config.processNumber)]

    count = { list: [0, 0], illust: [0, 0], image: [0, 0] }
    isDone = [false, false, false]
    isRun = true
    taskList[0].run = true
    webContents.send('is-run', [isRun, count, isDone])
    webContents.send('task-msg', taskList)

    let process = childProcess.spawn(global.config.pixivCollectPath, collectParams)
    process.stdout.setEncoding('utf-8')
    process.stdout.on('data', data => {
        let msgList = data.split('\r\n')
        for (let i = 0; i < msgList.length; i++) {
            let msg = msgList[i]
            switch (msg) {
                case '+dim':
                case '+diz':
                    count.image[1] += 1
                    webContents.send('image-msg', count.image)
                    break
                case '-dim':
                    count.image[0] += 1
                    webContents.send('image-msg', count.image)
                    break
                case '+ril':
                    count.illust[1] += 1
                    webContents.send('illust-msg', count.illust)
                    break
                case '-ril':
                    count.illust[0] += 1
                    webContents.send('illust-msg',  count.illust)
                    break
                case '-l':
                    count.list[0] += 1
                    webContents.send('list-msg', count.list)
                    break
                case 'list-done':
                    isDone[0] = true
                    webContents.send('done-msg', 'list')
                    break
                case 'illust-done':
                    isDone[1] = true
                    webContents.send('done-msg', 'illust')
                    break
                case 'image-done':
                    isDone[2] = true
                    webContents.send('done-msg', 'image')
                    break
                case '':
                    break
                default:
                    if (msg.startsWith('list')) {
                        count.list[1] = Number(msg.slice(4))
                        webContents.send('list-msg', count.list)
                    }
            }
        }
    })
    process.stderr.on('data', data => {
        console.log('stderr: ' + data)
        doneAndRunNextTask()
    })
    process.on('close', code => {
        console.log(`子进程退出，退出码: ${code}`)
        doneAndRunNextTask()
    })
    process.on('error', code => {
        console.log(`子进程错误，错误码: ${code}`)
        doneAndRunNextTask()
    })
}

function doneAndRunNextTask () {
    isRun = false
    webContents.send('is-run', [isRun, count, isDone])
    taskList[0].dateList.length > 1 ? taskList[0].dateList.shift() : taskList.shift()
    webContents.send('task-msg', taskList)
    setTimeout(() => {
        taskRun()
    }, 5000)
}

ipcMain.on('pixiv-collect-is-run', () => {
    webContents.send('is-run', [isRun, count, isDone])
})
ipcMain.on('get-task-list', () => {
    webContents.send('task-msg', taskList)
})

ipcMain.on('add-task', (e, data) => {
    let nameList = []
    taskList.map(v => nameList.push(v.name))
    let name = getName(nameList, data.taskName)
    let dateList = [Number(data.date[0])]

    let day = data.date[0]
    while (day !== data.date[1]) {
        day = dayjs(day).add(1, 'day').format('YYYYMMDD')
        dateList.push(Number(day))
    }
    let params = getCollectParams(data.mode, data.overallExclude)
    taskList.push({name: name, params: params, dateList: dateList, waitRank: data.waitRank})
    webContents.send('task-msg', taskList)
})

ipcMain.on('task-cancel', (e, data) => {
    for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].name === data.name && taskList[i].date === data.date) {
            taskList.splice(i, 1)
            break
        }
    }
    webContents.send('task-msg', taskList)
})

ipcMain.on('get-mode-preset', () => {
    fs.access(global.collectModePresetPath, err => {
        if (err) {
            defaultCollectModePreset()
        } else {
            fs.readFile(global.collectModePresetPath, {encoding: "utf-8"}, (error, data) => {
                try {
                    let preset = JSON.parse(data)
                    collectModePresets = preset
                    webContents.send('return-mode-preset', preset)
                } catch (SyntaxError) {
                    defaultCollectModePreset()
                }
            })
        }
    })
})

function defaultCollectModePreset () {
    let preset = [
        {
            "name": "default",
            "comment": "default",
            "modeValue": [
                [
                    [[true, false], true, true, false],
                    [[true, false], true, true, true],
                    [[true, false], true, false, false],
                    [[true, false], true, false, false],
                    [[true, false], true, false, false],
                    [[true, false], true, true, false],
                    [[false, true], true, true, false],
                ], [
                    [[true, false], true, true, false],
                    [[true, false], true, true, true],
                    [[true, false], true, false, false],
                    [[true, false], true, false, false],
                ], [
                    [[true, false], true, true, false],
                    [[true, false], true, true, false],
                ], [
                    [[false, true], true, true, false],
                    [[false, true], true, true, true],
                    [[false, true], true, false, false],
                    [[false, true], true, false, false],
                ]
            ],
            "overallExclude": [
                [false, false, false],
                [false, false, false],
                [false, false, false],
                [false, false, true],
                [false, false, false],
                [false, false, true],
                [false, false, false],
            ],
        }
    ]
    fs.writeFile(global.collectModePresetPath, JSON.stringify(preset, null, 4), err => {
        if (err) {
            console.log(err)
        } else {
            collectModePresets = preset
            webContents.send('return-mode-preset', preset)
        }
    })
}

ipcMain.on('update-mode-preset', (e, params) => {
    let preset = deepCopyT(collectModePresets)
    let rtn = undefined
    if (params.operate === 'del') {
        rtn = params.name
        preset.splice(preset.findIndex(v => v.name === params.name), 1)
    } else if (params.operate === 'change') {
        preset[preset.findIndex(v => v.name === params.name)].comment = params.comment
    } else if (params.operate === 'add') {
        let nameList = []
        preset.map(v => nameList.push(v.name))
        rtn = {
            name: getName(nameList, params.name),
            comment: '',
            modeValue: params.modeValue,
            overallExclude: params.overallExclude
        }
        preset.push(rtn)
    }
    fs.writeFile(global.collectModePresetPath, JSON.stringify(preset, null, 4), err => {
        if (err) {
            webContents.send('return-update-mode-preset', [false, params.operate, '保存错误'])
        } else {
            collectModePresets = preset
            webContents.send('return-update-mode-preset', [true, params.operate, rtn])
        }
    })
})

function getCollectParams (modeValue, overallExclude) {
    let modeList = []
    let i_t = ['overall', 'illust', 'ugoira', 'manga']
    let j_t = ['daily', 'weekly', 'monthly', 'rookie', 'original', 'male', 'female']
    for (let i = 0; i < modeValue.length; i++) {
        for (let j = 0; j < modeValue[i].length; j++) {
            let value = modeValue[i][j]
            let save = value[0][0] === true ? 1 : (value[0][1] === true ? 0 : -1)
            if (save !== -1) {
                let a = []
                if (value[1]) a.push('')
                if (value[2]) a.push('r18')
                if (value[3]) a.push('r18g')
                let mode = [i_t[i], j_t[j], a, save]
                if (i === 0) {
                    let exclude = []
                    overallExclude[j].forEach((v, index) => overallExclude[j][index] ? exclude.push(i_t[index + 1]) : {})
                    exclude.length !== 0 ? mode.push(exclude) : {}
                }
                modeList.push(mode)
            }
        }
    }
    return modeList
}

function sortNameList (x, y) {
    let x_t = x.split('-')
    let y_t = y.split('-')

    if (x_t.length === 1 || y_t.length === 1 || x_t[0] !== y_t[0]) {
        if (x < y) return -1
        if (x > y) return 1
        return 0
    } else {
        let x_n = Number(x_t[1])
        let y_n = Number(y_t[1])
        if (x_n < y_n) return -1
        if (x_n > y_n) return 1
        return 0
    }
}

function getName (nameList, name) {
    nameList.sort(sortNameList)
    for (let i = 0; i < nameList.length; i++) {
        if (nameList[i] === name) {
            let t_t = nameList[i].split('-')
            let n_t = name.split('-')
            if (t_t.length === 1 || t_t[1] === '' || isNaN(Number(t_t[1]))) {
                name = name + '-1'
            } else {
                name = `${n_t[0]}-${Number(n_t[1]) + 1}`
            }
        }
    }
    return name
}

function deepCopyT (data) {
    return JSON.parse(JSON.stringify(data))
}
