import { ipcMain } from 'electron';
const mongoose = require('mongoose')
const schema = require('./schema')
// mongoose.connect(`mongodb://localhost/${global.config.dbName}`)
// mongoose.connect(`mongodb://localhost/Pixiv`)

const rankSchema = schema.rankSchema
const illustSchema = schema.illustSchema
const authorSchema = schema.authorSchema
// const tagSchema = schema.tagSchema
// const imageSchema = schema.imageSchema
const gifMetaSchema = schema.gifMetaSchema
const likeSchema = schema.likeSchema
const illust = mongoose.model('illust', illustSchema, 'illust')
const author = mongoose.model('author', authorSchema, 'author')
// const image = mongoose.model('image', imageSchema, 'image')
const gifMeta = mongoose.model('gif_meta', gifMetaSchema, 'gif_meta')
const like = mongoose.model('like', likeSchema, 'like')

/**
 * 仅rank信息
 * @param params: { query: {rank_date:, r18:}, skip:, limit: }
 * @return eg: [ {illust_id:, rank_date: 20190401, r18:0, rank: 1, yes_rank:},
 *               {illust_id:, rank_date: 20190401, r18:0, rank: 2, yes_rank:},
 *               {illust_id:, rank_date: 20190401, r18:0, rank: 3, yes_rank:}, ..... ]
 */
ipcMain.handle("get-rank", (event, params) => {
    return new Promise((resolve, reject) => {
        let modelName = params.illustMode + '_' + params.rankMode
        mongoose.model(modelName, rankSchema, modelName)
            .find(params.query)
            .skip(params.skip)
            .limit(params.limit)
            .lean()
            .exec((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
    })
})

/**
 * 获取带有illust信息的rank
 * @param params: { query: {rank_date:, r18:}, skip:, limit: }
 * @find-res eg: [ {illust_id:, rank_date: 20190401, r18:0, rank: 1, yes_rank:, info: {}},
 *                 {illust_id:, rank_date: 20190401, r18:0, rank: 2, yes_rank:, info: {}},
 *                 {illust_id:, rank_date: 20190401, r18:0, rank: 3, yes_rank:, info: {}}, ..... ]
 *             info: 见: api -> pixiv -> mongodb -> query.js -> getIllustByID
 * @return eg: [ {illust: (同上info), rank: {rank_date:, r18:, rank:, yes_rank: }}, ...... ]
 */
ipcMain.handle("get-rank-with-illust", (event, params) => {
    return new Promise((resolve, reject) => {
        let modelName = params.illustMode + '_' + params.rankMode
        mongoose.model(modelName, rankSchema, modelName)
            .find(params.query)
            .skip(params.skip)
            .limit(params.limit)
            .populate('info')
            .populate('image')
            .lean()
            .exec((err, res) => {
                if (err) {
                    reject(err)
                }
                res.length === 0 ? resolve([]) : resolve(formatDBResult(res, 'illust-rank'))
            })
    })
})

/**
 * 获取单个illust的排行信息, 返回第一次入榜到最新排名数组
 * eg: [ {illust_id:, rank_date: 20200810, r18:0, rank: 300, yes_rank: 0},
 *       {illust_id:, rank_date: 20200811, r18:0, rank: 130, yes_rank: 300},
 *       {illust_id:, rank_date: 20200812, r18:0, rank: 50, yes_rank: 130} ]
 *
 * todo: 所有数据库ranks
 * */

// ipcMain.handle("get-illust-ranks", (event, illust_id) => {
//     return new Promise((resolve, reject) => {
//         let modelName = params.illustMode + '_' + params.rankMode
//         mongoose.model(modelName, rankSchema, modelName)
//             .find({illust_id: illust_id})
//             .sort({rank_date: 1})
//             .lean()
//             .exec((err, res) => {
//                 if (err) {
//                     reject(err)
//                 }
//                 resolve(res)
//             })
//     })
// })

/**
 * 获取单个illust的信息
 * @return eg: {illust_id, r18, tags:[], page_count, like_count, bookmark_count, bookmark_count,
 *              *width, *height, *[illust_type], illust_title, author_id, author_name, description,
 *              *[url_original], create_date, upload_date, update_info_date}
 *             因有些字段早期没有保存, 后期因作品被删除所以数据存在缺失
 *             width, height 早期没保存, 现因源图片文件破损或者确实, 出现问题的: 值为 -1000 (*[现知]一共34个illust_id)
 *             illust_type, url_original 早期没保存, 出现问题的: 没有字段
 */
ipcMain.handle("get-illust-by-id", (event, illust_id) => {
    return new Promise((resolve, reject) => {
        illust
            .find({illust_id: illust_id})
            .populate('image')
            .lean()
            .exec((err, res) => {
                if (err) {
                    reject(err)
                }
                res.length === 0 ? resolve([]) : resolve(formatDBResult(res[0], 'illust'))
            })
    })
})

// todo 从
ipcMain.handle("get-suggestions", (event, params) => {
    let query, sort, db, sea
    if (params.searchMode === 'tag') {
        query = {tag: {$regex: params.keywords}}
        query.count = {$gt: 4}
        sort = {count: -1}
        db = 'tag'
        sea = 'tagSchema'
    } else if (params.searchMode === 'author') {
        query = {author_name: {$regex: params.keywords}}
        sort = {}
        db = 'author'
        sea = 'authorSchema'
    }
    return new Promise((resolve, reject) => {
        mongoose.model(db, schema[sea], db)
            .find(query)
            .sort(sort)
            .skip(0)
            .limit(30)
            .lean()
            .exec((err, res) => {
                if (err) {
                    reject(err)
                }
                if (res.length !== 0) {
                    let suggestions = []
                    if (db === 'tag') {
                        res.forEach(v => suggestions.push({label: v.tag, key: v.tag, count: v.count}))
                    } else if (db === 'author') {
                        res.forEach(v => suggestions.push({
                            label: v.author_name,
                            key: v.author_id,
                            count: v.artworks.length
                        }))
                    }
                    resolve(suggestions)
                } else {
                    resolve([])
                }
            })
    })
})

ipcMain.handle("get-search-with-illust", (event, params) => {
    if (params.searchMode === 'tag' || params.searchMode === 'ugoira') {
        return searchIllustAndUgoira(params)
    } else if (params.searchMode === 'author') {
        return searchAuthor(params)
    }
})


ipcMain.handle("get-author-artworks", (event, author_id) => {
    return new Promise((resolve, reject) => {
        author
            .find({author_id: author_id})
            .populate('images')
            .lean()
            .exec((err, res) => {
                if (err) { reject(err) }
                if (res.length !== 0) {
                    res[0].images.forEach(val => val.image_list.sort(sortImageList))
                    resolve(res[0].images.sort((x, y) => y.illust_id - x.illust_id))
                } else {
                    resolve([])
                }
            })
    })
})

// ipcMain.handle("test", () => {
//     return searchAuthor({searchMode: 'author', keyword: '16183476', skip: 0, limit: 50})
// })

ipcMain.handle("get-gif-delay", (event, illust_id) => {
    return new Promise((resolve, reject) => {
        gifMeta
            .find({illust_id: illust_id})
            .lean()
            .exec((err, res) => {
                if (err) { reject(err) }
                // console.log(res[0].images)
                // console.log(res)
                if (res.length !== 0) {
                    resolve(res[0].delay)
                } else {
                    resolve([])
                }
            })
    })
})

ipcMain.handle("get-like-by-id", (event, params) => {
    return new Promise((resolve, reject) => {
        like
            .findOne({type: params[0]})
            .lean()
            .exec((err, res) => {
                if (err) { reject(err) }
                // console.log(res, params)
                if (res) {
                    resolve(res.id_list.indexOf(params[1]) !== -1)
                } else {
                    resolve(false)
                }
            })
    })
})

ipcMain.handle("like", (event, params) => {
    let id = params[1]
    let mode = params[2]
    let updateParams = mode === 'add' ? { '$addToSet': {'id_list': id}} : { '$pull': {'id_list': id} }
    return new Promise((resolve, reject) => {
        like
            .updateOne({type: params[0]}, updateParams, {upsert: true})
            .lean()
            .exec((err, res) => {
                if (err) { reject(err) }
                resolve(res.n === 1 && res.ok === 1)
            })
    })
})

ipcMain.handle("get-like-illust-list", (event, params) => {
    let pipeline = [
        {$match:  {type: 'illust'}},
        {$lookup: {from: 'illust', localField: 'id_list', foreignField: 'illust_id', as: 'illust'}},
        {$unwind: '$illust'},
        {$lookup: {from: 'image', localField: 'illust.illust_id', foreignField: 'illust_id', as: 'image'}},
        {$unwind: '$image'},
        {$skip:   params.skip},
        {$limit:  params.limit},
    ]
    return new Promise((resolve, reject) => {
        like
            .aggregate(pipeline)
            .exec((err, res) => {
                if (err) { reject(err) }
                let data = []
                if (res.length !== 0) {
                    res.forEach(v => {
                        v.illust.image_list = v.image.image_list
                        v.illust.image_list.sort(sortImageList)
                        v.illust.is_like = true
                        v.illust.tags = tagFormat(v.illust.tags)
                        data.push(v)
                    })
                }
                resolve(data)
            })
    })
})


ipcMain.handle("get-like-author-list", (event, params) => {
    let pipeline = [
        {$match:  {type: 'author'}},
        {$lookup: {from: 'author', localField: 'id_list', foreignField: 'author_id', as: 'author'}},
        {$unwind: '$author'},
        {$lookup: {from: 'illust', localField: 'author.artworks', foreignField: 'illust_id', as: 'illust'}},
        {$unwind: '$illust'},
        {$sort:   {'illust.create_date': -1}},
        {$lookup: {from: 'image', localField: 'illust.illust_id', foreignField: 'illust_id', as: 'image'}},
        {$unwind: '$image'},
        {$skip:   params.skip},
        {$limit:  params.limit},
    ]
    return new Promise((resolve, reject) => {
        like
            .aggregate(pipeline)
            .exec((err, res) => {
                if (err) { reject(err) }
                resolve(handleAuthorLike(res))
            })
    })
})

function handleAuthorLike (illusts) {
    return new Promise((resolve, reject) => {
        like.findOne({type: 'illust'}).exec((err, res) => {
            if (err) { reject(err) }
            let data = []
            if (illusts.length !== 0) {
                illusts.forEach(v => {
                    v.illust.image_list = v.image.image_list.sort(sortImageList)
                    v.illust.is_like = res.id_list.indexOf(v.illust.illust_id) !== -1
                    v.illust.tags = tagFormat(v.illust.tags)
                    data.push(v)
                })
            }
            resolve(data)
        })
    })
}
// ipcMain.handle("add-like-author", (event, author_id) => {
//     return new Promise((resolve, reject) => {
//         author
//             .find({author_id: author_id})
//             .populate('images')
//             .lean()
//             .exec((err, res) => {
//                 if (err) { reject(err) }
//                 // console.log(res[0].images)
//                 res[0].images.forEach(val => val.image_list.sort(sortImageList))
//                 resolve(res[0].images.sort((x, y) => y.illust_id - x.illust_id))
//             })
//     })
// })

function searchIllustAndUgoira(params) {
    let query
    if (params.keyword instanceof Array) {
        let tag_list = []
        params.keyword.forEach(v => {
            tag_list.push({'info.tags': v})
        })
        query = {$or: tag_list}
    } else {
        query = {'info.tags': {$regex: params.keyword}}
    }
    let modelName = 'illust_daily'

    let pipeline = [
        {$sort:   {illust_id: 1, rank: 1}},
        {$group:  {_id: '$illust_id', rank: {$first: '$rank'}, r18: {$first: '$r18'},
                   yes_rank: {$first: '$yes_rank'}, rank_date: {$first: '$rank_date'}}},
        {$sort:   {rank: 1, _id: -1}},
        {$lookup: {from: 'illust', localField: '_id', foreignField: 'illust_id', as: 'info'}},
        {$match:  query},
        {$skip:   params.skip},
        {$limit:  params.limit},
        {$lookup: {from: 'image', localField: '_id', foreignField: 'illust_id', as: 'image'}},
        {$unwind: '$info'},
        {$unwind: '$image'}
    ]
    return new Promise((resolve, reject) => {
        mongoose.model(modelName, rankSchema, modelName)
            .aggregate(pipeline)
            .option({ allowDiskUse: true })
            .exec((err, res) => {
                if (err) { reject(err) }
                resolve(formatDBResult(res, 'illust-rank'))
            })
    })
}

// todo 同名时处理
function searchAuthor(params) {
    let query
    if (!isNaN(Number(params.keyword))) {
        query = {author_id: Number(params.keyword)}
    } else {
        query = {author_name: params.keyword}
    }

    let pipeline = [
        {$match:  query},
        {$project: {illust_id: '$artworks'}},
        {$unwind: '$illust_id'},
        {$sort:   {illust_id: -1}},
        {$skip:   params.skip},
        {$limit:  params.limit},
        {$lookup: {from: 'illust', localField: 'illust_id', foreignField: 'illust_id', as: 'info'}},
        {$lookup: {from: 'image', localField: 'illust_id', foreignField: 'illust_id', as: 'image'}},
        {$unwind: '$info'},
        {$unwind: '$image'}
    ]

    return new Promise((resolve, reject) => {
        author
            .aggregate(pipeline)
            .option({ allowDiskUse: true })
            .exec((err, res) => {
                if (err) { reject(err) }
                resolve(formatDBResult(res, 'illust-rank'))
            })
    })
}

function formatDBResult(illusts, mode) {
    if (illusts.length === 0) {
        return []
    }
    return new Promise((resolve, reject) => {
        like.findOne({type: 'illust'}).exec((err, res) => {
            if (err) { reject(err) }
            let like_list = res ? res.id_list : []
            let data = []
            // console.log(like_list)
            if (mode === 'illust-rank') {
                illusts.forEach(v => {
                    if (!v.image) return true
                    if (v.image.image_list.length === 0) return true
                    v.info.image_list = v.image.image_list
                    v.info.image_list.sort(sortImageList)
                    v.info.is_like = like_list.indexOf(v.info.illust_id) !== -1

                    v.info.tags = tagFormat(v.info.tags)

                    let item = {
                        illust: v.info,
                    }
                    if (v.rank) {
                        item.rank = {
                            rank_date: v.rank_date,
                            r18: v.r18,
                            rank: v.rank,
                            yes_rank: v.yes_rank
                        }
                    }
                    data.push(item)
                })
            } else if (mode === 'illust') {

                // let index = [illusts.tags.indexOf('原创'), illusts.tags.indexOf('オリジナル')]
                // index = index[0] !== -1 ? index[0] : (index[1] !== -1 ? index[1] : -1)
                // illusts.tags.unshift(illusts.tags.splice(index, 1)[0])
                illusts.tags = tagFormat(illusts.tags)
                illusts.image_list = illusts.image ? illusts.image.image_list.sort(sortImageList) : []
                illusts.is_like = like_list.indexOf(illusts.illust_id) !== -1
                data = illusts
            }
            return resolve(data)
        })
    })
}

function sortImageList(x, y) {
    let x_id = Number(x.name.split('p')[1].split('.')[0])
    let y_id = Number(y.name.split('p')[1].split('.')[0])
    if (x_id < y_id) {
        return -1
    } else if (x_id > y_id) {
        return 1
    } else {
        return 0
    }
}

function tagFormat(tags) {
        let index = [tags.indexOf('原创'), tags.indexOf('オリジナル')]
        index = index[0] !== -1 ? index[0] : (index[1] !== -1 ? index[1] : -1)
        tags.unshift(tags.splice(index, 1)[0])
        return tags
}
