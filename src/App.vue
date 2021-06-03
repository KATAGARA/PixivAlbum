<template>
    <div id="app">
        <el-container class="page-container">
            <el-aside width="65px">
                <left-side />
            </el-aside>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import LeftSide from "./components/LeftSide/LeftSide";

    export default {
        components: {
            LeftSide
        },
        name: 'App',
        data () {
            return {

            }
        },
        mounted () {
            this.$ipcRenderer.on('main-mes', (e, msg) => {
                console.log(msg)
            })
        },
        methods: {},
        provide: {}
    }
</script>

<style lang="stylus">
    body
        overflow hidden

    html, body, #app
        width 100%
        height 100%
        user-select none

    .el-container
        width 100%
        height 100%

    .el-aside, .el-main
        height 100%

    .el-container .el-main
        padding 10px 0 0 0

    .more-action-panel
         padding 5px 0 5px 0 !important

         .more-action
             display flex
             align-items center
             font-size 13px
             cursor pointer
             height 40px
             padding 8px 5px 8px 15px
             transition background-color 0.3s ease 0s

             &:hover
                 background rgba(0, 0, 0, 0.04)
</style>
