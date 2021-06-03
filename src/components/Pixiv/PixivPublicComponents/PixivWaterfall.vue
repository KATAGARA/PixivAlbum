<!--
 - PixivWaterfall: 瀑布流组件
 - 子组件: PixivImage
 - 功能: PixivImage显示为瀑布流(绝对定位), 根据窗口宽度动态更改[图片位置, 图片列数](绝对定位下), 快速跳转tabs
 -       todo: 快速跳转tabs优化, 图片可以占多行, 最下面有加载动态和没有更多, 无图片时图片为告知信息
 -
 - props: queryData: {mode:[must|= rank, search, like], query:[must| {}]}
 -                   query: mode===rank:   { illustMode:[must|= 'overall', 'illust', 'animation', 'manga'],
 -                                           rankMode:[must|= 'daily', 'weekly', 'monthly', 'rookie', 'original', 'male', 'female'],
 -                                           rankDate:[must| int], isR18:[must|= 1, 0] }
 -                              ===search: {}
 -                              ===like:   {}
 - history:
 -         202008xx--20200816: PixivImage显示为瀑布流(绝对定位), 根据窗口宽度动态更改[图片位置, 图片列数](绝对定位下), 快速跳转tabs
 -                             todo: 快速跳转tabs优化, 图片可以占多行, 最下面有加载动态和没有更多, 无图片时图片为告知信息
 -         20200817: 增加右下角回到顶部按钮
 -->

<template>
    <div class="waterfall" :style="waterfallStyle">
        <slot />
<!--        todo 最后一组没有50个,也显示-->
        <el-tabs :key="elTabsKey" v-model="numTabsValue" class="tabs" :style="{height: `${tabsHeight}px`}" @tab-click="handleTabClick" tab-position="right" >
<!--        <el-tabs v-model="numTabsValue" class="tabs" :style="{height: `300px`}" @tab-click="handleTabClick" tab-position="right" >-->
            <el-tab-pane
                v-for="item in numTabs"
                :key="item.name"
                :label="item.title"
                :name="item.name">
            </el-tab-pane>
        </el-tabs>
        <div
            class="infinite-waterfall"
            v-infinite-scroll="loadMore"
            infinite-scroll-disabled="disabled"
            infinite-scroll-distance="10"
            id="iwf">

            <pixiv-image :id="`image-${index}`" v-for="(item, index) in illustList" :key="item.illust.illust_id" :image-data="item" />
        </div>
        <el-backtop class="backTop" target="#iwf" />
    </div>
</template>

<script>
    import PixivImage from "./PixivImage";

    export default {
        name: "Waterfall",
        components: { PixivImage },

        props: {
            queryData: {
                type: Object,
                required: true,
                validator: function (value) {
                    let haveQuery = Object.keys(value).indexOf('query') !== -1
                    let mode = ['rank', 'search', 'like'].indexOf(value.mode) !== -1
                    return  haveQuery && mode
                }
            }
        },

        data () {
            return {
                loading: false,
                noMore: false,
                page: 0,
                limit: 50,
                illustList: [],
                illustNum: 0,

                cols: undefined,
                topLocation: undefined,
                leftLocation: undefined,
                imgMargin: 7,
                imgMarginBottom: 14,
                imgWidth: 240,
                itemWidth: undefined,
                clientWidth: undefined,
                clientHeight: undefined,
                domWidth: undefined,
                domObserver: undefined,
                tabsHeight: 40,

                waterfallStyle: {
                    height: '100%',
                    width: '100%',
                    'overflow-y': 'visible',
                },

                numTabs: [{title: '0', name: '1'}],
                numTabsValue: '1',
                numTabsFirstImageHeight: [],
                lastHeight: 0,
                elTabsKey: 200,
            }
        },

        computed: {
            disabled: function () {
                return this.loading || this.noMore
            }
        },

        watch: {
            clientWidth: function () {
                if (this.calculateCol() !== this.cols) {
                    this.waterfallInit()
                    this.reCalculateDisplay()
                } else {
                    this.reCalculateLocationLeftAndSet()
                }
            },

            illustList: function () {

                this.numTabs = [{title: '0', name: '1'}]
                for (let i = 1; i <= this.illustList.length / 50; i++) {
                    this.numTabs.push({title: `${i * 50}`, name: `${i + 1}`})
                }
                if (this.illustList.length % 50 !== 0 ) {
                    this.numTabs.push({title: '' + this.illustList.length, name: '' + (this.numTabs.length + 1)})
                }
                let lastHeight = this.tabsHeight
                this.tabsHeight = 40 * this.numTabs.length
                if (this.tabsHeight < lastHeight) this.elTabsKey += 1

                this.numTabsFirstImageHeight = []
                this.numTabs.forEach((v, i) => {
                    let top = i === 0 ? 0 : this.illustList[Number(v.title) - 1].display.top
                    this.numTabsFirstImageHeight.push(top)
                })
            }
        },


        mounted () {
            // let that = this
            // window.onresize =() =>{
            //     return (()=>{
            //         that.windowWidth = document.body.clientWidth;
            //         that.windowHeight = document.body.clientHeight;
            //         console.log(document.body.clientWidth, document.body.clientHeight)
            //     })()
            // };
            this.domObserver = new ResizeObserver(entries => {
                entries.forEach(v => {
                    if (v.target === document.getElementById('iwf')) {
                        this.clientWidth = v.target.clientWidth
                        this.clientHeight = v.target.clientHeight
                    }
                })
            })
            // `iwf${this.$route.name}`
            this.domObserver.observe(document.getElementById('iwf'))

            document.getElementById('iwf').addEventListener('scroll', e => this.handleScroll(e))

            this.init()
        },

        // beforeUpdate () {
        //     this.domObserver.unobserve(document.getElementById(`iwf${this.$route.name}`))
        // },
        //
        // updated () {
        //     this.domObserver.observe(document.getElementById(`iwf${this.$route.name}`))
        // },

        beforeDestroy() {
            this.domObserver.disconnect()
        },

        methods: {
            init () {
                this.clientWidth = document.getElementById('iwf').clientWidth
                this.clientHeight = document.getElementById('iwf').clientHeight
                this.waterfallInit()
                this.loadMore()
            },

            loadMore () {
                this.loading = true
                let loadMessage = this.sendMessage('info', '呼叫小姐姐中', this.clientHeight - 80, 0)

                let params, ipcName
                if (this.queryData.mode === 'rank') {
                    params = {
                        illustMode: this.queryData.query.rankMode[0],
                        rankMode: this.queryData.query.rankMode[1],
                        query: {
                            rank_date: this.queryData.query.rankDate,
                            r18: this.queryData.query.r18,
                        },
                    }
                    ipcName = 'get-rank-with-illust'
                } else if (this.queryData.mode === 'search') {
                    params = {
                        searchMode: this.queryData.query.searchMode,
                        keyword: this.queryData.query.keyword,
                    }
                    ipcName = 'get-search-with-illust'
                } else if (this.queryData.mode === 'like'){
                    ipcName = this.queryData.query.likeMode === 'illust' ? 'get-like-illust-list' : 'get-like-author-list'
                    params = {}
                }
                params.skip = this.page * this.limit
                params.limit = this.limit

                let doneNum = 0
                this.$ipcRenderer.invoke(ipcName, params).then(illusts => {
                    console.log(illusts)
                    if (illusts.length === 0) {
                        loadMessage.close()
                        let noMoreText = this.page === 0 ? '你要求太高了啦!' : '这么多还不够嘛 哼!'
                        this.sendMessage('warning', noMoreText, this.clientHeight - 80)
                        this.noMore = true
                        this.loading = false
                    } else {
                        this.page += 1
                        illusts.forEach((v) => {
                            v['display'] = this.calculateDisplay(v)

                            // let url_original = v.illust.illust_type === 2 ? undefined : v.illust.url_original
                            this.$ipcRenderer.invoke('get-image', v.illust.image_list[0].name).then(imgSrc => {
                                this.illustList.push(v)
                                doneNum++
                                // console.log(imgSrc)
                                if (imgSrc) {
                                    // console.log(v.illust.illust_id, new Blob([imgSrc]))
                                    v.illust.image_list[0].file = imgSrc
                                    this.$set(v.illust, 'src', [window.URL.createObjectURL(new Blob([imgSrc]))])
                                } else {
                                    //    todo 无图片时显示无图片提示图片
                                    // console.log(this.illustList.indexOf(v.illust))
                                    // console.log(this.illustList.findIndex(element => element === v))
                                    this.$set(v.illust, 'src', null)
                                }

                                if (doneNum === illusts.length) {
                                    // this.tabsHeight += 40
                                    this.loading = false
                                    loadMessage.close()
                                    this.sendMessage('success', '来啦 来啦', this.clientHeight - 80)

                                    if (this.queryData.mode === 'rank') {
                                        this.illustList.sort((a, b) => {
                                            return a.rank.rank > b.rank.rank ? 1 : -1
                                        })
                                    }

                                    setTimeout(function (that, illusts) {
                                        for (let i = that.illustNum; i < that.illustList.length; i++) {
                                            if (that.illustList[i].illust.src === null) {
                                                that.illustList.splice(i, 1)
                                                i--
                                            }
                                        }
                                        if (that.illustList.length !== that.illustNum + illusts.length) {
                                            that.waterfallInit()
                                            that.reCalculateDisplay()
                                        }
                                        that.illustNum = that.illustList.length
                                    }, 2000, this, illusts)
                                }
                            })
                        })
                    }
                })
            },

            calculateDisplay (item) {
                let location = this.calculateTopLocation(item.illust.width, item.illust.height)
                return {
                    width: location[0],
                    height: location[1],
                    top: location[2],
                    left: location[3],
                    col: location[4],
                }
            },

            calculateTopLocation (width, height) {
                let newHeight = this.imgWidth / width * height

                let minTop = Math.min.apply(Math, this.topLocation)
                let minTopCol = this.topLocation.indexOf(minTop)

                this.topLocation[minTopCol] += newHeight + this.imgMargin + this.imgMarginBottom

                return [this.imgWidth, newHeight, minTop, this.leftLocation[minTopCol], minTopCol]
            },

            sendMessage (type, message, offset = this.domWidth - 160, duration = 2000) {
                return this.$message({
                    offset: offset,
                    type: type,
                    message: message,
                    duration: duration,
                    center: true,
                    showClose: true,
                })
            },

            handleScroll (e) {
                let height = e.target.scrollTop
                let lastHeight = this.lastHeight
                this.lastHeight = height
                let tabValue = Number(this.numTabsValue) - 1
                if (this.numTabsFirstImageHeight[tabValue + 1] && lastHeight < height) {
                    if (height > this.numTabsFirstImageHeight[tabValue + 1] - 100) {
                        this.numTabsValue = Number(this.numTabsValue) + 1 + ''
                    }
                    return
                }
                if (this.numTabsFirstImageHeight[tabValue] && lastHeight > height) {
                    if (height < this.numTabsFirstImageHeight[tabValue] - 100) {
                        this.numTabsValue = Number(this.numTabsValue) - 1 + ''
                    }
                }
            },

            handleTabClick () {
                let height = undefined
                if (Number(this.numTabsValue) === this.numTabs.length) {
                    height = document.getElementById('iwf').scrollHeight
                } else {
                    let cnt = Number(this.numTabs[Number(this.numTabsValue) - 1].title) - 1
                    height = this.illustList[cnt === -1 ? 0 : cnt].display.top
                }
                document.getElementById('iwf').scrollTo({top: height, behavior: 'smooth'})
            },

            reCalculateLocationLeftAndSet () {
                this.initLeftLocation()
                this.illustList.forEach((v) => {
                    v.display.left = this.leftLocation[v.display.col]
                })
                this.$forceUpdate()
            },

            reCalculateDisplay () {
                this.loading = true
                // let loadMessage = this.sendMessage('info', '小姐姐的大厦装修中', this.windowHeight - 100, 0)

                // console.log(this.topLocation, this.leftLocation)
                for (let i = 0; i < this.illustList.length; i++) {
                    // console.log(this.illustList[i].illust.illust_id, this.illustList[i].rank.rank)
                    this.illustList[i].display = this.calculateDisplay(this.illustList[i])
                }
                // this.illustList.forEach((v) => {
                //     v.display = this.calculateDisplay(v)
                //     // console.log(v)
                // })

                this.loading = false
                // loadMessage.close()
                // this.sendMessage('success', '完成啦', this.windowHeight - 100)
            },

            waterfallInit () {
                this.cols = this.calculateCol()
                this.topLocation = new Array(this.cols).fill(0)
                this.itemWidth = this.imgWidth + this.imgMargin * 2
                this.initLeftLocation()
            },

            calculateCol () {
                return this.clientWidth >= 1645 ? 5 : (this.clientWidth >= 1265 ? 4 : 3)
            },

            initLeftLocation () {
                this.domWidth = this.cols * this.itemWidth
                let windowWidth = document.getElementsByClassName("waterfall")[0].clientWidth
                let firstLeft =  (windowWidth - this.itemWidth * this.cols) / 2 + this.imgMargin
                this.leftLocation = [...Array(this.cols)].map((e, i) => firstLeft + this.itemWidth * i)
            },

            // test () {
            //
            // }
        }
    }
</script>

<style scoped lang="stylus">
    .infinite-waterfall
        position relative
        width 100%
        height 100%
        overflow-y auto

        //&::-webkit-scrollbar
        //    display none
    .tabs
        position absolute
        z-index 999
        //height 300px
        right 4%
        top 100px

    .backTop
        right 6% !important
        bottom 7% !important

    ::-webkit-scrollbar-thumb
        background-color #E2264D
        color #E2264D
</style>
