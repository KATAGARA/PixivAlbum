<template>
    <div class="collect">
        <el-container id="collect">
            <el-header height="50px">
                <collect-header />
            </el-header>
            <el-main class="main">
                <collect-main />
            </el-main>
        </el-container>
    </div>
</template>

<script>
import CollectHeader from "components/PixivCollect/CollectHeader";
import CollectMain from "components/PixivCollect/CollectMain";

export default {
    name: "PixivCollect",
    components: {CollectMain, CollectHeader },

    data () {
        return {
            radio: false,
        }
    },

    methods: {
        test () {
            this.$ipcRenderer.send('pixiv-collect-test');
        },
    }
}
</script>

<style scoped lang="stylus">
    .collect
        width 100%
        height 100%

        .el-header
            padding 0 10px

        .main
            padding-top 0
</style>
