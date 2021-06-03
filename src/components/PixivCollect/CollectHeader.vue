<template>
    <div class="collect-header">
        <el-row type="flex" align="middle" justify="space-between">
            <el-col :span="2">
                <!--                todo 点击软件重新加载解决-->
                <a class="pixiv-logo" href="/">
                    <img :src="require('../../assets/' + pixivSvgName)" @mouseover="pixivConnectTest" alt>
                </a>
            </el-col>

            <el-col class="title-buttons" :span="2">
                <i class="el-icon-minus" @click="minimize"></i>
                <i class="el-icon-full-screen" @click="maximize"></i>
                <i class="el-icon-close" @click="close"></i>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "CollectHeader",

    data () {
        return {
            pixivSvgName: 'pixiv_gray.svg',
        }
    },
    mounted() {
        // let that = this
        this.$ipcRenderer.send('get-pixiv-connect')
        // this.$ipcRenderer.on('pixiv-svg-change', () => {
        //     that.pixivSvgName = that.pixivSvgName === 'pixiv.svg' ? 'pixiv_gray.svg' : 'pixiv.svg'
        // })
        this.$ipcRenderer.on('return-pixiv-connect', (e, connect) => {
            this.pixivSvgName = connect ? 'pixiv.svg' : 'pixiv_gray.svg'
        })
    },
    methods: {
        pixivConnectTest () {
            console.log(123)
            this.$ipcRenderer.send('pixiv-connect-test')
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
    .collect-header
        -webkit-app-region drag

    .pixiv-logo
        display inline-block
        -webkit-app-region no-drag

    .option-left
        float left

    .option-right
        float right
        color #8492a6
        font-size 12px
        padding-right 17px

    .title-buttons
        display flex
        justify-content flex-end
        align-items center
        margin-bottom 20px

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
