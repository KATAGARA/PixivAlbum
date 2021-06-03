<template>
    <div class="pixiv-header">
        <el-row type="flex" align="middle" justify="space-between">
            <el-col :span="4">
<!--                todo 点击软件重新加载解决-->
                <a class="pixiv-logo" href="/">
                    <img :src="require('../../assets/' + pixivSvgName)" alt>
                </a>
            </el-col>

            <el-col :span="15">
<!--                todo tags时变为el-select 创建条目 远程搜索 自定义模板.....-->
<!--                <el-autocomplete-->
<!--                        v-model="searchParams.keywords"-->
<!--                        :fetch-suggestions="handleSuggestions"-->
<!--                        :maxlength="30"-->
<!--                        class="input-with-select"-->
<!--                        placeholder="搜索作品"-->
<!--                        @keyup.enter.native="handleSearch"-->
<!--                        @select="handleSearch"-->
<!--                        clearable-->
<!--                >-->
<!--                    <el-select slot="prepend" v-model="searchParams.searchMode">-->
<!--                        <el-option-->
<!--                                v-for="item in searchOption"-->
<!--                                :key="item.value"-->
<!--                                :label="item.label"-->
<!--                                :value="item.value"-->
<!--                        ></el-option>-->
<!--                    </el-select>-->
<!--                    <el-button slot="append" icon="el-icon-search" />-->
<!--                </el-autocomplete>-->

                <div class="search-bar">
                    <el-select class="search-mode-select" v-model="searchMode">
                        <el-option
                            v-for="item in searchOption"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>

                    <el-select
                        class="search-keywords-select"
                        v-model="keywords"
                        ref="keywordsSelect"
                        placeholder="请输入关键词"
                        :loading="loading"
                        :remote-method="handleSuggestions"
                        @keyup.enter.native="handleSearch"
                        @keyup.ctrl.83.native="handleSearch"
                        multiple filterable remote
                        clearable reserve-keyword>
                        <template v-if="searchSuggestions[1] && searchSuggestions[1].label === '搜索建议'">
                            <el-option
                                :label="`ID-${searchSuggestions[0].label}`"
                                :value="`ID-${searchSuggestions[0].label}`"
                                @click.native="handleID(searchMode, Number(searchSuggestions[0].label))">
                                <span class="option-left">{{ searchSuggestions[0].text + 'ID:  ' + searchSuggestions[0].label }}</span>
                                <span class="option-right">查看{{ searchSuggestions[0].text }}</span>
                            </el-option>
                            <el-option-group label="搜索建议">
                                <el-option
                                    v-for="item in searchSuggestions[1].options"
                                    :key="item.key"
                                    :label="item.label"
                                    :value="item.label">
                                    <span class="option-left">{{ item.label }}</span>
                                    <span class="option-right">{{ item.count }}</span>
                                </el-option>
                            </el-option-group>
                        </template>
                        <template v-else>
                            <el-option
                                v-for="item in searchSuggestions"
                                :key="item.key"
                                :label="item.label"
                                :value="item.label">
                                <span class="option-left">{{ item.label }}</span>
                                <span class="option-right">{{ item.count }}</span>
                            </el-option>
                        </template>
                    </el-select>

                    <el-button class="search-button" @click="handleSearch" icon="el-icon-search" />
                </div>
            </el-col>

            <el-col class="title-buttons" :span="4">
<!--                <font-awesome-icon class="awesome-icon" :icon="['fas', 'times']"/>-->
                <i class="el-icon-minus" @click="minimize"></i>
                <i class="el-icon-full-screen" @click="maximize"></i>
                <i class="el-icon-close" @click="close"></i>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    // import PixivSvg from 'src/assets/pixiv.svg'
    import eventBus from '@/utils/eventBus'

    export default {
        name: "PixivHeader",
        // components: { PixivSvg },
        data () {
            return {
                keywords: [],
                searchMode: 'tag',
                searchOption: [
                    { label: "插画", value: "tag"},
                    { label: "动图", value: "ugoira"},
                    { label: "画师", value: "author"},
                ],

                pixivSvgName: 'pixiv.svg',
                searchSuggestions: [],
                loading: false,
            }
        },

        methods: {
            handleSuggestions (query) {
                if (query === '') {
                    this.searchSuggestions = []
                    return
                }
                this.loading = true
                let params = {
                    searchMode: this.searchMode,
                    keywords: query
                }
                this.$ipcRenderer.invoke('get-suggestions', params).then(res => {
                    if (!isNaN(Number(query))) {
                        this.searchSuggestions = [
                            {
                                text: this.searchMode === 'author' ? ' 画师': '作品',
                                label: query,
                            }, {
                                label: '搜索建议',
                                options: res
                            }
                        ]
                    } else {
                        this.searchSuggestions = res
                    }
                    this.loading = false
                })
            },

            handleSearch (e) {
                let keyword = undefined
                for (let i = 0; i < this.keywords.length; i++) {
                    if (this.keywords[i].startsWith('ID-')) {
                        this.handleID(this.searchMode, Number(this.keywords[i].split('-')[1]))
                        this.$refs.keywordsSelect.query = ''
                        this.$refs.keywordsSelect.blur()
                        return
                    }
                }
                if (e.ctrlKey === true && e.code === 'KeyS') {
                    keyword = this.keywords
                } else {
                    if (this.searchMode === 'author') return
                    let keywordSelect = this.$refs.keywordsSelect.query
                    if (this.keywords.length === 0 && keywordSelect.trim()) {
                        keyword = keywordSelect
                    }
                }
                if (!keyword) return

                this.$refs.keywordsSelect.blur()
                let searchParams = {
                    searchMode: this.searchMode,
                    keyword: keyword
                }

                if (this.$route.path === '/pixiv/search') {
                    eventBus.$emit('restart-search', searchParams)
                } else {
                    this.$router.push({ name: 'search', params: searchParams})
                }
            },

            handleID (searchMode, id) {
                if (searchMode !== 'author') {
                    this.$ipcRenderer.invoke('get-illust-by-id', id).then(illust => {
                        if (illust !== '' && illust.image_list.length !== 0) {
                            this.$ipcRenderer.invoke('get-image', illust.image_list[0].name).then(imgSrc => {
                                if (imgSrc) {
                                    illust.src = [window.URL.createObjectURL(new Blob([imgSrc]))]
                                    if (this.$route.path === '/pixiv/illust') {
                                        eventBus.$emit('restart-illust', illust)
                                    } else {
                                        this.$router.push({name: 'illust', params: {illust: illust}})
                                    }
                                } else {
                                    this.$message({ message: '此作品未保存图片', center: true, type: 'error' })
                                }
                            })
                        } else {
                            this.$message({ message: '此作品不存在', center: true, type: 'error' })
                        }
                    })
                } else {
                    let searchParams = {
                        searchMode: 'author',
                        keyword: id
                    }
                    if (this.$route.path === '/pixiv/search') {
                        eventBus.$emit('restart-search', searchParams)
                    } else {
                        this.$router.push({ name: 'search', params: searchParams})
                    }
                }
            },

            minimize () {
                this.$ipcRenderer.send('user-minimize')
            },
            maximize () {
                this.$ipcRenderer.send('user-maximize')
            },
            close () {
                this.$ipcRenderer.send('user-close')
            }
        }
    }
</script>

<style scoped lang="stylus">
    //todo 可拖动, 其他功能正常
    .pixiv-header
        -webkit-app-region drag

    .pixiv-logo
        display inline-block
        -webkit-app-region no-drag

    .input-with-select
        -webkit-app-region no-drag

    .search-bar
        display flex
        align-items center
        justify-content center

    .search-mode-select
        -webkit-app-region no-drag
        width 75px
        /deep/ .el-input__inner
            border-bottom-right-radius 0
            border-top-right-radius 0
            border-right none

    .search-keywords-select
        -webkit-app-region no-drag
        // todo
        width 300px
        /deep/ .el-input__inner
            border-radius 0

    .search-button
        -webkit-app-region no-drag
        border-left none
        padding-top 9px
        padding-bottom 9px
        background-color #F5F7FA
        border-top-left-radius 0
        border-bottom-left-radius 0

    .title-buttons
        display flex
        justify-content flex-end
        align-items center
        margin-bottom 20px
        //margin-right 2px

    .option-left
        max-width 200px
        overflow hidden
        text-overflow ellipsis
        float left

    .option-right
        float right
        color #8492a6
        font-size 12px
        padding-right 17px

    // todo 动画渐变, 不突兀
    .el-icon-full-screen, .el-icon-minus, .el-icon-close
        //padding-right 12px
        -webkit-app-region no-drag
        color #73a8ff
        transition: color 0.3s ease 0s

        &:hover
            color #409EFF
            font-weight bold

    .el-icon-minus, .el-icon-close
        font-size 21px

    .el-icon-full-screen
        font-size 16px
        padding 0 12px

    .el-row
        width 100%
        padding 0 10px

    .el-autocomplete
        width 100%

    //.el-select
    //    width 80px

    /deep/ .el-icon-search
        color #409EFF
        font-size 20px
</style>
