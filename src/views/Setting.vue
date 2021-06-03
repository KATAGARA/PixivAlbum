<template>
    <div class="setting"
         id="setting"
         v-loading="isCookieCopy"
         element-loading-text="Ctrl+V从剪贴板黏贴Cookie，Esc或右键取消"
         element-loading-spinner="el-icon-copy-document"
    >
        <div class="setting-header">
            <el-row type="flex" align="middle" justify="space-between">
                <el-col>
                    <span class="setting-text">设置</span>
                </el-col>
                <el-col class="title-buttons" :span="2">
                    <i class="el-icon-minus" @click="minimize"></i>
                    <i class="el-icon-full-screen" @click="maximize"></i>
                    <i class="el-icon-close" @click="close"></i>
                </el-col>
            </el-row>
        </div>
        <div class="setting-main">
            <div class="setting-one">
                <template v-for="(text, i) in funcOpen.text">
                    <span :key="`${text}t`" class="setting-name">{{ text }}</span>
                    <el-switch
                        class="open-close-switch"
                        :key="`${text}v`"
                        v-model="funcOpen.value[i]"
                        active-text="打开"
                        inactive-text="关闭"
                        @change="funcOpenChange(i)"/>
                </template>
            </div>
            <div class="setting-one">
                <span class="setting-name">数据库名:</span>
                <el-input
                    class="db-name-input"
                    placeholder="数据库名"
                    v-model="dbName"
                    maxlength="15"
                    :disabled="dbNameDisable"
                    @keyup.enter.native="alterDBName"
                    @keyup.native="dbName=dbName.replace(/[^a-zA-Z]/g,'')" />
                <el-button class="setting-button" size="medium" @click="alterDBName" type="info" plain round>{{ dbNameDisable ? '修改' : '保存' }}</el-button>
            </div>

            <div class="setting-one">
                <span class="setting-name">图片读取目录:</span>
                <el-tag class="path-tag" type="info" size="small">{{ imageSavePath }}</el-tag>
                <transition-group
                    enter-active-class="animate__animated animate__fadeInRight"
                    leave-active-class="animate__animated animate__fadeOutDown">
                    <el-tag
                        :key="path"
                        v-for="path in imageReadPathList"
                        closable
                        class="path-tag"
                        size="small"
                        @close="readPathTagClose(path)">
                        {{path}}
                    </el-tag>
                </transition-group>
                <el-button class="button-new-tag" @click="openAddImageReadDirSelect()" size="mini">+ New Path</el-button>
            </div>
            <div class="setting-one">
                <span class="setting-name">图片保存目录:</span>
                <div class="setting-value" >
                    <span class="path">{{ imageSavePath }}</span>
                    <div :class="['size', size[0] <= 30 ? 'red-size' : '']">
                        <span>{{ size[0] }} / {{ size[1] }} GB</span>
                    </div>
                </div>
                <el-button class="setting-button" size="medium" @click="openImageSaveDirSelect" type="info" plain round>选择文件夹</el-button>
            </div>

            <div class="setting-one">
                <span class="setting-name">图片移动:</span>
                <el-date-picker
                    class="date-picker"
                    v-model="dateSelect"
                    :disabled="moveImageIsRun"
                    type="daterange"
                    unlink-panels
                    size=""
                    format="yyyyMMdd"
                    value-format="yyyyMMdd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                </el-date-picker>
                <el-button class="move-button setting-button" size="medium" @click="addMoveDate" type="info" :disabled="moveImageIsRun" plain round>添加</el-button>
                <el-radio-group class="move-path-key-switch" v-model="movePathKeySwitch" :disabled="moveImageIsRun">
                    <el-radio-button label="src"></el-radio-button>
                    <el-radio-button label="tra"></el-radio-button>
                </el-radio-group>
                <el-select class="move-path-select" v-model="movePathSelect" placeholder="请选择目录" :disabled="moveImageIsRun">
                    <el-option
                        v-for="item in [imageSavePath].concat(imageReadPathList)"
                        :key="item"
                        :label="item"
                        :value="item">
                    </el-option>
                </el-select>
                <el-button class="move-button setting-button" size="medium" @click="addMovePath" type="info" :disabled="moveImageIsRun" plain round>添加</el-button>
                <el-select class="move-path-mode-select" v-model="moveMode" :disabled="moveImageIsRun">
                    <el-option label="keep" value="keep" />
                    <el-option label="move" value="move" />
                </el-select>
            </div>
            <div class="setting-one" style="margin-left: 80px">
                <el-button class="run-button setting-button" size="medium" @click="runMove" type="info" :disabled="moveImageIsRun" plain round>
                    运行{{ moveImageIsRun ? '中' : '' }}
                    <font-awesome-icon  v-if="moveImageIsRun" :icon="['fas', 'spinner'] " spin />
                </el-button>
                <span class="params-name setting-name">参数:</span>
                <el-tag class="path-tag" type="success" size="medium">src {{ srcPath }}</el-tag>
                <el-tag class="path-tag" type="success" size="medium">tra {{ traPath }}</el-tag>
                <el-tag class="path-tag" type="warning" size="medium">{{ moveMode }}</el-tag>
                <transition-group
                    enter-active-class="animate__animated animate__fadeInRight"
                    leave-active-class="animate__animated animate__fadeOutDown">
                    <el-tag
                        :key="date"
                        v-for="(date, i) in moveDateList"
                        :closable="!moveImageIsRun"
                        class="path-tag"
                        size="small"
                        @close="moveDateTagClose(i)">
                        {{ date }}
                    </el-tag>
                </transition-group>
            </div>
            <div class="setting-one"/>

            <div class="setting-one">
                <span class="setting-name">Python执行文件:</span>
                <div class="setting-value" >
                    <span class="path">{{ pixivCollectPath }}</span>
                </div>
                <el-button class="setting-button" size="medium" @click="openCollectDirSelect" type="info" plain round>选择文件</el-button>
                <el-button class="setting-button" size="medium" @click="openCollectPath" type="info" plain round>打开目录</el-button>
            </div>
            <div class="process-setting setting-one" style="margin-left: 120px">
                <div v-for="(name, i) in process.name" :key="name + i">
                    <span class="progress-name setting-name">{{ name }}进程数:</span>
                    <el-input-number
                        class="process-number-input"
                        v-model="process.number[i]"
                        :min="1" :max="99"
                        size="mini"
                        @change="processChange"/>
                </div>
            </div>
            <div class="setting-one">
                <span class="setting-name">Cookie:</span>
                <el-button class="setting-button" size="medium" @click="alterCookie" type="info" plain round>修改Cookie</el-button>
                <el-button class="setting-button" size="medium" @click="openCookieFile" type="info" plain round>打开Cookie</el-button>
            </div>
            <div class="setting-one">
                <span class="setting-name">配置:</span>
                <el-button class="setting-button" size="medium" @click="openConfigPath" type="info" plain round>打开配置目录</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import dayjs from "dayjs";

export default {
    name: "Setting",

    data () {
        return {
            imageSavePath: '',
            pixivCollectPath: '',
            process: {
                number: [1, 1, 1],
                name: ['List', 'Illust', 'Image']
            },
            funcOpen: {
                text: ['图片分析:', '数据库信息:'],
                value: [false, false],
            },
            imageReadPathList: [],
            size: [],
            isCookieCopy: false,
            dbName: 'Pixiv',
            dbNameDisable: true,
            dateSelect: undefined,
            dateList: [],
            srcPath: '未选择',
            traPath: '未选择',
            moveDateList: [],
            movePathKeySwitch: 'src',
            movePathSelect: undefined,
            moveImageIsRun: false,
            moveMode: 'keep'
        }
    },

    created () {
        let offset = dayjs().hour() >= 12 ? -1 : -2
        let date = dayjs().add(offset, 'day').format('YYYYMMDD')
        this.dateSelect = [date, date]
    },

    mounted() {
        this.$ipcRenderer.on('return-move-image-is-run', (e, isRun) => {
            this.moveImageIsRun = isRun
        })
        this.$ipcRenderer.send('move-image-is-run')
        // this.$ipcRenderer.send('test-1')

        this.$ipcRenderer.send('get-config')
        this.$ipcRenderer.send('get-available-size')
        this.$ipcRenderer.on('return-config', (e, config) => {
            this.imageSavePath = config.imageSavePath
            this.imageReadPathList = config.imageReadPathList
            this.process.number = config.processNumber
            this.funcOpen.value = [config.imageAnalyseOpen, config.dbInfoOpen]
            this.pixivCollectPath = config.pixivCollectPath
            this.dbName = config.dbName
        })
        this.$ipcRenderer.on('return-available-size', (e, size) => {
            this.size = size
        })
    },

    methods: {
        openImageSaveDirSelect () {
            this.openShowOpenDialog({ key: 'imageSavePath' })
        },
        openCollectDirSelect () {
            this.openShowOpenDialog({ key: 'pixivCollectPath' })
        },
        openAddImageReadDirSelect () {
            this.openShowOpenDialog({ key: 'imageReadPathList', operate: 'add' })
        },

        openShowOpenDialog (params) {
            this.$ipcRenderer.invoke('open-show-open-dialog', params).then(msg => {
                if (msg[3] !== '取消') this.alterConfigMsg(msg)
            })
        },

        alterConfigMsg (msg) {
            if (msg[0]) {
                if (msg[3] === '未更改') {
                    this.$message({ message: '未更改', center: true, type: 'info' })
                } else {
                    this[msg[1]] = msg[2]
                    this.$message({ message: '已保存', center: true, type: 'success' })
                }
            } else {
                this.$message({ message: `错误: ${msg[3]}`, center: true, type: 'error' })
            }
        },

        processChange () {
            let params = {key: 'processNumber', value: this.process.number}
            this.$ipcRenderer.invoke('alter-config', params).then(msg => {
                if (msg[0] === false) {
                    this.$message({ message: `保存失败`, center: true, type: 'error' })
                }
                this.process.number = msg[2]
            })
        },
        funcOpenChange (index) {
            let params = {key: index === 0 ? 'imageAnalyseOpen' : 'dbInfoOpen', value: this.funcOpen.value[index]}
            this.$ipcRenderer.invoke('alter-config', params).then(msg => {
                if (msg[0] === false) {
                    this.$message({ message: `保存失败`, center: true, type: 'error' })
                }
                this.funcOpen[index] = msg[2]
            })
        },

        openCollectPath () {
            this.$ipcRenderer.send('open-path', 'pixivCollectPath')
        },

        openConfigPath () {
            this.$ipcRenderer.send('open-path', 'configPath')
        },

        openCookieFile () {
            this.$ipcRenderer.invoke('open-cookie-file').then(msg => {
                if (!msg) this.$message({ message: `打开失败`, center: true, type: 'error' })
            })
        },

        alterCookie () {
            let that = this
            that.isCookieCopy = true
            document.addEventListener('keyup', that.keyupFunc)
            document.addEventListener('mouseup', that.mouseupFunc)
        },

        keyupFunc (e) {
            if (e.key === 'Escape' || (e.ctrlKey && (e.key === 'V' || e.key === 'v'))) {
                this.isCookieCopy = false
                document.removeEventListener('keyup', this.keyupFunc)
                document.removeEventListener('mouseup', this.mouseupFunc)
                if (e.key !== 'Escape') {
                    this.$ipcRenderer.invoke('alter-cookie').then(msg => {
                        if (!msg) this.$message({ message: `修改失败`, center: true, type: 'error' })
                    })
                }
            }
        },

        mouseupFunc (e) {
            if (e.button === 2) {
                this.isCookieCopy = false
                document.removeEventListener('keyup', this.keyupFunc)
                document.removeEventListener('mouseup', this.mouseupFunc)
            }
        },

        readPathTagClose (path) {
            let params = { key: 'imageReadPathList', value: path, operate: 'del' }
            this.$ipcRenderer.invoke('alter-config', params).then(msg => {
                this.alterConfigMsg(msg)
            })
        },

        alterDBName () {
            if (this.dbNameDisable) {
                this.dbNameDisable = false
            } else {
                let params = { key: 'dbName', value: this.dbName }
                this.$ipcRenderer.invoke('alter-config', params).then(msg => {
                    this.alterConfigMsg(msg)
                    this.dbNameDisable = true
                })
            }
        },

        addMoveDate () {
            let dateList = this.getDateList(this.dateSelect)
            let flag = false
            dateList.forEach(v => {
                if (this.dateList.indexOf(v) === -1) {
                    flag = true
                    this.dateList.push(v)
                }
            })
            if (flag) this.moveDateList.push(
                this.dateSelect[0] !== this.dateSelect[1] ? `${this.dateSelect[0]}-${this.dateSelect[1]}` : this.dateSelect[0])
        },

        addMovePath () {
            if (this.movePathSelect !== undefined) {
                this.movePathKeySwitch === 'src' ? this.srcPath = this.movePathSelect : this.traPath = this.movePathSelect
            }
        },

        moveDateTagClose (index) {
            this.moveDateList.splice(index, 1)
            this.dateList = []
            this.moveDateList.forEach(v => {
                let dateRange = v.split('-')
                if (this.dateList.indexOf(dateRange[0]) === -1) this.dateList.push(Number(dateRange[0]))
                if (dateRange.length === 2) {
                    let dateList = this.getDateList(dateRange)
                    dateList.forEach(v => {
                        if (this.dateList.indexOf(v) === -1) this.dateList.push(v)
                    })
                }
            })
        },

        getDateList (dateRange) {
            let dateList = [Number(dateRange[0])]
            let day = dateRange[0]
            while (day !== dateRange[1]) {
                day = dayjs(day).add(1, 'day').format('YYYYMMDD')
                dateList.push(Number(day))
            }
            return dateList
        },

        runMove () {
            if (this.srcPath === '未选择' || this.traPath === '未选择' || this.dateList.length === 0) {
                this.$message({ message: `参数缺失`, center: true, type: 'info' })
                return
            }
            let params = {
                src: this.srcPath,
                tra: this.traPath,
                mode: this.moveMode,
                date: this.dateList,
            }
            this.$ipcRenderer.invoke('move-image', params).then(msg => {
                if (msg) {
                    this.$message({ message: '成功啦', center: true, type: 'success' })
                } else {
                    this.$message({ message: '运行错误', center: true, type: 'error' })
                }
            })
        },

        minimize () {
            this.$ipcRenderer.send('user-minimize')
        },
        maximize () {
            this.$ipcRenderer.send('user-maximize')
        },
        close () {
            this.$ipcRenderer.send('user-close')
        },
        test () {
            console.log(123)
        },
    }
}
</script>

<style scoped lang="stylus">
    .setting
        height 100%
        width 100%

        .setting-header
            height 50px
            width 100%
            padding 0 10px 0 10px
            -webkit-app-region drag

            .setting-text
                width 150px
                padding-left 15px
                padding-right 50px
                font-size 20px
                font-weight bold
                color #409EFF
                -webkit-app-region no-drag

            .title-buttons
                display flex
                justify-content flex-end
                align-items center
                margin-bottom 20px
                -webkit-app-region no-drag

                .el-icon-full-screen, .el-icon-minus, .el-icon-close
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

        .setting-main
            width 100%
            padding 1% 3% 0 5%

            //.process-setting
            //    margin-left 120px

            .setting-one
                display flex
                height 50px
                align-items center

                .setting-name
                    font-weight bold
                    font-size 13px
                    margin-right 20px
                    min-width 80px

                .progress-name
                    font-weight normal

                .setting-value
                    width 350px
                    height 35px
                    border-radius 5px
                    border 1px solid #DCDFE6
                    box-sizing border-box
                    display flex
                    align-items center
                    transition border-color 0.3s ease 0s

                    &:hover
                        border-color #409EFF

                    .path
                        padding-left 15px
                        user-select text

                    .size
                        display flex
                        align-items flex-end
                        margin-left 15px
                        color #409EFF
                        font-size 10px
                        height 100%
                        margin-bottom 13px

                    .red-size
                        color red !important

                .process-number-input
                    margin-right 30px

                /deep/ .el-input-number--mini
                    width 90px

                .setting-value-t
                    width 350px

                .setting-button
                    margin-left 20px

                .open-close-switch
                    margin-right 30px

                .path-tag
                    margin-right 10px

                .button-new-tag
                    height 24px
                    padding-top 0
                    padding-bottom 0

                .db-name-input
                    width 170px

                .date-picker
                    width 25%

                    /deep/ .el-range-separator
                        margin 0 8px 0 5px
                        padding 0

                .move-path-key-switch
                    margin-left 20px

                    > :nth-child(2) /deep/ .el-radio-button__inner
                        border-bottom-right-radius 0
                        border-top-right-radius 0
                        border-right none

                .move-path-select /deep/ .el-input__inner
                    border-top-left-radius 0
                    border-bottom-left-radius 0

                .run-button
                    margin-right 40px

                .move-path-mode-select
                    margin-left 30px
                    width 90px

                .move-button
                    margin-left 10px

                .params-name
                    min-width 0

                /deep/ .el-radio-button__inner
                    padding 12px 12px


    .el-row
        width 100%
        padding 0 10px

    /deep/ .el-icon-copy-document
        font-size 35px

</style>
