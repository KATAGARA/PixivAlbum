<template>
    <div
        class="image-chart"
        id="image-chart"
        v-loading="imageInfoLoading"
        :element-loading-text="loadingText"
        :element-loading-spinner="loadingIcon"
        :key="key"
    >
        <div class="refresh">
            <font-awesome-icon class="refresh-icon" :style="{cursor: iconSpin ? '' : 'pointer'}" :icon="['fas', 'sync-alt']" :spin="iconSpin" @click="refresh"/>
            <transition
                enter-active-class="animate__animated animate__fadeIn"
                leave-active-class="animate__animated animate__fadeOut"
            >
                <span v-if="iconSpin" class="refresh-text">分析中</span>
            </transition>
        </div>
        <v-chart class="chart" :option="chartOption" ref="chart"/>
    </div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    ToolboxComponent,
} from "echarts/components";
import VChart from "vue-echarts";

use([
    CanvasRenderer,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    ToolboxComponent,
]);


export default {
    name: "ImageChart",
    components: { VChart },

    data () {
        return {
            key: 'imageChart',
            imageInfoLoading: true,
            chartOption: undefined,
            domObserver: undefined,
            iconSpin: false,
            loadingIcon: undefined,
            loadingText: '分析中',
        }
    },
    created() {

    },

    mounted() {
        this.$ipcRenderer.on('image-info', (e, res) => {
            this.handleImageInfo(res)
            this.imageInfoLoading = false
            this.iconSpin = false
        })

        this.domObserver = new ResizeObserver(() => {
            this.$refs.chart.resize();
        })
        this.domObserver.observe(document.getElementById('image-chart'))

        this.$ipcRenderer.invoke('get-func-open', 'imageAnalyseOpen').then(res => {
            if (res) {
                this.$ipcRenderer.send('get-image-info')
            } else {
                this.loadingText = '已关闭'
                this.loadingIcon = 'el-icon-circle-close'
                this.key += 1
                this.$ipcRenderer.removeListener('image-info', () => {})
                this.domObserver.disconnect()
            }
        })
    },

    beforeDestroy () {
        this.domObserver.disconnect()
    },

    methods: {
        refresh () {
            this.$ipcRenderer.send('get-image-info')
            this.iconSpin = true
        },

        handleImageInfo (res) {
            let t = 1024 * 1024 * 1024
            this.chartOption = {
                legend: {},
                toolbox: {
                    show: true,
                    showTitle: false,
                    feature: {
                        dataView: {
                            show: true,
                            title: '数据视图'
                        },
                        saveAsImage: {
                            show: true,
                            title: '保存为图片'
                        },
                    },
                },
                tooltip: {
                    formatter: function (params) {
                        let data = params.data.value + (params.seriesName !== 'size' ? '' : 'GB')
                        let style = '<div style="display: flex; justify-content: space-between; width: 120px">' +
                            '<span>' + params.seriesName + '</span>' +
                            '<span>' + data + '</span>' + '</div>' +
                            '<div style="display: flex; justify-content: space-between">' +
                            '<div>' + '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                            params.color +
                            ';margin-right: 5px;border-radius: 50%;}"></i>' +
                            params.name + '</div>' +
                            '<span>' + params.percent + '%' + '</span>' + '</div>'
                        return style
                    }
                },
                series: [
                    {
                        name: 'image',
                        type: 'pie',
                        selectedMode: 'single',
                        radius: [0, '30%'],
                        label: {
                            position: 'inner',
                            fontSize: 12,
                        },
                        labelLine: {
                            show: false
                        },
                        data: [
                            {value: res.illust.image, name: '插画'},
                            {value: res.manga.image, name: '漫画'},
                            {value: res.ugoira.image, name: '动图'}
                        ],
                        left: 0,
                        width: '50%'
                    }, {
                        name: 'album',
                        type: 'pie',
                        selectedMode: 'single',
                        radius: ['45%', '60%'],
                        labelLine: {
                            length: 10,
                        },
                        data: [
                            {value: res.illust.album, name: '插画'},
                            {value: res.manga.album, name: '漫画'},
                            {value: res.ugoira.album, name: '动图'},
                        ],
                        left: 0,
                        width: '50%'
                    }, {
                        name: 'size',
                        type: 'pie',
                        radius: ['40%', '60%'],
                        labelLine: {
                            length: 10,
                        },
                        itemStyle: {
                            borderRadius: 8
                        },
                        data: [
                            {value: (res.illust.size / t).toFixed(1), name: '插画'},
                            {value: (res.manga.size / t).toFixed(1), name: '漫画'},
                            {value: (res.ugoira.size / t).toFixed(1), name: '动图'},
                        ],
                        left: '50%',
                        width: '50%'
                    }
                ]
            }
        }
    }
}
</script>

<style scoped lang="stylus">
    .image-chart
        width 100%
        height 100%
        background-color white
        border-radius 15px
        overflow hidden
        position relative

        .refresh
            position absolute
            z-index 50
            left 5px
            top 20px
            display flex
            align-items center

            .refresh-icon
                font-size 18px
                color #5aafff
                margin-right 7px

            .refresh-text
                color #5aafff
                font-size 11px

        .chart
            margin-top 3%
            width 100%
            height 100%

    /deep/ .el-icon-circle-close
        font-size 35px
</style>
