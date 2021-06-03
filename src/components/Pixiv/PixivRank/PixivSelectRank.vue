<!--
 - PixivSelectRank rank选择器 可选日期, 图片类型, 排行类型 作为waterfall的插槽插入
 - 功能: 选择日期图片排行类型, 右下角绝对定位触碰弹出, 弹出日期选择器, 可输入日期, 点击后进入新排行
 -       todo: 排版优化,  弹出日期选择器按钮不消失, 图片类型按钮点击可进入新排行
 -
 - props: query: { illustType:[must|= 'overall', 'illust', 'animation', 'manga'],
 -                 rankType:[must|= 'daily', 'weekly', 'monthly', 'rookie', 'original', 'male', 'female'],
 -                 rankDate:[must| int], isR18:[must|= 1, 0] }
 -
 - @restart: father-method: this.selected() -> $emit -> PixivRank.restart
 -
 - history:
 -          20200817: 选择日期图片排行类型, 右下角绝对定位触碰弹出, 弹出日期选择器, 可输入日期, 点击后进入新排行
 -                    todo: 排版优化,  弹出日期选择器按钮不消失, 图片类型按钮点击可进入新排行
 -
 -->

<template>
    <el-popover
        class="select-rank"
        placement="left"
        trigger="hover"
        width="270"
    >
        <el-radio-group v-model="query.r18" class="r18-group" @change="selected">
            <el-radio :label="0">全年龄</el-radio>
            <el-radio :label="1">R18</el-radio>
            <el-radio :label="2">R18-G</el-radio>
        </el-radio-group>
        <el-cascader-panel
            class="mode-select-panel"
            v-model="query.rankMode"
            :options="options"
            :props="{ expandTrigger: 'hover' }"
            @change="selected"/>
        <el-date-picker
            class="date-picker"
            v-model="rankDate"
            placeholder="选择日期"
            size="small"
            type="date"
            format="yyyyMMdd"
            value-format="yyyyMMdd"
            @change="selected"
        />
        <div slot="reference">
            <i class="el-icon-date" style="font-size: 40px; color: #409EFF"></i>
        </div>
    </el-popover>
</template>

<script>
export default {
    name: "PixivSelectRank",
    props: {
        query: {
            type: Object,
            required: true,
        }
    },

    data () {
        return {
            rankDate: '' + this.query.rankDate,
            options: [{
                value: 'overall',
                label: '综合',
                children: [
                    { value: 'daily',    label: '日榜' },
                    { value: 'weekly',   label: '周榜' },
                    { value: 'monthly',  label: '月榜' },
                    { value: 'original', label: '原创' },
                    { value: 'rookie',   label: '新人' },
                    { value: 'male',     label: '男性' },
                    { value: 'female',   label: '女性' },
                ]}, {
                value: 'illust',
                label: '插画',
                children:  [
                    { value: 'daily',   label: '日榜' },
                    { value: 'weekly',  label: '周榜' },
                    { value: 'monthly', label: '月榜' },
                    { value: 'rookie',  label: '新人' },
                ]}, {
                value: 'ugoira',
                label: '动图',
                children: [
                    { value: 'daily',   label: '日榜' },
                    { value: 'weekly',  label: '周榜' },
                ]
            }],
        }
    },

    methods: {
        selected () {
            this.query.rankDate = Number(this.rankDate)
            this.$emit('restart')
        },
    },
}
</script>

<style scoped lang="stylus">
//.select-rank
//    position absolute
//    z-index 999
//    right 40px
//    bottom 100px
    .date-picker
        width 100% !important

    /deep/ .mode-select-panel el-cascader-panel is-bordered
        max-width 250px

    /deep/ .el-cascader-menu
        height 115px
        min-width 120px

    /deep/ .el-cascader-menu__wrap
        height 115px
        width 110px
        overflow auto
    .mode-select-panel
        margin-bottom 10px

        > :nth-child(2) > :nth-child(1)
            width 138px

    .r18-group
        margin-bottom 10px



</style>
