<template>
    <div class="db-info-panel" :key="key" v-loading="dbInfoLoading" :element-loading-text="loadingText" :element-loading-spinner="loadingIcon">
        <template v-for="info in DBInfo">
            <div :key="info.title" class="info-panel">
                <span class="info-title">{{ info.title }}</span>
                <div class="info-data">
                    <template v-for="data in info.data">
                        <div class="data-one" :key="data.name">
                            <span class="data-name">{{ data.name }}</span>
                            <div>
                                <span class="data-value">{{ data.value }}</span>
                                <span v-if="data.unit" class="data-value">{{ data.unit }}</span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    name: "DBInfo",

    data () {
        return {
            key: 'dbInfo',
            dbName: 'Pixiv',
            DBInfo: [],
            dbInfoLoading: true,
            loadingIcon: undefined,
            loadingText: '加载中',
        }
    },

    mounted() {
        this.$ipcRenderer.on('db-info', (e, res) => {
            if (!res[0]) {
                this.loadingText = '数据库错误'
                this.loadingIcon = 'el-icon-warning-outline'
                this.key += 1
            } else {
                this.DBInfo = res
                this.dbInfoLoading = false
            }
        })

        this.$ipcRenderer.invoke('get-func-open', 'dbInfoOpen').then(res => {
            if (res) {
                this.$ipcRenderer.send('get-db-info', this.dbName)
            } else {
                this.loadingText = '已关闭'
                this.loadingIcon = 'el-icon-circle-close'
                this.key += 1
                this.$ipcRenderer.removeListener('db-info', () => {})
            }
        })
    },
}
</script>

<style scoped lang="stylus">

    .db-info-panel
        width 100%
        height 100%
        background-color white
        border-radius 15px
        overflow hidden
        display flex
        flex-direction column
        align-items center

        > :nth-child(3)
            border-top: 1px solid #DCDFE6;
            box-sizing: border-box;

        .info-panel
            margin-top 5px
            padding-top 7px
            width 85%

            .info-title
                margin-top 10px
                font-size 20px
                font-weight bold
                margin-left 2%
                margin-bottom 5px

            .info-data
                display flex
                flex-wrap wrap

                .data-one
                    display flex
                    justify-content space-between
                    width 46%
                    margin 1% 2% 1% 2%

                    .data-value
                        font-weight bold

    /deep/ .el-icon-circle-close
        font-size 35px

    /deep/ .el-icon-warning-outline
        font-size 35px

</style>
