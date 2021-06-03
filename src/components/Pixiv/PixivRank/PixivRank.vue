<!--
 - PixivRank 显示排行榜: { 综合: [日[R18], 周[R18], 月, 新人, 原创, 受男生欢迎[R18], 受女生欢迎[R18]],
                          插画: [日[R18], 周[R18], 月, 新人],
                          动图: [日[R18], 周[R18]],
                          漫画: [日[R18], 周[R18], 月, 新人] }
 - 子组件: PixivWaterfall, PixivSelectRank
 - 功能:
 -
 -
 -
 -->

<template>
    <div class="pixiv-rank">
        <pixiv-waterfall :key="key" :query-data="queryData">
            <pixiv-select-rank class="select-rank" :query="queryData.query" @restart="restart" />
        </pixiv-waterfall>
    </div>
</template>

<script>
    import PixivWaterfall from "components/Pixiv/PixivPublicComponents/PixivWaterfall";
    import PixivSelectRank from "components/Pixiv/PixivRank/PixivSelectRank";
    import dayjs from 'dayjs'
    import {RouteEnterAndLeave} from "components/Pixiv/Mixins/RouteEnterAndLeave";

    export default {
        name: "PixivRank",
        mixins: [RouteEnterAndLeave],
        components: {
            PixivWaterfall,
            PixivSelectRank,
        },
        data () {
            return {
                key: 0,
                queryData: {
                    mode: 'rank',
                    query: {
                        rankMode: undefined,
                        rankDate: undefined,
                        r18: undefined,
                    }
                },
                scrollTop: 0,
            }
        },

        created () {
            this.init()
        },

        mounted() {
        },

        // beforeRouteLeave (to, from, next) {
        //     this.scrollTop = document.getElementsByClassName('infinite-waterfall')[0].scrollTop
        //     if (to.name === 'illust') {
        //         let fromName = from.name === 'rank' ? 'PixivRank' : (from.name === 'search' ? 'PixivSearch' : 'PixivLike')
        //         console.log(fromName)
        //         this.$store.commit('setKeepAliveList', [fromName])
        //     } else {
        //         this.$destroy()
        //         this.$store.commit('setKeepAliveList', [])
        //     }
        //     next()
        // },

        // beforeRouteEnter (to, from, next) {
        //     next(vm => {
        //         vm.$store.commit('setKeepAliveList', ['PixivRank'])
        //         document.getElementsByClassName('infinite-waterfall')[0].scrollTop = vm.scrollTop
        //     })
        // },

        methods: {
            init () {
                this.queryData.query.rankMode = ['illust', 'daily']
                let offset = dayjs().hour() >= 12 ? -1 : -2
                this.queryData.query.rankDate = Number(dayjs().add(offset, 'day').format('YYYYMMDD'))
                this.queryData.query.r18 = 0
            },

            restart () {
                this.key += 1
            }
        }
    }
</script>

<style scoped lang="stylus">
    .pixiv-rank
        height 100%
        width 100%

        .select-rank
            position absolute
            z-index 999
            right 6%
            bottom 15%
</style>
