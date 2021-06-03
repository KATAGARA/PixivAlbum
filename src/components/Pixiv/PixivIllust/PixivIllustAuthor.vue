<template>
    <div class="pixiv-illust-author" :style="{width: domWidth}">
        <div class="author-info-panel" :style="authorInfoPanelStyle">
            <div class="author-info">
                <div class="author-name">{{ illust.author_name }}</div>
                <div class="author-id-panel" @click="copyId">
                    <div class="author-id">id:{{ illust.author_id }}</div>
                    <font-awesome-icon class="author-copy-icon" :icon="['fas', 'copy']"/>
                </div>
            </div>
            <el-button
                class="add-like-author" size="small"
                :type="authorButtonStyle[likeAuthor].type"
                :icon="authorButtonStyle[likeAuthor].icon"
                @click="changeLikeAuthor" round>
                {{ authorButtonStyle[likeAuthor].text }}
            </el-button>
        </div>
        <div class="author-image-text">
            <div class="other-image">其他作品</div>
            <div class="show-more" @click="searchAuthor">查看更多</div>
        </div>
        <div class="author-image-panel">
                <div class="image-page" v-for="(image, index) in imageSrc" :key="'author'+index" @click="selected(image.illust_id)">
                    <img v-if="image.src" class="image" :src="image.src" :style="authorImageStyle(image)" alt>
                    <div v-if="image.page_count > 1" class="page-count">
                        <i class="el-icon-picture"></i>
                        <span>{{ image.page_count }}</span>
                    </div>
                    <div v-if="authorImageShowButton(image) " class="image-arrow">
                        <img v-if="showIllustThree" :src="svgImage[index]" alt>
                    </div>
                </div>
        </div>
    </div>
</template>

<script>
import upSvg from '@/assets/up_arrow.svg'
import downSvg from '@/assets/down_arrow.svg'


export default {
    name: "PixivIllustAuthor",

    props: {
        illust: {
            type: Object,
            required: true,
        },
        workWidth: {
            type: Number,
            required: true,
        }
    },

    data () {
        return {
            // authorButtonType: 'primary',
            // authorButtonIcon: 'el-icon-plus',
            // authorButtonText: '加关注',
            authorButtonStyle: [
                {type: 'primary', icon: 'el-icon-plus', text: '加关注'},
                {type: 'info', icon: 'el-icon-check', text: '已关注'}
            ],
            artworks: undefined,
            isInit: false,
            // showIllustThree: undefined,
            imageSrc: [],
            imageSrcDict: {},
            likeAuthor: 0,
            svgImage: [upSvg, null, downSvg],
            authorInfoPanelStyle: {},
            imageInAnimate: 'animate__animated animate__slideInDown',
            imageOutAnimate: 'animate__animated animate__slideOutUp',
        }
    },

    watch: {
        showIllustThree: function () {
            this.getAuthorImage()
            this.changeAuthorInfoPanelStyle()
        },
    },

    computed: {
        domWidth: function () {
            return this.showIllustThree ? '150px' : '310px'
        },
        showIllustThree: function () {
            return this.workWidth < 1100
        }
    },

    created() {
        this.init()
    },

    mounted() {
        // document.getElementsByClassName('author-id')[0].addEventListener('click', () => {
        //
        //     console.log(123)
        //     console.log(clipboard.readText())
        //     clipboard.writeText(this.illust.author_id)
        // })
    },

    methods: {
        init () {
            this.imageSrcDict[this.illust.illust_id] = this.illust.src[0]
            this.changeAuthorInfoPanelStyle()
            this.$ipcRenderer.invoke('get-author-artworks', this.illust.author_id).then(artworks => {
                // console.log(artworks)
                this.artworks = artworks
                this.isInit = true
                this.getAuthorImage()
            })
            this.$ipcRenderer.invoke('get-like-by-id', ['author', this.illust.author_id]).then(res =>
                this.likeAuthor = res ? 1 : 0
            )
        },

        changeLikeAuthor () {
            let params = ['author', this.illust.author_id, this.likeAuthor === 1 ? 'del' : 'add']
            this.$ipcRenderer.invoke('like', params).then(res => {
                if (!res) return
                // this.$message
                this.likeAuthor = 1 - this.likeAuthor
                // if (this.authorButtonType === 'primary') {
                //     this.authorButtonType = 'info'
                //     this.authorButtonIcon =  'el-icon-check'
                //     this.authorButtonText =  '已关注'
                // } else {
                //     this.authorButtonType = 'primary'
                //     this.authorButtonIcon =  'el-icon-plus'
                //     this.authorButtonText =  '加关注'
                // }
            })
        },

        getAuthorImage (illust_id) {
            if (!this.isInit) return
            illust_id = illust_id ? illust_id : this.illust.illust_id
            let imageCount = this.showIllustThree ? 1 : 4
            let index = this.artworks.findIndex(artwork => artwork.illust_id === illust_id)
            this.imageSrc = []

            for (let i = index - imageCount, cnt = 0; i <= index + imageCount; i++, cnt++) {
                this.imageSrc.push({illust_id: null, page_count: null, src: null})
                if (i < 0 || i >= this.artworks.length) continue
                let illust_id = this.artworks[i].illust_id
                if (this.imageSrcDict[illust_id] === undefined) {
                    this.$ipcRenderer.invoke('get-image', this.artworks[i].image_list[0].name).then(image => {
                        this.imageSrcDict[illust_id] = window.URL.createObjectURL(new Blob([image]))
                        this.addImageSrc(cnt, illust_id, this.artworks[i].image_list.length, this.imageSrcDict[illust_id])

                    })
                } else {
                    this.addImageSrc(cnt, illust_id, this.artworks[i].image_list.length, this.imageSrcDict[illust_id])
                }
            }
        },
        addImageSrc (cnt, illust_id, page_count, src) {
            this.imageSrc[cnt].illust_id = illust_id
            this.imageSrc[cnt].page_count = page_count
            this.imageSrc[cnt].src = src
        },

        authorImageStyle (image) {
            return image.illust_id === this.illust.illust_id ? {opacity: 0.4, cursor: null} : null
        },
        authorImageShowButton (image) {
            return image.src && image.illust_id !== this.illust.illust_id
        },
        changeAuthorInfoPanelStyle () {
            let style = {
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'space-between'
            }
            this.authorInfoPanelStyle = this.showIllustThree ? {} : style
        },

        selected (illust_id) {
            if (!illust_id || illust_id === this.illust.illust_id) return
            this.$ipcRenderer.invoke('get-illust-by-id', illust_id).then(illust => {
                this.$ipcRenderer.invoke('get-image', illust.image_list[0].name).then(imgSrc => {
                    if (imgSrc) {
                        this.$set(illust, 'src', [window.URL.createObjectURL(new Blob([imgSrc]))])
                    } else {
                        this.$set(illust, 'src', null)
                    }
                    this.$emit('illustRestart', illust)
                    this.getAuthorImage(illust_id)
                })
            })
        },

        copyId () {
            this.$clipboard.writeText(this.illust.author_id + '')
        },

        searchAuthor () {
            let searchParams = {
                searchMode: 'author',
                keyword: this.illust.author_id
            }
            this.$router.push({ name: 'search', params: searchParams})
        },
    }
}
</script>

<style scoped lang="stylus">
    .pixiv-illust-author
        width 100%
        padding-top 3%
        //padding-left 20px
        //margin-left 1.5%
        padding-right 20px
        margin-right 3%

        .author-info-panel
            width 100%

            .author-info
                //display flex
                //justify-content flex-start
                //align-items flex-end
                padding-bottom 10px

                .author-name
                    font-weight bold
                    color black
                    padding-right 5px
                    text-overflow ellipsis
                    overflow hidden
                    white-space nowrap
                    font-size 17px

                .author-id-panel
                    display flex
                    align-items center
                    cursor pointer
                    width fit-content
                    color rgb(180, 180, 180)

                    .author-id
                        font-size 11px
                        margin-right 3px

                    .author-copy-icon
                        font-size 10px

            .add-like-author
                width 130px
                margin-bottom 40px

        .author-image-text
            display flex
            justify-content space-between
            align-content center
            font-size: 12px
            margin-bottom 10px

            .other-image
                color rgb(92, 92, 92)
                font-weight bold

            .show-more
                font-size 13px
                color rgb(173, 173, 173)
                cursor pointer
                transition color 0.3s ease 0s

                &:hover
                    color rgb(140, 140, 140)

        .author-image-panel
            display flex
            flex-wrap wrap
            justify-content center

            .image-page
                position relative
                width 90px
                height 90px
                margin 3px 3px
                border-radius 8px
                overflow hidden
                border none

                &:hover .image-arrow
                    visibility visible

                .image
                    width 90px
                    height 90px
                    object-fit cover

                .page-count
                    z-index 999
                    position absolute
                    top 0
                    right 0
                    display flex
                    align-items center
                    height 20px
                    color rgb(255, 255, 255)
                    font-weight bold
                    padding 0 6px
                    background rgba(0, 0, 0, 0.32)
                    border-radius 10px
                    font-size 13px
                    margin-top 4px
                    margin-right 4px

                    .el-icon-picture
                        padding-right 2px
                        padding-top 2px
                        font-size 12px

                .image-arrow
                    display flex
                    position absolute
                    background rgba(0, 0, 0, 0.32)
                    top 0
                    left 0
                    width 90px
                    visibility hidden
                    height 90px
                    align-items center
                    justify-content center
                    transition all 0.1s ease 0s
                    cursor pointer

                    img
                        width 22px
                        height 22px

</style>
