<template>
    <div class="pixiv-illust" id="pixiv-illust">
<!--        <div class="main-body" style="width: 80%">-->
        <font-awesome-icon class="awesome-icon" :icon="['fas', 'chevron-left']" @click="goBack"/>
        <div class="pixiv-illust-work" id="pixiv-illust-work" style="width: 70%;">
            <pixiv-illust-image
                v-if="illust.illust_type !== 2"
                :key="key"
                :illust.sync="illust"
                :dom-width="domWidth"
                :max-height="clientHeight"
                :min-height="minHeight" />
            <pixiv-illust-gif
                v-else
                :key="key"
                :illust.sync="illust"
                :dom-width="domWidth"
                :max-height="clientHeight"
                :min-height="minHeight" />
            <pixiv-illust-info :illust="illust"/>
        </div>
<!--        </div>-->
        <pixiv-illust-author class="pixiv-illust-author" :key="authorKey" :illust="illust" :work-width="domWidth" @illustRestart="illustRestart"/>
    </div>
</template>

<script>
import PixivIllustAuthor from "components/Pixiv/PixivIllust/PixivIllustAuthor";
import PixivIllustImage from "components/Pixiv/PixivIllust/PixivIllustImage";
import PixivIllustInfo from "components/Pixiv/PixivIllust/PixivIllustInfo";
import PixivIllustGif from "components/Pixiv/PixivIllust/PixivIllustGif";
import eventBus from '@/utils/eventBus'

export default {
    name: "PixivIllust",
    components: {
        PixivIllustGif,
        PixivIllustInfo,
        PixivIllustImage,
        PixivIllustAuthor,
    },

    data () {
        return {
            key: 100,
            authorKey: -100,
            illust: undefined,
            domWidth: 1,
            minHeight: 1,
            clientHeight: 1,
            domObserver: undefined,
            // rightSidebarWidth: undefined,

            // windowWidth: document.body.clientWidth,
            // windowHeight: document.body.clientHeight,
        }
    },

    computed: {},
    watch: {},

    created() {
        this.init()
    },

    mounted () {
        eventBus.$on('restart-illust', (illust) => {
            this.illust = illust
            this.authorKey -= 1
            document.getElementById('pixiv-illust').scrollTo({ top: 0, behavior: "smooth" })
        })
        this.domObserver = new ResizeObserver(entries => {
            entries.forEach(v => {
                if (v.target === document.getElementById('pixiv-illust-work')) {
                    // console.log(123)
                    this.domWidth = v.target.clientWidth
                } else if (v.target === document.getElementById('pixiv-illust')) {
                    this.clientHeight = v.target.clientHeight
                    this.minHeight = this.clientHeight * 2 / 3
                }
            })
            // this.domWidth = document.getElementById('piw').clientWidth
            // this.clientHeight = document.getElementById('pi').clientHeight
            // this.minHeight = this.clientHeight / 2
        })
        this.domObserver.observe(document.getElementById('pixiv-illust-work'))
        this.domObserver.observe(document.getElementById('pixiv-illust'))
    },

    beforeDestroy () {
        eventBus.$off('restart-illust')
        this.domObserver.disconnect()
        this.illust.src = [this.illust.src[0]]
    },

    methods: {
        init () {
            this.illust = this.$route.params.illust
            // this.calculateDisplay()
            // this.calculateDisplay()
            // this.illustInit()
        },

        // illustInit () {
        //     this.illust = this.$route.params.illust
        //     this.calculateDisplay()
        // },

        calculateDisplay () {
            this.domWidth = document.getElementById('piw').clientWidth
            this.clientHeight = document.getElementById('pi').clientHeight
            this.minHeight = this.clientHeight * 2 / 3
            // console.log(this.domWidth, this.clientHeight,   this.minHeight)
        },
        illustRestart (illust) {
            this.illust = illust
            this.key += 1
            document.getElementById('pixiv-illust').scrollTo({ top: 0, behavior: "smooth" })
        },

        goBack () {
            this.$router.back()
        }
    }
}
</script>

<style scoped lang="stylus">
    .pixiv-illust
        height 100%
        overflow-y scroll
        overflow-x auto
        background-color rgb(235, 235, 235)
        position relative
        display flex
        justify-content space-around

        .awesome-icon
            position sticky
            top 3%
            left 1%
            font-size 30px
            color darkgray
            cursor pointer
            transition color 0.3s ease 0s

            &:hover
                color #409EFF

        .pixiv-illust-work
            width 100%
            background-color white

        .pixiv-illust-author
            position sticky
            top 1px

</style>
