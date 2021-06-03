<template>
    <div class="pixiv-illust-work-info">
        <div class="info-main" :style="{width: '60%'}">
            <div class="info-title-id">
                <div class="info-title">{{ illust.illust_title }}</div>
<!--                <div class="info-id" @click="copyId">id:{{ illust.illust_id }}</div>-->
                <div class="info-id-panel" @click="copyId">
                    <div class="info-id">id:{{ illust.illust_id }}</div>
                    <font-awesome-icon class="info-copy-icon" :icon="['fas', 'copy']"/>
                </div>
            </div>
            <div class="description-panel" v-if="illust.description">
                <div class="info-description" v-html="illust.description" :style="dctIsOpen ? null : dctIsStyle"></div>
                <button class="btn-more" v-show="!dctIsOpen" @click="dctIsOpen = !dctIsOpen">查看更多</button>
                <button class="btn-pack-up" v-show="dctIsOpen" @click="dctIsOpen = !dctIsOpen">收起</button>
            </div>
            <div class="info-tags">
                <template v-for="(tag, index) in this.illust.tags">
                    <a class="info-tag" :key="tag" :style="index === 0 ? firstTagStyle : undefined" @click="searchTag(tag)">#{{tag}}</a>
                </template>
            </div>
            <div class="info-count">
                <template v-for="item in infoPanelIcons">
                    <font-awesome-icon :key="item.icon" :icon="['fas', item.icon]" class="icon-image"/>
                    <span :key="item.icon + '1'" class="icon-text">{{ item.count }}</span>
                </template><br/>
            </div>
            <div class="info-date">{{this.updateTime}}</div>
        </div>
    </div>
</template>

<script>

export default {
    name: "PixivIllustInfo",

    props: {
        illust: {
            type: Object,
            required: true,
        },
    },

    data () {
        return {
            dctIsOpen: false,
            dctIsStyle: {
                maxHeight: '120px'
            },
            firstTagStyle: {},
            imageHeight: [],
            updateTime: undefined,

            infoPanelIcons: [
                {icon: 'heart', count: this.illust.like_count},
                {icon: 'star', count: this.illust.bookmark_count},
                {icon: 'eye', count: this.illust.view_count}
            ],
        }
    },

    computed: {
        // infoMaxWidth: function () {
        //     return this.infoDomWidth * 2 / 3 + 'px'
        // }
    },

    created() {
        if (this.illust.tags[0] === '原创' || this.illust.tags[0] === 'オリジナル' ) {
            this.firstTagStyle = { fontWeight: 'bold' }
        }
        this.updateTime = this.timeFormat(this.illust.upload_date)
    },

    methods: {
        timeFormat(time) {
            let date = time.split('T')[0].split('-')
            let time_t = time.split('T')[1].split('+')[0].split(':')
            let hour = Number(time_t[0]) + 8
            let min = Number(time_t[1])
            return date[0] + '年' + date[1] + '月' + date[2] + '日' + hour + '点' + min + '分'
        },

        searchTag (tag) {
            let searchParams = {
                searchMode: 'tag',
                keyword: tag
            }
            this.$router.push({ name: 'search', params: searchParams})
        },

        copyId () {
            this.$clipboard.writeText(this.illust.illust_id + '')
        },
    }
}
</script>

<style scoped lang="stylus">
    .pixiv-illust-work-info
        display flex
        align-items center
        justify-content center
        padding-top 20px
        background-color white

        .info-main
            margin-bottom 30px
            .info-title-id
                display flex
                justify-content space-between
                align-items baseline
                margin-bottom 10px

                .info-title
                    color black
                    font-size 23px
                    font-weight bold
                    text-overflow ellipsis
                    overflow hidden
                    white-space nowrap

                .info-id-panel
                    display flex
                    align-items center
                    cursor pointer
                    width fit-content
                    color rgb(180, 180, 180)

                    .info-id
                        font-size 11px
                        margin-right 3px

                    .info-copy-icon
                        font-size 10px

            .description-panel
                position relative
                margin-bottom 12px

                .info-description
                    overflow-y hidden
                    overflow-x hidden
                    line-height 15px
                    padding-bottom 25px

                .btn-more, .btn-pack-up
                    position absolute
                    bottom 0
                    right 0
                    overflow hidden
                    outline none
                    border none
                    background-color rgb(255, 255, 255)
                    color rgb(173, 173, 173)
                    line-height 18px
                    font-weight normal
                    cursor pointer
                    transition color 0.3s ease 0s

                    &:hover
                        color rgb(140, 140, 140)

                .btn-more
                    top 100px

            .info-tags
                margin-bottom 10px

                .info-tag
                    margin-right 12px

            .info-count
                display flex
                align-items center
                margin-bottom 5px

                .icon-image
                    color rgb(204, 204, 204)
                    margin-right 5px

                .icon-text
                    color rgb(204, 204, 204)
                    font-size 13px
                    margin-right 10px

            .info-date
                font-size 13px
                color rgb(190, 190, 190)
</style>
