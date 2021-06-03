<template>
    <div class="collect-mode-select">
        <div class="mode-top-panel">
            <el-date-picker
                class="date-picker"
                v-model="dateSelect"
                type="daterange"
                unlink-panels
                format="yyyyMMdd"
                value-format="yyyyMMdd"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions">
            </el-date-picker>
            <el-input  class="name-input" v-model="taskName" placeholder="Task / Preset" maxlength="10" clearable />

            <el-popover
                class="default-load"
                placement="top"
                width="295"
                v-model="optionPopoverVisible"
                trigger="click">
                <div class="default-option-panel">
                    <el-button class="add-default-option" type="primary" size="mini" icon="el-icon-plus" @click="addPreset" circle />
                    <el-table :data="modePresets" height="263">
                        <el-table-column label="名称" width="130">
                            <template slot-scope="scope">
                                <el-popover trigger="hover" placement="top">
                                    <div style="display: flex;justify-content: center">
                                        <span>{{ scope.row[0].comment }}</span>
                                    </div>
                                    <el-tag size="medium" slot="reference">{{ scope.row[0].name }}</el-tag>
                                </el-popover>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <template v-if="scope.row[1]">
                                    <el-popover
                                        placement="top"
                                        width="160">
                                        <el-input
                                            type="textarea"
                                            rows="3"
                                            placeholder="请输入描述"
                                            @change="commentInputChange(scope.$index)"
                                            v-model="scope.row[0].comment" />
                                        <el-button
                                            slot="reference"
                                            class="option-btn"
                                            type="primary" size="mini" icon="el-icon-edit" circle />
                                    </el-popover>
                                    <el-button
                                        class="option-btn"
                                        @click="presetDelete(scope.$index)"
                                        type="danger" size="mini" icon="el-icon-delete" circle />
                                    <el-button
                                        class="option-btn"
                                        @click="presetOpen(scope.$index)"
                                        type="success" size="mini" icon="el-icon-check" circle />
                                </template>
                                <el-button v-else type="danger" size="mini" @click="presetDelRevocation(scope.$index, scope.row)" plain>撤销</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <el-button  slot="reference" type="info" round>预设</el-button>
            </el-popover>

            <el-popover
                class="task-add"
                placement="top"
                width="160"
                v-model="addTaskPopoverVisible">
                <p>确定添加此任务吗？</p>
                <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="addTaskPopoverVisible = false">取消</el-button>
                    <el-button type="primary" size="mini" @click="clickAddTask">确定</el-button>
                </div>
                <el-button slot="reference" type="primary" icon="el-icon-plus" circle />
            </el-popover>
        </div>

        <div class="mode-main-panel">
            <transition
                style="width: 100%;"
                :enter-active-class="modeTabsInAnimate"
                :leave-active-class="modeTabsOutAnimate"
            >
                <div key="selectMode" v-if="tabValue === 'select'" style="display: flex; width: 100%">
                    <div v-for="(rankType, one) in rankMode" :key="rankType.name" class="rank-type-data">
                        <div class="rank-type-name">
                            <span>{{ rankType.name }}</span>
                            <font-awesome-icon class="reset-icon" @click="resetOption(one)" :icon="['fas', 'trash-alt']"/>
                        </div>
                        <div class="rank-mode-panel">
                            <template v-for="(rankMode, two) in rankType.mode">
                                <div :key="`${rankType.name}-${rankMode.name}`" class="rank-mode">
                                    <el-checkbox
                                        class="checkbox"
                                        v-model="modeValue[one][two][0][0]"
                                        :indeterminate="modeValue[one][two][0][1]"
                                        @click.native.prevent="handleCheckBoxClick(one, two)"/>
                                    <template v-for="(disabled, three) in rankMode.disabled">
                                        <el-radio
                                            :key="`${rankType.name}-${rankMode.name}-radio-${three}`"
                                            :class="`radio-${three}`"
                                            v-model="modeValue[one][two][three+1]"
                                            :label="true"
                                            :disabled="disabled"
                                            @click.native.prevent="handleRadioClick(one, two, three+1)"
                                        >{{ hidden }}</el-radio>
                                    </template>
                                    <div class="mode-name">{{ rankMode.name }}</div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <div key="selectExclude" v-else class="rank-type-data">
                    <div class="rank-type-name">
                        <span>overall</span>
                        <font-awesome-icon class="reset-icon" @click="resetExclude" :icon="['fas', 'trash-alt']"/>
                    </div>
                    <div class="rank-mode-panel">
                        <template v-for="(rankT, one) in rankMode[0].mode">
                            <div :key="`${rankMode[0].name}-${rankT.name}-E`" class="rank-mode">
                                <template v-for="(disabled, two) in rankT.disabled">
                                    <el-radio
                                        :key="`${rankMode[0].name}-${rankMode.name}-radio-${two}-E`"
                                        :class="`radio-${two}`"
                                        v-model="overallExclude[one][two]"
                                        :label="true"
                                        @click.native.prevent="handleExcludeRadioClick(one, two)"
                                    >{{ hidden }}</el-radio>
                                </template>
                                <div class="mode-name">{{ rankT.name }}</div>
                            </div>
                        </template>
                    </div>
                </div>
            </transition>

            <el-switch class="wait-rank-button" v-model="waitRank" active-text="等待排行" />
            <el-tabs class="mode-tabs" v-model="tabValue">
                <el-tab-pane label="模式选择" name="select" />
                <el-tab-pane label="图片排除" name="exclude" />
            </el-tabs>
            <el-popover placement="left-start" trigger="hover" :open-delay="500">
                <div class="hint-panel">
                    <div class="hint-one" :key="`hint-${i}`" v-for="(hint, i) in hintData[tabValue]">
                        <el-checkbox
                            v-if="hint.type === 'checkbox'"
                            v-model="hint.value[0]"
                            :indeterminate="hint.value[1]" />
                        <el-radio
                            v-else
                            :label="true"
                            :class="hint.value[1]"
                            v-model="hint.value[0]"
                            :disabled="!hint.value[0]"
                        >{{ hidden }}</el-radio>
                        <span class="hint-text">{{ hint.text }}</span>
                    </div>
                </div>
                <font-awesome-icon class="hint-icon" slot="reference" :icon="['fas', 'info-circle']"/>
            </el-popover>
        </div>
    </div>
</template>

<script>
import dayjs from "dayjs";

export default {
    name: "CollectModeSelect",

    data () {
        return {
            addTaskPopoverVisible: false,
            optionPopoverVisible: false,

            hidden: '',
            dateSelect: undefined,
            datePickerDefault: undefined,
            taskName: '',
            waitRank: false,
            tabValue: 'select',
            rankMode: [
                {
                    name: 'overall',
                    mode: [
                        { name: 'daily',    disabled: [false, false, true] },
                        { name: 'weekly',   disabled: [false, false, false] },
                        { name: 'monthly',  disabled: [false, true,  true], open: true },
                        { name: 'rookie',   disabled: [false, true,  true], open: true },
                        { name: 'original', disabled: [false, true,  true], open: true },
                        { name: 'male',     disabled: [false, false, true] },
                        { name: 'female',   disabled: [false, false, true] },
                    ]
                }, {
                    name: 'illust',
                    mode: [
                        { name: 'daily',    disabled: [false, false, true] },
                        { name: 'weekly',   disabled: [false, false, false] },
                        { name: 'monthly',  disabled: [false, true,  true], open: true },
                        { name: 'rookie',   disabled: [false, true,  true], open: true },
                    ]
                }, {
                    name: 'ugoira',
                    mode: [
                        { name: 'daily',    disabled: [false, false, true] },
                        { name: 'weekly',   disabled: [false, false, true] },
                    ]
                }, {
                    name: 'manga',
                    mode: [
                        { name: 'daily',    disabled: [false, false, true] },
                        { name: 'weekly',   disabled: [false, false, false] },
                        { name: 'monthly',  disabled: [false, true,  true], open: true },
                        { name: 'rookie',   disabled: [false, true,  true], open: true },
                    ]
                }
            ],
            overallInitExclude: [
                [false, false, false],
                [false, false, false],
                [false, false, false],
                [false, false, false],
                [false, false, false],
                [false, false, false],
                [false, false, false],
            ],
            overallExclude: undefined,
            modeValue: undefined,
            modeInitValue: [
                [
                    [[false, false], false, false, false],
                    [[false, false], false, false, false],
                    [[false, false], true, false, false],
                    [[false, false], true, false, false],
                    [[false, false], true, false, false],
                    [[false, false], false, false, false],
                    [[false, false], false, false, false],
                ], [
                    [[false, false], false, false, false],
                    [[false, false], false, false, false],
                    [[false, false], true, false, false],
                    [[false, false], true, false, false],
                ], [
                    [[false, false], false, false, false],
                    [[false, false], false, false, false],
                ], [
                    [[false, false], false, false, false],
                    [[false, false], false, false, false],
                    [[false, false], true, false, false],
                    [[false, false], true, false, false],
                ]
            ],
            pickerOptions: {
                shortcuts: [{
                    text: '最新',
                    onClick(picker) {
                        let offset = dayjs().hour() >= 12 ? -1 : -2
                        let date = dayjs().add(offset, 'day').format('YYYYMMDD')
                        picker.$emit('pick', [date, date])
                    }
                }, {
                    text: '本周',
                    onClick(picker) {
                        let offset = dayjs().hour() >= 12 ? -1 : -2
                        let date = dayjs().add(offset, 'day')
                        let start =  date.day(1).format('YYYYMMDD')
                        let end = date.format('YYYYMMDD')
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '本月',
                    onClick(picker) {
                        let offset = dayjs().hour() >= 12 ? -1 : -2
                        let date = dayjs().add(offset, 'day')
                        let start =  date.date(1).format('YYYYMMDD')
                        let end = date.format('YYYYMMDD')
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
            hintData: {
                select: [
                    { type: 'checkbox', value: [false, true], text: '仅保存信息' },
                    { type: 'checkbox', value: [true, false], text: '保存信息和图片' },
                    { type: 'radio', value: [true, 'radio-0'], text: '保存全年龄' },
                    { type: 'radio', value: [true, 'radio-1'], text: '保存R18' },
                    { type: 'radio', value: [true, 'radio-2'], text: '保存R18-G' },
                    { type: 'radio', value: [false, 'radio-0'], text: '无此类图片' },
                ],
                exclude: [
                    { type: 'radio', value: [true, 'radio-0'], text: '排除插画' },
                    { type: 'radio', value: [true, 'radio-1'], text: '排除动图' },
                    { type: 'radio', value: [true, 'radio-2'], text: '排除漫画' },
                ]
            },
            modePresets: [],
            tableOptionPopoverVisible: {},

            modeTabsInAnimate: 'animate__animated animate__fadeInLeft',
            modeTabsOutAnimate: 'animate__animated animate__fadeOutRight',

            inputVisible: false,
            inputMode: '',
            check1: false,
            check2: false,
            check3: true,
        }
    },

    watch: {
        tabValue: function () {
            if (this.tabValue === 'exclude') {
                this.modeTabsInAnimate = 'animate__animated animate__fadeInLeft'
                this.modeTabsOutAnimate = 'animate__animated animate__fadeOutRight'
            } else {
                this.modeTabsInAnimate = 'animate__animated animate__fadeInRight'
                this.modeTabsOutAnimate = 'animate__animated animate__fadeOutLeft'
            }
        }
    },

    created() {
        let offset = dayjs().hour() >= 12 ? -1 : -2
        let date = dayjs().add(offset, 'day').format('YYYYMMDD')
        this.dateSelect = [date, date]

        this.modeValue = this.deepCopyT(this.modeInitValue)
        this.overallExclude = this.deepCopyT(this.overallInitExclude)
    },

    mounted() {
        this.$ipcRenderer.send('get-mode-preset')
        this.$ipcRenderer.on('return-mode-preset', (e, presets) =>
            this.modePresets = presets.map(v => { return [v, true] })
        )
        this.$ipcRenderer.on('return-update-mode-preset', (e, msg) => this.handleUpdatePresetsMsg(msg))
    },

    methods: {
        clickAddTask () {
            this.addTaskPopoverVisible = false
            let name = this.taskName === '' ? 'task' : this.taskName
            let taskData = {
                taskName: name,
                date: this.dateSelect,
                waitRank: this.waitRank,
                mode: this.modeValue,
                overallExclude: this.overallExclude
            }
            this.$ipcRenderer.send('add-task', taskData)
        },

        handleCheckBoxClick (one, two) {
            let t = this.modeValue[one][two][0]
            if (t[0] === false && t[1] === false) {
                this.$set( this.modeValue[one][two], 0, [false, true])
            } else if (t[0] === false && t[1] === true) {
                this.$set( this.modeValue[one][two], 0, [true, false])
            } else if (t[0] === true && t[1] === false) {
                this.$set( this.modeValue[one][two], 0, [false, false])
            }
        },

        handleRadioClick (one, two, three) {
            if (!(this.rankMode[one].mode[two].open || this.rankMode[one].mode[two].disabled[three - 1])) {
                this.$set(this.modeValue[one][two], three, !this.modeValue[one][two][three])
            }
        },

        optionEdit (index, data) {
            this.tableOptionPopoverVisible[data.name][0] = true
        },

        presetDelete (index) {
            // this.defaultOptions[index][1] = false
            this.$set(this.modePresets[index], 1, false)
            let presetName = this.modePresets[index][0].name
            this.modePresets[index][2] = setTimeout(() => {
                let params = {
                    operate: 'del',
                    name: presetName,
                }
                this.$ipcRenderer.send('update-mode-preset', params)
            }, 3000)
            // console.log(this.$refs.delPop)
            // // this.$refs.delPop.showPopper = false
            // this.$set(this.$refs.delPop, 'value', false)
            // this.defaultOptions.splice(index, 1);
            // delete this.defaultOptions[index]
        },
        presetDelRevocation (index) {
            clearTimeout(this.modePresets[index][2])
            this.$set(this.modePresets[index], 1, true)
        },

        presetOpen (index) {
            // this.$set(this.modeValue, )
            this.modeValue = this.modePresets[index][0].modeValue
            this.overallExclude = this.modePresets[index][0].overallExclude
            this.taskName = this.modePresets[index][0].name
        },

        commentInputChange (index) {
            let params = {
                operate: 'change',
                name: this.modePresets[index][0].name,
                comment: this.modePresets[index][0].comment
            }
            this.$ipcRenderer.send('update-mode-preset', params)
        },

        resetOption (index) {
            this.$set(this.modeValue, index, this.deepCopyT(this.modeInitValue[index]))
        },

        addPreset () {
            let params = {
                operate: 'add',
                name: this.taskName === '' ? 'preset' : this.taskName,
                modeValue: this.modeValue,
                overallExclude: this.overallExclude
            }
            this.$ipcRenderer.send('update-mode-preset', params)
        },

        handleUpdatePresetsMsg (msg) {
            console.log(123)
            if (!msg[0]) {
                this.$message({ message: `失败: ${msg[1]}`, center: true, type: 'error' })
            } else {
                if (msg[1] === 'add') {
                    this.modePresets.push([msg[2], true])
                } else if (msg[1] === 'del') {
                    let index = this.modePresets.findIndex(v => { return v[0].name === msg[2] })
                    this.modePresets.splice(index, 1)
                }
                if (msg[1] !== 'change') {
                    this.$message({ message: `成功啦`, center: true, type: 'success' })
                }
            }
        },

        resetExclude () {
            this.overallExclude = this.deepCopyT(this.overallInitExclude)
        },

        handleExcludeRadioClick (one, two) {
            this.$set(this.overallExclude[one], two, !this.overallExclude[one][two])
        },

        deepCopyT (data) {
            return JSON.parse(JSON.stringify(data))
        }
    }
}
</script>

<style scoped lang="stylus">
    /deep/ .el-cascader-menu
        min-width 100px

    .collect-mode-select
        background-color white
        border-radius 15px
        display flex
        flex-direction column
        width 100%

        .mode-top-panel
            margin 1% 3%
            width 94%
            display flex
            height 17%
            align-items center

            .date-picker
                margin 0 2%
                width 35%

                /deep/ .el-range-separator
                    margin 0 8px 0 5px
                    padding 0

            .name-input
                width 25%
                margin 0 2%

            .default-load
                width 15%
                margin 0 2%


            .task-add
                margin-left 5.5%

        .mode-main-panel
            margin 0 5% 0 5%
            padding 1% 1%
            width 90%
            height 75%
            border-top: 1px solid #DCDFE6;
            box-sizing: border-box;
            display flex
            position relative

            .rank-type-data
                display flex
                flex-direction column
                align-items center
                width 25%

                .rank-type-name
                    font-weight bold
                    font-size 18px

                    .reset-icon
                        font-size 10px
                        color rgb(180, 180, 180)
                        margin-left 5px
                        cursor pointer

                .rank-mode-panel
                    display flex
                    flex-direction column
                    align-items center
                    width 100%
                    height 100%

                    .rank-mode
                        display flex
                        align-items baseline
                        padding  2% 0

                        .checkbox
                            margin-right 5.5%

                        .radio-0, .radio-1, .radio-2
                            margin-right 2%

                        .mode-name
                            margin-left 5%
                            font-size 14px
                            min-width 55px

            .wait-rank-button
                position absolute
                bottom 17px
                right 170px

            .mode-tabs
                position absolute
                bottom 0
                right 0

                /deep/ #tab-select
                    padding-right 7px

                /deep/ #tab-exclude
                    padding-left 7px

            .hint-icon
                position absolute
                font-size 15px
                top 10px
                left 10px
                color #409EFF

    .hint-panel
        display flex
        flex-direction column

        .hint-one
            margin 1px 2px

            .hint-text
                margin-left 10px
                font-size 13px



    .default-option-panel
        position relative

        .add-default-option
            position absolute
            z-index 999
            right 30px
            top 10px

    .option-btn
        margin 0 3px 0 3px !important

    //.check-1 > :nth-child(1) > :nth-child(1)
    //    &:hover
    //        border-color #E2264D

    //.check-1

    /deep/ .radio-0 .el-radio__inner
        &:hover
            border-color: #67c23a;

    /deep/ .radio-0 .el-radio__input.is-checked .el-radio__inner
        background-color: #67c23a;
        border-color: #67c23a;

    .radio-0
        &:focus:not(.is-focus):not(:active):not(.is-disabled) /deep/ .el-radio__inner
            box-shadow 0 0 2px 2px #67c23a

    /deep/ .radio-1 .el-radio__inner
        &:hover
            border-color: #e6a23c;

    /deep/ .radio-1 .el-radio__input.is-checked .el-radio__inner
        background-color #e6a23c
        border-color #e6a23c

    .radio-1
        &:focus:not(.is-focus):not(:active):not(.is-disabled) /deep/ .el-radio__inner
            box-shadow 0 0 2px 2px #e6a23c

    /deep/ .radio-2 .el-radio__inner
        &:hover
            border-color: #f56c6c;

    /deep/ .radio-2 .el-radio__input.is-checked .el-radio__inner
        background-color #f56c6c
        border-color #f56c6c

    .radio-2
        &:focus:not(.is-focus):not(:active):not(.is-disabled) /deep/ .el-radio__inner
            box-shadow 0 0 2px 2px #f56c6c

    /deep/ .el-checkbox, .el-radio
        margin-right 0

    /deep/ .el-radio__label
        padding 0
    ///deep/ .el-checkbox__inner
    //    width 17px
    //    height 17px

    .animate__fadeInLeft
        animation-duration 300ms
        animation-delay 300ms

    .animate__fadeOutRight
        animation-duration 300ms

    .animate__fadeInRight
        animation-duration 300ms
        animation-delay 300ms

    .animate__fadeOutLeft
        animation-duration 300ms

</style>
