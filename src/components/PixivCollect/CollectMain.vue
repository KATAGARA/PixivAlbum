<template>
    <div class="collect-main">
        <image-chart class="image-chart-panel"/>
        <collect-progress class="collect-progress-panel"/>
        <d-b-info class="db-info-panel"/>
        <collect-mode-select class="collect-mode-select-panel"/>
    </div>
</template>

<script>
import ImageChart from "components/PixivCollect/CollectComponents/ImageChart";
import CollectProgress from "components/PixivCollect/CollectComponents/CollectProgress";
import CollectModeSelect from "components/PixivCollect/CollectComponents/CollectModeSelect";
import DBInfo from "components/PixivCollect/CollectComponents/DBInfo";

export default {
    name: "CollectMain",
    components: {DBInfo, CollectModeSelect, CollectProgress, ImageChart },

    data () {
        return {

        }
    },

    mounted() {},

    methods: {}
}
</script>

<style scoped lang="stylus">
    .collect-main
        width 100%
        height 100%
        background-color rgb(245, 245, 245)
        display flex
        flex-wrap wrap
        overflow hidden

        .image-chart-panel
            height 46%
            width 48.5%
            margin 1% 0.5% 0.5% 1%

        .collect-progress-panel
            height 46%
            width 48.5%
            margin 1% 1% 0.5% 0.5%

        .db-info-panel
            width 38.5%
            height 49%
            margin 0.5% 0.5% 0.5% 1%


        .collect-mode-select-panel
            width 58.5%
            height 49%
            margin 0.5% 1% 0.5% 0.5%



            //.progress-panel
            //    display flex
            //    justify-content center
            //    align-items center
</style>
