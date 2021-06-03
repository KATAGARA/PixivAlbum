import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        keepAliveList: [],
    },
    mutations: {
        setKeepAliveList (state, keepAliveList) {
            state.keepAliveList = keepAliveList
        },
    },
    actions: {
    },
    modules: {
    }
})
