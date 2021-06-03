<template>
    <div class="collect-progress">
        <div
            class="progress-panel"
            v-loading="!isRun"
            :element-loading-text="taskList.length === 0 ? '未添加任务' : '请稍等'"
        >
            <template v-for="(data, index) in progressData">
                <div :key="data.name" class="progress">
                    <el-progress type="circle" :percentage="percentage[index][0]" :status="percentage[index][1]" />
                    <span class="progress-text">{{ data.count[0]}}/{{ data.count[1]}}</span>
                    <span class="progress-name">{{ data.name }}</span>
                </div>
            </template>
        </div>
        <div class="task-panel">
            <span class="task-text">任务列表:</span>
            <div class="task-list">
                <el-dialog
                    v-if="taskDialogData"
                    :title="taskDialogData.name"
                    :visible.sync="taskTagDialogVisible"
                    width="650px">
                    <div class="task-dialog-one">
                        <span class="task-dialog-name">日期列表:</span>
                        <el-tag class="task-dialog-tag" v-for="date in taskDialogData.dateList" size="small" :key="''+date">{{ date }}</el-tag>
                    </div>
                    <div class="task-dialog-one">
                        <span class="task-dialog-name">参数:</span>
                        <div style="display: inline-block">
                            <div class="params-tag" v-for="param in taskDialogData.params" :key="''+param">
                                <el-tag class="task-dialog-tag"  size="small" >{{ param }}</el-tag>
                            </div>
                        </div>
                    </div>
                    <div class="task-dialog-one">
                        <span class="task-dialog-name">等待更新:</span>
                        <el-switch v-model="taskDialogData.waitRank" disabled />
                    </div>
                </el-dialog>
                <transition-group
                    enter-active-class="animate__animated animate__fadeInRight"
                    leave-active-class="animate__animated animate__fadeOutDown">
                    <el-badge
                        v-for="task in taskList"
                        :key="task.name + task.date"
                        :value="task.dateList.length"
                        :hidden="task.dateList.length === 1"
                        :type="task.run ? 'primary' : 'info'"
                    >
                        <el-tag
                            class="task-tag"
                            :closable="!task.run"
                            :type="task.run ? 'success' : ''"
                            @click="openTaskDialog(task)"
                            @close="tagClose(task)"
                        >{{ task.name }}
                            <font-awesome-icon  v-if="task.run" :icon="['fas', 'spinner'] " spin />
                        </el-tag>
                    </el-badge>
                </transition-group>
                <span class="none-task" v-if="taskList.length === 0">暂无任务</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "CollectProgress",

    data () {
        return {
            progressData: [
                {name: 'List', isDone: false, count: [0, 0]},
                {name: 'Illust', isDone: false, count: [0, 0]},
                {name: 'Image', isDone: false, count: [0, 0]},
            ],
            taskList: [],
            isRun: false,
            statusList: ['', '', ''],
            taskTagDialogVisible: false,
            taskDialogData: undefined,
        }
    },

    computed: {
        percentage: function () {
            let lic = this.progressData[0].count
            let ilc = this.progressData[1].count
            let lmc = this.progressData[2].count
            let percentageList = lic[0] !== 0 ? parseInt(lic[0] /  lic[1] * 100) : 0
            let percentageIllust = ilc[0] !== 0 ? parseInt(ilc[0] /  ilc[1] * 100) : 0
            let percentageImage = lmc[0] !== 0 ? parseInt(lmc[0] /  lmc[1] * 100) : 0
            return [
                [percentageList, percentageList === 100 ? 'success' : undefined],
                [percentageIllust, percentageIllust === 100 && this.progressData[0].isDone ? 'success' : undefined],
                [percentageImage, percentageImage === 100 && this.progressData[1].isDone ? 'success' : undefined]
            ]
        },
    },

    watch: {
    },

    mounted() {
        this.$ipcRenderer.send('pixiv-collect-is-run')
        this.$ipcRenderer.send('get-task-list')
        this.$ipcRenderer.on('is-run', (e, res) => {
            if (res[0] === true) {
                this.isRun = true
                this.progressData = [
                    {name: 'List', isDone: res[2][0], count: res[1].list},
                    {name: 'Illust', isDone: res[2][1], count: res[1].illust},
                    {name: 'Image', isDone: res[2][2], count: res[1].image},
               ]
            } else {
                this.isRun = false
            }
        })
        this.$ipcRenderer.on('task-msg', (e, taskList) => {
            this.taskList = taskList
        })
        this.$ipcRenderer.on('list-msg', (e, count) => {
            this.progressData[0].count = count
        })
        this.$ipcRenderer.on('illust-msg', (e, count) => {
            this.progressData[1].count = count
        })
        this.$ipcRenderer.on('image-msg', (e, count) => {
            this.progressData[2].count = count
        })
        this.$ipcRenderer.on('done-msg', (e, msg) => {
            console.log('done-msg: ', msg)
            switch (msg) {
                case 'list':
                    this.progressData[0].isDone = true
                    break
                case 'illust':
                    this.progressData[1].isDone = true
                    break
                case 'image':
                    this.progressData[2].isDone = true
                    break
            }
        })
    },

    methods: {
        tagClose (task) {
            this.$ipcRenderer.send('task-cancel', task)
        },

        openTaskDialog (task) {
            this.taskDialogData = task
            this.taskTagDialogVisible = true
        },

        test () {

        },
    }
}
</script>

<style scoped lang="stylus">
    .collect-progress
        width 100%
        display flex
        flex-direction column
        background-color white
        align-items center
        border-radius 15px

        .progress-panel
            display flex
            justify-content space-around
            position relative
            height 70%
            width 80%
            align-items center

            .progress
                display flex
                flex-direction column
                align-items center
                position relative
                margin-top 5%

                .progress-text
                    position absolute
                    top 52%

                .progress-name
                    font-weight bold
                    font-size 15px

        .task-panel
            display flex
            align-items center
            width 90%
            height 30%

            .task-text
                color rgb(173, 173, 173)
                font-size 13px
                margin-right 15px

            .task-list
                //border-radius 15px
                //border: 1px solid #DCDFE6;
                //box-sizing: border-box;
                height 100%
                width 80%
                display flex
                align-items center
                padding-left 10px
                padding-right 10px
                overflow hidden

                .task-tag
                    margin 0 2px
                    cursor pointer

                .none-task
                    font-size 13px
                    margin-right 15px

                .task-dialog-one
                    margin 10px 0
                    display flex

                    .task-dialog-name
                        min-width 75px

                    .task-dialog-tag
                        margin 2px 2px

                    .params-tag
                        min-width 260px
                        display inline-block


</style>
