<template>
    <div class="pixiv-illust-image" id="pixiv-illust-image">
        <div class="image-viewer">
            <template v-for="(image, index) in this.illust.src" >
                <div :key="image" :id="'p'+index" class="image-page" :style="[imagePageStyleOne[index], imagePageStyleTwo[index]]">
                    <img :src="image" class="image" :style="{height: imagePageStyleOne[index].height}" alt/>
                </div>
            </template>
            <div class="page-number" v-if="this.illust.image_list.length > 1">
                <div class="number-click" @click="openDialog">
                    <el-tooltip effect="dark" content="多图浏览" placement="bottom">
                        <div class="number-text">{{currentPage+1}}/{{illust.image_list.length}}</div>
                    </el-tooltip>
                </div>
            </div>
            <el-dialog
                title="预览"
                :visible.sync="dialogVisible"
                :width="dialogWidth"
                center>
                <span class="dialog-image-panel">
                    <template v-for="(image, index) in this.illust.src" >
                        <div :key="'dialog'+image" :id="'dp'+index" class="dialog-image-page" :style="{opacity: index === currentPage ? 0.3 : undefined}">
                            <img :src="image" class="dialog-image" @click="dialogImageClick(index)" alt/>
                        </div>
                    </template>
                </span>
            </el-dialog>
            <div class="arrow-icon" v-if="isOpenShowMore">
                <div class="arrow-icon-mask">
                    <font-awesome-icon v-if="currentPage" class="arrow-up" :icon="['fas', 'chevron-up']" @click="gotoImage('u')"/>
                    <font-awesome-icon v-if="currentPage < illust.image_list.length - 1" class="arrow-down" :icon="['fas', 'chevron-down']" @click="gotoImage('d')" />
                    <div v-else class="place-holder arrow-down"></div>
                </div>
            </div>
        </div>
        <div :class="['action-panel', actionPanelAnimateClass]" :style="actionPanelStyle">
            <div class="action-show-more" v-if="haveMore && !isOpenShowMore">
                <div class="action-show-more-shadow"></div>
<!--                <div class="action-show-more-btn" @click="getAllImage">查看全部</div>-->
                <el-button class="action-show-more-btn" @click="getAllImage" :loading="isLoading" round>查看全部</el-button>
            </div>
            <div class="action-icon">
                <div class="action-image-pack-up" v-if="isOpenShowMore" @click="isOpenShowMore = !isOpenShowMore">收起图片</div>
                <like class="like-btn" :like="illust.is_like" @handleLike="handleLike" />
                <button class="el-icon-share" @click="shareQQ"></button>
<!--                <i class="el-icon-share"></i>-->
<!--                <button class="el-icon-more" @click="openWeb"></button>-->
                <el-popover
                    placement="bottom"
                    popper-class="more-action-panel"
                    :open-delay="200"
                    trigger="hover">
                    <div class="more-action" @click="openWeb">原始网站</div>
                    <div class="more-action" @click="openFile">默认方式打开</div>
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
    name: "PixivIllustImage",
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
            dctIsOpen: false,
            dctIsStyle: {
                maxHeight: '120px'
            },
            updateTime: undefined,
            isLoading: false,
            haveMore: undefined,
            isOpenShowMore: false,
            isGetAllImage: false,
            dialogVisible: false,
            imagePageStyleTwo: [],
            currentPage: 0,
            currentHeight: 0,
            actionPanelStyle: {position: 'relative'},
            // actionPanelStyle: {position: 'relative'},
            setTimeoutId: undefined,
            actionPanelAnimateClass: null,
            actionPanelHeight: 1,

            infoPanelIcons: [
                {icon: 'heart', count: this.illust.like_count},
                {icon: 'star', count: this.illust.bookmark_count},
                {icon: 'eye', count: this.illust.view_count}
            ],
        }
    },

    watch: {
        isOpenShowMore: function (val) {
            this.actionPanelStyle.position =  'relative'
            if (val) {
                setTimeout(() => {
                    this.actionPanelHeight = document.getElementsByClassName('action-panel')[0].offsetTop
                    this.actionPanelStyle.position = 'sticky'
                    this.actionPanelAnimateClass = 'animate__animated animate__slideInUp'
                }, 100)
            }
            for (let index = 0; index < this.illust.src.length; index++) {
                this.imagePageStyleTwo[index] = {
                    'display': (index === 0 || ( index !== 0 && val)) ? 'flex' : 'none'
                }
            }
        },
        // domWidth: function (val) {
        //     let dialogImageCount = val > 1710 ? 6 : (val > 1330 ? 5 : 4)
        //     let imageCount = this.illust.image_list.length
        //     dialogImageCount = imageCount < dialogImageCount ? imageCount : dialogImageCount
        //     this.dialogWidth = dialogImageCount * 128 + 8 * (dialogImageCount - 1) + 60 + 'px'
        // }
    },

    computed: {
        imagePageStyleOne: function () {
            let styleList = []
            this.illust.image_list.forEach((image, index) => {
                let imageHeight = image.width * this.maxHeight > image.height * this.domWidth ? undefined : this.maxHeight
                styleList.push({
                    height: imageHeight + 'px',
                    minHeight: this.minHeight + 'px',
                    marginTop: index !== 0 ? '25px' : undefined
                })
            })
            return styleList
        },
        dialogWidth : function () {
            let dialogImageCount = this.domWidth > 1150 ? 6 : (this.domWidth > 865 ? 5 : 4)
            let imageCount = this.illust.image_list.length
            dialogImageCount = imageCount < dialogImageCount ? imageCount : dialogImageCount
            return dialogImageCount * 128 + 8 * (dialogImageCount - 1) + 60 + 'px'
        }
    },

    created() {
      // for (const image in this.illust.image_list) {
      //     if (Object.prototype.hasOwnProperty.call(this.illust.image_list, image)) {
      //         console.log(123)
      //     }
      // }
        this.init()
        // this.illust.image_list.forEach(image => {
        //     this.imageHeight.push(image.width * this.maxHeight > image.height * this.domWidth ? undefined : this.maxHeight)
        // })
        // console.log(this.imageHeight)
        // this.getAllImage()
    },

    mounted() {
        setTimeout(() => {
            this.actionPanelHeight = document.getElementsByClassName('action-panel')[0].offsetTop
        }, 100)
        if (this.illust.image_list.length > 1) {
            const wrapper = document.getElementsByClassName('pixiv-illust')[0]
            wrapper.addEventListener('scroll', e => this.handleScroll(e))
        }
    },

    methods: {
        init () {
            this.haveMore = this.illust.image_list.length !== 1 && this.illust.image_type !== 2
            // console.log(this.illust.image_list.length, this.illust.image_type)
        },

        getAllImage () {
            //  todo: 把src换成新的变量让子组件遍历, 更改后不更新, (新加变量不更新?)
            if (!this.isGetAllImage) {
                this.isLoading = true
                let params = [this.illust.image_list, 0]
                this.$ipcRenderer.invoke('get-illust-all-image', params).then(images => {
                    let urls = images.map((image, index) => {
                        this.illust.image_list[index + 1].file = image
                        return window.URL.createObjectURL(new Blob([image]))
                    })
                    this.illust.src = this.illust.src.concat(urls)
                    this.isLoading = false
                    this.isGetAllImage = true
                    // imageList.unshift(this.illust.src)
                    // this.$set(this.illust, 'images', imageList)
                    // this.$forceUpdate()
                })
            }
            this.isOpenShowMore = true
        },

        closeShowMore () {
            this.isOpenShowMore = !this.isOpenShowMore
            this.currentPage = 0
        },

        handleScroll (e) {
            let height = e.target.scrollTop
            if (this.isOpenShowMore) {
                if (height + this.maxHeight > this.actionPanelHeight) {
                    this.actionPanelStyle['position'] = 'relative'
                    this.actionPanelAnimateClass = 'animate__animated animate__flipInX'
                } else if ((height > this.currentHeight || !height) && this.actionPanelStyle['position'] === 'sticky') {
                    this.actionPanelAnimateClass = 'animate__animated animate__slideOutDown'
                    if (this.setTimeoutId) {
                        clearTimeout(this.setTimeoutId)
                        this.setTimeoutId = undefined
                    }
                } else if (height < this.currentHeight && !this.setTimeoutId) {
                    this.setTimeoutId = setTimeout(() => {
                        this.actionPanelStyle['position'] = 'sticky'
                        this.actionPanelAnimateClass = 'animate__animated animate__slideInUp'
                    }, this.actionPanelStyle['position'] === 'relative' ? 0 : 1000)
                }
            }

            // this.actionPanelStyle['position'] = (height > this.currentHeight && this.isOpenShowMore) ? undefined : 'sticky'
            this.currentHeight = height
            let documentLast = document.getElementById('p' + (this.currentPage - 1))
            let documentNext = document.getElementById('p' + (this.currentPage + 1))
            if (!this.isOpenShowMore) {
                this.currentPage = 0
            } else {
                if (documentNext && (documentNext.offsetTop < height + 120)) {
                    this.currentPage++
                    return
                }
                if (documentLast && (documentLast.offsetTop + documentLast.offsetHeight / 2 > height)) {
                    this.currentPage--
                }
            }
        },

        openDialog () {
            this.getAllImage()
            this.dialogVisible = !this.dialogVisible
        },

        dialogImageClick (index) {
            this.currentPage = index
            document.getElementById("p" + index).scrollIntoView({behavior: 'smooth'});
            this.dialogVisible = !this.dialogVisible
        },

        gotoImage (type) {
            let index = type === 'u' ? this.currentPage - 1 : this.currentPage + 1
            document.getElementById("p" + index).scrollIntoView({behavior: 'smooth'});
        },

        handleLike () {
            let params = ['illust', this.illust.illust_id, this.illust.is_like ? 'del' : 'add']
            this.$ipcRenderer.invoke('like', params).then(res => {
                if (!res) return
                // this.$message
                this.illust.is_like = !this.illust.is_like
            })
        },

        shareQQ () {
            let t = `https://connect.qq.com/widget/shareqq/index.html?url=www.pixiv.net/artworks/${this.illust.illust_id}
            &sharesource=qzone&title=${this.illust.illust_title}&summary=${this.illust.description}`
            const { shell } = window.require('electron')
            shell.openExternal(t)
        },

        openWeb () {
            const { shell } = window.require('electron')
            shell.openExternal(`https://www.pixiv.net/artworks/${this.illust.illust_id}`)
        },

        openFile () {
            this.$ipcRenderer.invoke('open-file', this.illust.image_list[this.currentPage].name).then(msg => {
                if (!msg) this.$message({ message: `打开失败`, center: true, type: 'error' })
            })
        },

        openSaveDialog () {
            let images = []
            if (this.isOpenShowMore) {
                this.illust.image_list.forEach(v => images.push({name: v.name, file: v.file}))
            } else {
                images.push({name: this.illust.image_list[0].name, file: this.illust.image_list[0].file})
            }
            this.$ipcRenderer.invoke('open-save-dialog', [this.illust.illust_id, images]).then(msg => {
                if (msg[0]) {
                    this.$message({ message: msg[1], center: true, type: 'success' })
                } else if (msg[1] !== '取消') {
                    this.$message({ message: `失败: ${msg[1]}`, center: true, type: 'error' })
                }
            })
        },
    }
}
</script>

<style scoped lang="stylus">
    .pixiv-illust-image
        background-color rgb(242, 242, 242)

        .image-viewer
            position relative

            .image-page
                display flex
                align-items center
                justify-content center
                background-color rgb(242, 242, 242)

                .image
                    width auto
                    height auto
                    max-width 100%
                    max-height 100%

            .page-number
                position absolute
                top 0
                right 0
                bottom 0

                .number-click
                    z-index 1
                    position sticky
                    cursor pointer
                    top 10px
                    margin-right 7px

                    .number-text
                        display flex
                        justify-content center
                        align-items center
                        flex: 0 0 auto
                        box-sizing: border-box
                        height 20px
                        min-width 20px
                        color rgb(255, 255, 255)
                        font-weight bold
                        padding 0 6px
                        background rgba(0, 0, 0, 0.32)
                        border-radius 10px
                        font-size 13px
                        line-height 10px

            /deep/ .el-dialog__wrapper
                left 65px

            /deep/ .el-dialog
                border-radius 25px
                overflow initial

            /deep/ .el-dialog__header
                display flex
                align-items center
                justify-content center
                font-weight bold
                padding-top 20px
                padding-bottom 10px

            /deep/ .el-dialog__body
                padding-left 30px
                padding-right 30px


            .dialog-image-panel
                display grid
                gap 8px
                grid-template-columns repeat(auto-fit, 128px)

                .dialog-image-page
                    border-radius 10px
                    overflow hidden
                    width 128px
                    height 128px
                    transition: opacity 0.2s ease 0s

                    &:hover
                        opacity: 0.7

                    .dialog-image
                        height 100%
                        width 100%
                        object-fit cover
                        cursor pointer

            .arrow-icon
                position absolute
                bottom 0
                right 0
                top 0
                display flex
                flex-direction column
                justify-content flex-end


                .arrow-icon-mask
                    position sticky
                    display flex
                    flex-direction column
                    justify-content flex-end
                    align-items flex-end
                    padding-bottom 50px
                    bottom 0
                    height 250px
                    width 150px

                    &:hover .arrow-up
                        opacity 0.8

                    &:hover .arrow-down
                        opacity 0.8


                    .arrow-up, .arrow-down
                        margin 10px 30px 10px 30px
                        font-size 65px
                        color darkgray
                        opacity 0
                        cursor pointer
                        transition: opacity 0.5s ease 0s

                    .place-holder
                        width 56.88px
                        height 65px


        .action-panel
            z-index 2
            bottom 0
            background-color: rgba(255,255,255,0.92)

            .action-show-more
                position absolute
                bottom  40px
                display flex
                align-items center
                justify-content center
                width 100%
                padding 64px 0 8px
                background-color transparent

                .action-show-more-shadow
                    position absolute
                    z-index 1
                    width 100%
                    height 100%
                    bottom 0
                    background-color #f2f2f2
                    -webkit-mask-image linear-gradient(transparent, rgb(0, 0, 0) 100%, rgb(0, 0, 0) 0px)

                .action-show-more-btn
                    z-index 2
                    height 40px
                    border-color rgb(51, 51, 51)
                    min-width 184px
                    line-height 22px
                    font-size 14px
                    font-weight bold
                    border-radius 20px
                    padding 0 24px
                    background rgb(51, 51, 51)
                    color rgb(255, 255, 255)

            .action-icon
                display flex
                align-items center
                justify-content flex-end
                padding-top 8px
                padding-bottom 8px
                height 40px
                background-color rgba(255, 255, 255, 0.92)

                .action-image-pack-up
                    margin-right 15px
                    color rgb(173, 173, 173)
                    cursor pointer
                    //cursor url(~@/assets/sad.png), pointer
                    //cursor url('~src/assets/sad.png')
                    transition color 0.3s ease 0s

                    &:hover
                        color rgb(140, 140, 140)

                .like-btn
                    cursor pointer

                .el-icon-share, .el-icon-more
                    cursor pointer
                    margin-right 10px
                    margin-left 10px
                    font-size 20px
                    border none
                    background none
                    padding 0

</style>
