<template>
    <div class="pixiv-illust-gif">
<!--        <div class="image-viewer" :style="imageViewerStyle">-->
        <div class="image-viewer" :style="{ height: `${showHeight}px`, minHeight: `${minHeight}px` }" @click="gifStart = !gifStart">
<!--            <canvas class="canvas" id="canvas"/>-->
            <canvas class="canvas" id="canvas" :style="{ width: `${showWidth}px`, height: `${showHeight}px` }"/>
            <font-awesome-icon v-if="!gifStart" class="play-pause-icon" :icon="['fas', 'play']"/>
            <font-awesome-icon v-else class="play-pause-icon" :icon="['fas', 'pause']"/>
        </div>
        <div class="action-panel">
            <div class="action-icon">
                <like class="like-btn" :like="illust.is_like" @handleLike="handleLike" />
                <i class="el-icon-share"></i>
                <el-popover
                    placement="bottom"
                    popper-class="more-action-panel"
                    :open-delay="200"
                    trigger="hover">
                    <div class="more-action" @click="openWeb">原始网站</div>
                    <div class="more-action" @click="openSaveDialog">另存为</div>
                    <button slot="reference" class="el-icon-more"></button>
                </el-popover>
            </div>
        </div>
    </div>
</template>

<script>
import Like from "components/Pixiv/PixivPublicComponents/Like";

export default {
    name: "PixivIllustGif",
    components: {Like},

    props: {
        illust: {
            type: Object,
            required: true,
        },
        domWidth: {
            type: Number,
            required: true,
        },
        maxHeight: {
            type: Number,
            required: true,
        },
        minHeight: {
            type: Number,
            required: true,
        },
    },

    data () {
        return {
            gifStart: false,
            showHeight: 1,
            showWidth: 1,
            imagePage: -1,
            setTimeoutId: undefined,
            canvas: undefined,
            canvas2D: undefined,
            // imageViewerStyle: {
            //     // maxHeight: this.maxHeight,
            //     minHeight: this.minHeight,
            //     height: this.height
            // }
        }
    },

    watch: {
        domWidth: 'calculateHW',
        maxHeight: 'calculateHW',
        gifStart: function (val) {
            if (val) {
                this.setTimeoutId = setTimeout(() => this.drawFame(this), this.illust.delay[this.imagePage])
            } else {
                clearTimeout(this.setTimeoutId)
            }
        },
    },

    computed: {
        // imageViewerStyle: function () {
        //     let image =  this.illust.image_list[0]
        //     let imageHeight = image.width * this.maxHeight > image.height * this.domWidth ? undefined : this.maxHeight
        //     return {
        //         height: `${imageHeight}px`,
        //         minHeight: `${this.minHeight}px`,
        //     }
        // },
    },

    created() {
    },

    mounted() {
        this.init()
    },

    beforeDestroy() {
        clearTimeout(this.setTimeoutId)
    },

    methods: {
        init () {
            this.canvas = document.getElementById('canvas')
            this.canvas2D = this.canvas.getContext('2d')
            this.getAllImageAndGifMeta()
            this.calculateHW()
            this.drawFame(this)
        },

        calculateHW () {
            let image = this.illust.image_list[0]
            // console.log(image.width, image.height, image.width * this.maxHeight, image.height * this.domWidth, image.width * this.maxHeight > image.height * this.domWidth)
            let height = image.width * this.maxHeight > image.height * this.domWidth ? undefined : this.maxHeight
            // console.log(this.maxHeight, this.domWidth, height)
            // console.log(image, this.maxHeight, this.domWidth)
            this.showHeight = height ? height : image.height * this.domWidth / image.width
            // console.log(image.height, this.domWidth, image.width)
            this.showWidth = height ? image.width * height / image.height : this.domWidth
        },

        drawFame (that) {
            // 在Canvas画布 添加图片
            // var img = document.getElementById('fames')
            // let canvas = document.getElementById('canvas')
            // let canvas2D = canvas.getContext('2d')
            let img = new Image()
            let page = ++that.imagePage
            if (page >= that.illust.image_list.length) {
                page = 0
                that.imagePage = 0
            }
            img.src = that.illust.src[page]

            img.onload = function () {
                // console.log(this.width, this.height, that.illust.image_list[0].width, that.illust.image_list[0].height, 0, 0, that.showWidth, that.showHeight)
                // canvas2D.clip()
                // canvas2D.drawImage(img, 0, 0, that.showWidth, that.showHeight, 0, 0, that.showWidth, that.showHeight)
                if (that.showWidth === 1 || that.showHeight === 1) {
                    setTimeout(() => that.drawImage(that, img), 50)
                } else {
                    that.drawImage(that, img)
                }
            }
        },

        drawImage (that, img) {
            that.canvas.width = that.showWidth
            that.canvas.height = that.showHeight
            that.canvas2D.drawImage(img, 0, 0, that.illust.image_list[0].width, that.illust.image_list[0].height, 0, 0, that.showWidth, that.showHeight)
            if (that.gifStart) {
                that.setTimeoutId = setTimeout(() => that.drawFame(that), that.illust.delay[that.imagePage])
            }
        },


        getAllImageAndGifMeta () {
            //  todo: 把src换成新的变量让子组件遍历, 更改后不更新, (新加变量不更新?)
            let params = [this.illust.image_list, 0]
            let imageDone = false
            let delayDone = false
            this.$ipcRenderer.invoke('get-illust-all-image', params).then(images => {
                // this.illust.images = this.illust.images.concat(
                //     images.map(image => window.URL.createObjectURL(new Blob([image]))))
                // console.log(images)
                let urls = images.map((image, index) => {
                    this.illust.image_list[index + 1].file = image
                    return window.URL.createObjectURL(new Blob([image]))
                })
                this.illust.src = this.illust.src.concat(urls)
                imageDone = true
                if (imageDone && delayDone) {
                    this.gifStart = true
                }
                // imageList.unshift(this.illust.src)
                // this.$set(this.illust, 'images', imageList)
                // this.$forceUpdate()
            })
            this.$ipcRenderer.invoke('get-gif-delay', this.illust.illust_id).then(delay => {
                // console.log(delay)
                this.illust.delay = delay
                delayDone = true
                if (imageDone && delayDone) {
                    this.gifStart = true
                }
            })
        },

        handleLike () {
            let params = ['illust', this.illust.illust_id, this.illust.is_like ? 'del' : 'add']
            this.$ipcRenderer.invoke('like', params).then(res => {
                if (!res) return
                // this.$message
                this.illust.is_like = !this.illust.is_like
            })
        },

        openWeb () {
            const { shell } = window.require('electron')
            shell.openExternal(`https://www.pixiv.net/artworks/${this.illust.illust_id}`)
        },

        openSaveDialog () {
            let images = []
            this.illust.image_list.forEach(v => images.push({name: v.name, file: v.file}))
            this.$ipcRenderer.invoke('open-save-dialog', [this.illust.illust_id, images, 'gif']).then(msg => {
                if (msg[0]) {
                    this.$message({ message: msg[1], center: true, type: 'success' })
                } else {
                    this.$message({ message: `失败: ${msg[1]}`, center: true, type: 'error' })
                }
            })
        },
    }
}
</script>

<style scoped lang="stylus">
    .pixiv-illust-gif
        background-color rgb(242, 242, 242)

        .image-viewer
            display flex
            justify-content center
            position relative
            cursor pointer

            &:hover .play-pause-icon
                opacity 0.7


            .play-pause-icon
                position absolute
                bottom 3%
                right 3%
                font-size 50px
                color darkgray
                opacity 0
                transition: opacity 0.5s ease 0s


        .action-panel
            bottom 0
            background-color: rgba(255,255,255,0.92)

            .action-icon
                display flex
                align-items center
                justify-content flex-end
                padding-top 8px
                padding-bottom 8px
                height 40px
                background-color rgba(255, 255, 255, 0.92)

                .el-icon-share, .el-icon-more
                    cursor pointer
                    margin-right 10px
                    margin-left 10px
                    font-size 20px
                    border none
                    background none
                    padding 0

</style>
