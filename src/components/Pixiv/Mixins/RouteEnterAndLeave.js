export const RouteEnterAndLeave = {
    beforeRouteLeave (to, from, next) {
        this.scrollTop = document.getElementById('iwf').scrollTop
        next()
    },

    beforeRouteEnter (to, from, next) {
        next(vm => {
            if (to.name !== 'illust') {
                let fromName = to.name === 'rank' ? 'PixivRank' : (to.name === 'search' ? 'PixivSearch' : 'PixivLike')
                vm.$store.commit('setKeepAliveList', [fromName])
            }
            document.getElementById('iwf').scrollTop = vm.scrollTop
        })
    },
}


