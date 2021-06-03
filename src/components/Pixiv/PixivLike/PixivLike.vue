<template>
    <div class="pixiv-like">
        <pixiv-waterfall :key="key" :query-data="queryData"/>
    </div>
</template>

<script>
import PixivWaterfall from "components/Pixiv/PixivPublicComponents/PixivWaterfall"
import {RouteEnterAndLeave} from "components/Pixiv/Mixins/RouteEnterAndLeave";
import eventBus from "@/utils/eventBus";

export default {
    name: "PixivLike",
    mixins: [RouteEnterAndLeave],
    components: {
        PixivWaterfall
    },

    data () {
        return {
            key: 10000,
            queryData: {
                mode: 'like',
                query: {
                    likeMode: this.$route.params.likeMode,
                }
            },
            scrollTop: 0,
        }
    },

    watch: {
        // $route(to,from){
        //     if (to.path !== from.path) {
        //         this.queryData.query.likeMode = to.params.likeMode
        //         this.restart()
        //     }
        //     // console.log(from, to)
        // }
    },

    created () {
        this.queryData.query.likeMode = this.$route.params.likeMode
    },

    mounted() {
        eventBus.$on('restart-like', (params) => {
            this.queryData.query.likeMode = params.likeMode
            this.key += 1
        })
    },

    // beforeRouteLeave (to, from, next) {
    //     console.log(to)
    //     if (to.name === 'illust') {
    //         let fromName = from.name === 'rank' ? 'PixivRank' : (from.name === 'search' ? 'PixivSearch' : 'PixivLike')
    //         console.log(fromName)
    //         this.$store.commit('setKeepAliveList', [fromName])
    //     } else {
    //         this.$destroy()
    //         this.$store.commit('setKeepAliveList', [])
    //     }
    //     this.scrollTop = document.getElementsByClassName('infinite-waterfall')[0].scrollTop
    //     next()
    // },
    //
    // beforeRouteEnter (to, from, next) {
    //     next(vm => {
    //         vm.$store.commit('setKeepAliveList', ['PixivLike'])
    //         document.getElementsByClassName('infinite-waterfall')[0].scrollTop = vm.scrollTop
    //     })
    // },
}
</script>

<style scoped lang="stylus">
    .pixiv-like
        height 100%
        width 100%
</style>
