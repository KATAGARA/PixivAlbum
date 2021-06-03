<template>
    <div class="pixiv">
        <el-container id="pixiv">
            <el-header height="50px">
                <pixiv-header />
            </el-header>
            <el-main class="main">
<!--                <keep-alive>-->
<!--                    <router-view :key="$route.fullPath" v-if='$route.meta.keepAlive'></router-view>-->
<!--                </keep-alive>-->
<!--                <router-view v-if='!$route.meta.keepAlive'></router-view>-->
<!--                <keep-alive include="PixivRank,PixivLike,PixivSearch">-->
                <keep-alive :include="includeList">
                    <router-view />
                </keep-alive>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import PixivHeader from "../components/Pixiv/PixivHeader";

    export default {
        components: {
            PixivHeader,
        },
        name: "Pixiv",

        computed: {
            includeList: function () {
                return this.$store.state.keepAliveList
            }
        },
    }
</script>

<style scoped lang="stylus">
    .pixiv
        width 100%
        height 100%

    .el-header
        padding 0 10px

    .main
        padding-top 0

</style>
