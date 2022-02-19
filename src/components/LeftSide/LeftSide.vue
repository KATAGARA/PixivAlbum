<template>
    <div class="left-side">
        <el-menu
            :collapse="isCollapse"
            default-active="rank"
            ref="elMenu"
            class="left-side-menu">
<!--            <el-menu-item-->
<!--                v-for="item of navList"-->
<!--                :key="item.name"-->
<!--                :index="item.routePath"-->
<!--            >-->
<!--                <i :class="item.icon" />-->
<!--                <span slot="title">{{ item.name }}</span>-->
<!--            </el-menu-item>-->
            <el-submenu index="pixiv" @click.native="goRank">
                <template slot="title">
                    <i class="el-icon-s-home" :style="homeStyle"></i>
                    <span slot="title">Pixiv</span>
                </template>
                <el-menu-item index="rank" @click="goRank">排行</el-menu-item>
                <el-menu-item index="like-illust" @click="goLike('illust')">收藏</el-menu-item>
                <el-menu-item index="like-author" @click="goLike('author')">关注</el-menu-item>
            </el-submenu>
            <el-menu-item index="pixiv-collect" @click="goPage('collect')">
                <i class="el-icon-download"></i>
                <span slot="title">Pixiv Collect</span>
            </el-menu-item>
            <el-menu-item index="setting" @click="goPage('setting')">
                <i class="el-icon-s-tools"></i>
                <span slot="title">Setting</span>
            </el-menu-item>
            <el-menu-item index="user" @click="goPage('user')">
                <i class="el-icon-user-solid"></i>
                <span slot="title">User</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
    import eventBus from "@/utils/eventBus";

    export default {
        name: "LeftSide",
        data () {
            return {
                isCollapse: true,
                homeStyle: { color: '#409EFF' },
                navList: [
                    { name: 'Pixiv', icon: 'el-icon-s-home', routePath: '/' },
                    { name: 'Pixiv Collect', icon: 'el-icon-download', routePath: '/' }
                ]
            }
        },
        mounted() {},
        created() {},

        methods: {
            goRank () {
                if (this.$route.path !== '/pixiv/rank') {
                    this.$router.push({name: 'rank'})
                    this.homeStyle = { color: '#409EFF' }
                    this.$refs.elMenu.activeIndex = 'rank'
                }
            },
            goLike (likeMode) {
                if (this.$route.path === '/pixiv/like/illust' || this.$route.path === '/pixiv/like/author') {
                    eventBus.$emit('restart-like', {likeMode: likeMode})
                } else {
                    console.log(123)
                    this.$router.push({name: 'like-' + likeMode, params: {likeMode: likeMode}})
                }
                this.homeStyle = { color: '#409EFF' }
                // if (this.$route.path !== '/pixiv/like/' + likeMode) {
                //     this.$router.push({name: 'like-' + likeMode, params: {likeMode: likeMode}})
                //     this.homeStyle = { color: '#409EFF' }
                // }
            },
            goPage (pageName){
                if (this.$route.path !== '/' + pageName) {
                    this.$router.push({name: pageName})
                    this.homeStyle = {}
                }
            },
        }
    }
</script>

<style scoped lang="stylus">
    .left-side
        height 100%
        background-color rgb(238, 241, 246)

        .left-side-menu
            border none

            /deep/ .el-submenu__title
                height 60px

            /deep/ .el-tooltip
                height 60px !important
</style>
