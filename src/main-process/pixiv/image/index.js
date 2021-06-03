import { ipcMain, shell } from 'electron';
const fs = require('fs')
const request = require('request')
const path = require('path')

let USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.3 ' +
    '(KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36'



/**
 * @params [illust_id[must], url_original, page]
 * file_name eg: 80001_p0.jpg
 * url_original eg: https://tc-pximg01.techorus-cdn.com/img-original/img/2007/10/14/02/26/39/80001_p0.jpg
 * @return 存在文件返回 图片二进制流
 *         不存在返回 null
 */
ipcMain.handle('get-image', (event, imageName) => {
    // page传入undefined时, 值位0
    // console.log(imageName)
    return getImage(imageName)
})

// eslint-disable-next-line no-unused-vars
// function getImageHistory(illust_id, url_original, page=0) {
//     // url_original是否为空
//     if (url_original) {
//         return new Promise((resolve, reject) => {
//             // 通过url文件后缀名
//             let fileName = illust_id + '_p' + page + '.' + url_original.split('.').slice(-1)
//             let filePath = illustExistsByName(fileName, page)
//             if (!filePath) {
//                 filePath = illustExistsByID(illust_id, page)
//             }
//             returnImageBuffer(filePath, resolve, reject)
//         })
//     } else {
//         return new Promise((resolve, reject) => {
//             let filePath = illustExistsByID(illust_id, page)
//             returnImageBuffer(filePath, resolve, reject)
//         })
//     }
// }

async function getImage(image_name) {
    return new Promise((resolve, reject) => {
        illustExistsByName(image_name).then(filePaths => {
            let filePath = filePaths.find(v => v !== null)
            filePath ? returnImageBuffer(filePath, resolve, reject) : resolve(null)
        })
    })
}


//未完成
ipcMain.handle('get-image-by-name-list', (event, nameList) => {
    // page传入undefined时, 值位0
    const promises = nameList.map(imageName => {
        return getImage(imageName)
    })
    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
})

/**
 * @params [illust_id[must], url_original[must], page_count[must]]
 * 获取illust_id的指定张数的图片
 * page_count 需要返回的图片张数p0~p(page_count-1)
 * @return 存在文件返回 图片二进制流 列表. 如果p(n)不存在, 那项为null
 *         eg: [Buffer, null, Buffer, ......]
 */
ipcMain.handle('get-illust-all-image', (event, params) => {
    let slice_start = 0
    if (params[1] !== undefined) {
        slice_start = params[1] + 1
    }
    // console.log(params)
    const promises = [...new Array(params[0].length).keys()].slice(slice_start).map(page => {
        return getImage(params[0][page].name)
    })
    return new Promise((resolve, reject) => {
        // 把promises列表包装成一个新的 Promise 实例
        Promise.all(promises)
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
})



/**
 * 获取传送illusts列表的所有p0图片, 设定为RankList服务
 * @param illusts eg: { illust:{}, rank: {}} 同: api -> pixiv -> mongodb -> query.js -> getRankWithIllust -> return
 * @return 同上
 */
ipcMain.handle('get-rank-list-image', (event, illusts) => {
    let have_info = Object.keys(illusts[0]).indexOf('illust') !== -1
    const promises = illusts.map(illust => {
        return getImage(illust.illust.illust_id, have_info ? illust.illust.url_original : undefined)
    })
    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
})

ipcMain.handle('open-file', (event, name) => {
    return new Promise((resolve) => {
        illustExistsByName(name).then(filePath => {
            if (filePath) {
                shell.openPath(filePath)
                    .then(() => resolve(true))
                    .catch(() => resolve(false))
            } else {
                resolve(false)
            }
        })
        // let filePath = illustExistsByName
        // if (filePath) {
        //     fs.access(filePath, err => {
        //         if (err) resolve(false)
        //         else {
        //             shell.openPath(filePath)
        //                 .then(() => resolve(true))
        //                 .catch(() => resolve(false))
        //         }
        //     })
        // } else {
        //     resolve(false)
        // }
    })
})


/**
 * 返回文件路径或null
 * @return null 或 eg: E:/Pixiv/illust/80001_p0.jpg
 */
// function illustExistsByID(illust_id, page) {
//     let name = illust_id + '_p' + page
//     let fileName = [name + '.jpg', name + '.png', name + '.gif']
//     for (let i = 0; i < global.imageReadPathList.length; i++) {
//         for (let j = 0; j < fileName.length; j++) {
//             let filePath = path.join(global.imageReadPathList[i], fileName[j])
//             if (fs.existsSync(filePath))
//                 return filePath
//         }
//     }
//     return null
// }

/** 同上 */
function illustExistsByName(illust_name) {
    const promises = global.imageReadPathList.map(readPath => {
        return new Promise((resolve) => {
            let filePath = path.join(readPath, illust_name)
            fs.access(filePath, err => {
                err ? resolve(null) : resolve(filePath)
            })
        })
    })
    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(res => resolve(res))
            .catch(err => reject(err))
    })

    // return new Promise((resolve) => {
    //     for (let i = 0; i < global.imageReadPathList.length; i++) {
    //         let filePath = path.join(global.imageReadPathList[i], illust_name)
    //         fs.access(filePath, err => {
    //             if (err) {
    //                 if (i === global.imageReadPathList.length - 1) {
    //                     resolve(null)
    //                     console.log(illust_name, err)
    //                 }
    //             } else {
    //                 resolve(filePath)
    //             }
    //         })
    //     }
    // })
}

// function illustExistsByName(illust_name) {
//     for (let i = 0; i < global.imageReadPathList.length; i++) {
//         let filePath = path.join(global.imageReadPathList[i], illust_name)
//         if (fs.existsSync(filePath))
//             return filePath
//     }
//     return null
// }

// 相同操作写成函数, 方便阅读, 无特别用意
function returnImageBuffer(filePath, resolve, reject) {
    fs.readFile(filePath, (error, data) => {
        if (error) {
            reject(error)
            return
        }
        resolve(data)
    })
}

// function returnImageBuffer(filePath, resolve, reject) {
//     if (filePath) {
//         fs.readFile(filePath, (error, data) => {
//             if (error) {
//                 reject(error)
//                 return
//             }
//             resolve(data)
//         })
//     } else {
//         // getImageFromPixiv(illust_id, 0).then(res => resolve(res))
//         resolve(null)
//     }
// }

// getImageFromPixiv(850349020, 0).then()

// eslint-disable-next-line no-unused-vars
function getImageFromPixiv(illust_id, page) {
    return new Promise((resolve) => {
        let headers = {'Connection': 'close' }
        let url = 'https://www.pixiv.net/ajax/illust/' + illust_id
        let referer = 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illust_id
        let params = { url: url, headers: headers, proxy: 'http://127.0.0.1:10811', timeout: 5000}
        request(params, (error, response) => {
            if (error) {
                resolve(null)
            }
            if (response) {
                let json = JSON.parse(response.body)
                if (json.error !== true) {
                    let url_original = json.body.urls.original
                    let headers = {'Connection': 'close', 'User-Agent': USER_AGENT, 'Referer': referer, timeout: 5000}
                    let params2 = {url: url_original, encoding: null, headers: headers, proxy: 'http://127.0.0.1:10811'}
                    request(params2, (error, response) => {
                        // console.log(response.body)
                        if (error) {
                            resolve(null)
                        }
                        if (response) {
                            resolve(response.body)
                        }
                    })
                }
            }
        })
    })
}
