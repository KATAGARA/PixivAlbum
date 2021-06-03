<!--
 - PixivImage: 显示image的统一组件
 - 功能: 显示图片, 显示page_count, 弹出infoPanel->{显示xxx_count, 显示tags}
 -       todo: like, 触碰反馈, 弹出infoPanel{动态位置, 动态宽度}->{count栏三列居中, tag可双击跳搜索, 显示rank信息, diver颜色}
 -
 - props: imageData: {illust:[must], display:[must], rank:}
 -                   illust: {见: api -> pixiv -> mongodb -> query.js -> getIllustByID, src:[must]} (很多字段传入了但不需要)
 -                   display: {width:, height:, top:, left:, col:, [all->must]}
 -                   rank: {illust_id:, rank_date:[must], rank:[must], yes_rank:[must]}
 -->

<template>
    <div
        class="pixiv-image"
        @click="openIllustDetail()"
        :style="showStyle"
    >
        <el-popover
            trigger="hover"
            :placement="popoverPlacement"
            v-model="infoPanelVisible"
            :open-delay="250"
            :width="width" >
            <div>
                <div class="count-panel">
                    <div :key="item.icon" v-for="item in infoPanelIcons" class="one-count">
                        <font-awesome-icon
                            class="awesome-icon"
                            :icon="['fas', item.icon]"
                            :style="{'color':item.color}"/>
                        <span class="icon-text">{{ item.count }}</span>
                    </div>
                </div>
                <hr class="diver-1"/>
                <div class="rank-info" v-if="imageData.rank">
                    <div class="rank-panel">
                        <span class="rank-text">#{{imageData.rank.rank}}</span>
                        <font-awesome-icon
                            class="rank-icon"
                            v-if="rankIcon"
                            :icon="['fas', rankIcon]"
                            :style="{'color': rankIconColor}"/>
                        <span class="first-show-text" v-if="!imageData.rank.yes_rank">首次登场</span>
                    </div>
                    <span class="yes-rank-text" v-if="imageData.rank.yes_rank">之前 #{{imageData.rank.yes_rank}}</span>
                </div>
                <hr class="diver-2" v-if="imageData.rank"/>
                <div class="tags">
                    <el-tag
                        class="tag"
                        v-for="tag in imageData.illust.tags"
                        :key=tag size="mini"
                        @click="searchTag(tag)"
                    >{{ tag }}</el-tag>
                </div>
            </div>
            <div class="image-content" slot="reference">
                <div v-if="showSkeleton">
                    <div class="skeleton-info">
                        <a-icon class="skeleton-error" v-if="showSkeletonError" type="frown" theme="twoTone" two-tone-color="#daa348" />
                        <a-icon class="skeleton-loading" v-else type="loading" />
                        <p class="skeleton-message" v-if="showSkeletonError">似乎出了点问题呢</p>
                        <p class="skeleton-message" v-if="showSkeletonError">那我走啦</p>
                    </div>
                    <vue-skeleton-loader
                        :width="imageData.display.width"
                        :height="imageData.display.height"
                        animation="fade"/>
                </div>
                <img
                    class="image"
                    :src="imageData.illust.src[0]"
                    v-if="!showSkeleton"
                    alt>
                <div v-if="imageData.illust.page_count > 1" class="page-count" v-show="!showSkeleton">
                    <i class="el-icon-picture"></i>
                    <span>{{ imageData.illust.page_count }}</span>
                </div>
                <font-awesome-icon v-if="imageData.illust.illust_type === 2" class="play-icon" :icon="['fas', 'play']"/>
                <like class="like-btn" :like="imageData.illust.is_like" @handleLike="handleLike" />
            </div>
        </el-popover>
    </div>
</template>

<script>
    import Like from "components/Pixiv/PixivPublicComponents/Like";
    import VueSkeletonLoader from 'skeleton-loader-vue';
    import eventBus from "@/utils/eventBus";

    export default {
        name: "PixivImage",
        components: { VueSkeletonLoader, Like },
        props: {
            imageData: {
                type: Object,
                required: true,
                validator: function (value) {
                    let keys = Object.keys(value)
                    return keys.indexOf('illust') !== -1 && keys.indexOf('display') !== -1
                }
            },
        },
        data () {
            return {
                infoPanelVisible: false,
                popoverPlacement: 'left', //todo:动态位置
                width: 250, //todo: 是否动态? 待考虑
                infoPanelIcons: [
                    {icon: 'heart', color: '#EC4B62', count: this.imageData.illust.like_count},
                    {icon: 'star', color: '#f5dd00', count: this.imageData.illust.bookmark_count},
                    {icon: 'eye', color: 'deepskyblue', count: this.imageData.illust.view_count}
                ],
                rankIcon: undefined,
                rankIconColor: undefined,
                testClass: null,
                // showStyle: {
                //     width: this.imageData.display.width + 'px',
                //     height: this.imageData.display.height + 'px',
                //     left: this.imageData.display.left + 'px',
                //     top: this.imageData.display.top + 'px',
                // }
            }
        },
        computed: {
            showSkeleton: function () {
                return this.imageData.illust.src === undefined || this.imageData.illust.src === null
            },
            showSkeletonError: function () {
                return this.imageData.illust.src === null
            },
            showStyle: function () {
                return {
                    width: this.imageData.display.width + 'px',
                    height: this.imageData.display.height + 'px',
                    left: this.imageData.display.left + 'px',
                    top: this.imageData.display.top + 'px',
                }
            }
        },

        created () {
            if (this.imageData.rank) {
                let rank = this.imageData.rank.rank
                let yesRank = this.imageData.rank.yes_rank
                if (yesRank === 0) {
                    this.rankIcon = undefined
                    this.rankIconColor = undefined
                } else if (yesRank - rank >= 20) {
                    this.rankIcon = 'angle-double-up'
                    this.rankIconColor = '#f50057'
                } else if (yesRank === rank) {
                    this.rankIcon = 'angle-right'
                    this.rankIconColor = '#ff9800'
                } else {
                    this.rankIcon = 'angle-up'
                    this.rankIconColor = '#35baf6'
                }
            }
        },

        methods: {
            openIllustDetail() {
                this.infoPanelVisible = false
                // this.$router.push({path: '/pixiv/illust'})
                this.$router.push({name: 'illust', params: {illust: this.imageData.illust}})
            },
            handleLike () {
                let params = ['illust', this.imageData.illust.illust_id, this.imageData.illust.is_like ? 'del' : 'add']
                this.$ipcRenderer.invoke('like', params).then(res => {
                    if (!res) return
                    // this.$message
                    this.imageData.illust.is_like = !this.imageData.illust.is_like
                })
            },

            searchTag(tag) {
                let searchParams = {
                    searchMode: 'tag',
                    keyword: tag
                }
                if (this.$route.path === '/pixiv/search') {
                    eventBus.$emit('restart-search', searchParams)
                } else {
                    this.$router.push({ name: 'search', params: searchParams})
                }
            },
        }
    }
</script>

<style scoped lang="stylus">
    .pixiv-image
        position absolute
        cursor pointer

        &:hover .play-icon
            opacity 0.8

        .image-content
            width 100%
            height 100%
            border-radius 20px
            overflow hidden

            &:hover img
                transform scale(1.15)

            img
                width 100%
                height 100%
                transition transform 0.5s ease

            .skeleton-info
                width 150px
                height 100px
                position absolute
                left 50%
                top 50%
                transform translate(-50%, -50%)

            .skeleton-error, .skeleton-loading
                display block
                font-size 50px

            .skeleton-error
                color #daa348

            .skeleton-loading
                color #409EFF

            .skeleton-message
                text-align center
                margin-top 10px

            .page-count
                position absolute
                display inline-block
                top 8px
                right 5px
                color white
                background-color: #00000080;
                padding: 2px;
                border-radius: 6px;

                .el-icon-picture
                    vertical-align middle
                    font-size 15px
                    margin 2px

                span
                    font-weight bold
                    margin 2px
                    font-size 12px

            .play-icon
                position absolute
                top 50%
                left 50%
                transform translate(-50%,-50%)
                //bottom 50%
                //right 50%
                font-size 50px
                color darkgray
                opacity 0.6

            .like-btn
                position absolute
                right 0
                bottom 0
                cursor pointer

    .count-panel
        display flex
        justify-content space-around
        align-content center

        .one-count
            display flex
            align-items center

            .icon-text
                font-size 12px
                text-align center

    .rank-info
        display flex
        justify-content space-around
        align-content center

        .rank-panel
            display flex
            align-items center

            .rank-text
                font-weight bold
                font-size 15px
                margin-right 5px

            .rank-icon
                font-size 18px

            .first-show-text
                color tomato
                font-size 11px

        .yes-rank-text
            font-size 11px
            display flex
            align-items center
            color rgb(173, 173, 173)


    .tags
        display flex
        flex-wrap wrap
        justify-content center

        .tag
            margin: 2px
            cursor pointer

    /deep/ .el-popover
        border-radius 10px

    .diver-1, .diver-2
        background-color #5aafff
        border none
        height 1px

    .diver-1
        margin-bottom 5px

    .diver-2
        margin-top 5px

    .awesome-icon
        margin-right 3px
        font-size 16px

</style>
