const mongoose = require('mongoose')
// mongoose.connect(`mongodb://localhost/${global.config.dbName}`)
// mongoose.connect(`mongodb://localhost/Pixiv`)

let rankSchema = new mongoose.Schema({
    illust_id: {
        type: Number,
        required: true
    },
    rank_date: {
        type: Number,
        required: true
    },
    rank: {
        type: Number,
        required: true
    },
    yes_rank: {
        type: Number,
        required: true
    },
    r18: {
        type: Number,
        required: true
    },
})

rankSchema.virtual('info', {
    ref: 'illust',
    localField: 'illust_id',
    foreignField: 'illust_id',
    justOne: true
})

rankSchema.virtual('image', {
    ref: 'image',
    localField: 'illust_id',
    foreignField: 'illust_id',
    justOne: true
})

let illustSchema = new mongoose.Schema({
    illust_id: {
        type: Number,
        required: true
    },
})

illustSchema.virtual('image', {
    ref: 'image',
    localField: 'illust_id',
    foreignField: 'illust_id',
    justOne: true
})

let tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
    }
})

let authorSchema = new mongoose.Schema({
    author_id: {
        type: Number,
        required: true
    },
    author_name: {
        type: String,
        required: true,
    },
    artworks: {
        type: Array,
        required: true
    }
})

authorSchema.virtual('images', {
    ref: 'image',
    localField: 'artworks',
    foreignField: 'illust_id',
    justOne: false
})

let imageSchema = new mongoose.Schema({
    illust_id: {
        type: Number,
        required: true
    },
    image_list: {
        type: Array,
        required: true,
    },
})

let gifMetaSchema = new mongoose.Schema({
    illust_id: {
        type: Number,
        required: true
    },
    delay: {
        type: Array,
        required: true,
    },
})

let likeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    id_list: {
        type: Array,
        required: true,
    },
})

likeSchema.virtual('illust', {
    ref: 'illust',
    localField: 'id_list',
    foreignField: 'illust_id',
    justOne: false
})

// const dailyIllust = mongoose.model('daily_illust', dailyIllustSchema, 'daily_illust')

// const illust = mongoose.model('illust', {
//     illust_id: {
//         type: Number,
//         required: true
//     },
// }, 'illust')


module.exports = {
    rankSchema: rankSchema,
    illustSchema: illustSchema,
    tagSchema: tagSchema,
    authorSchema: authorSchema,
    imageSchema: imageSchema,
    likeSchema: likeSchema,
    gifMetaSchema: gifMetaSchema,
}
