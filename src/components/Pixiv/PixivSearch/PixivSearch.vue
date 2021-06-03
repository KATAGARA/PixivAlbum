<template>
    <div class="pixiv-search">
        <pixiv-waterfall :key="key" :query-data="queryData">
        </pixiv-waterfall>
    </div>
</template>

<script>
    import PixivWaterfall from "components/Pixiv/PixivPublicComponents/PixivWaterfall"
    import eventBus from "@/utils/eventBus";
    import {RouteEnterAndLeave} from "components/Pixiv/Mixins/RouteEnterAndLeave";

    export default {
        name: "PixivSearch",
        mixins: [RouteEnterAndLeave],
        components: {
            PixivWaterfall
        },

        data () {
            return {
                key: 10000,
                queryData: {
                    mode: 'search',
                    query: {
                        searchMode: undefined,
                        keyword: undefined,
                    }
                },
                scrollTop: 0,
            }
        },

        // beforeRouteLeave (to, from, next) {
        //     this.scrollTop = document.getElementsByClassName('infinite-waterfall')[0].scrollTop
        //     next()
        // },
        //
        // beforeRouteEnter (to, from, next) {
        //     next(vm => {
        //         document.getElementsByClassName('infinite-waterfall')[0].scrollTop = vm.scrollTop
        //     })
        // },

        beforeDestroy() {
            eventBus.$off('restart-search')
        },

        created () {
            // this.queryData.query = this.$store.state.searchParams
            this.queryData.query = this.$route.params
        },

        mounted() {
            eventBus.$on('restart-search', (params) => {
                this.queryData.query = params
                this.key += 1
            })
        }
    }
</script>

<style scoped lang="stylus">
    .pixiv-search
        height 100%
        width 100%
</style>
