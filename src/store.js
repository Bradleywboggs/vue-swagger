import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const CLEAR_ALL = 'CLEAR_ALL'
const SET_IDS = 'SET_IDS'
const SET_PATH_VAR = 'SET_PATH_VAR'
const SET_QUERY_PARAMS = 'SET_QUERY_PARAMS'
const SET_TAGS = 'SET_TAGS'




const state = {
  endpointData : {
    pets: {
      idPathVar: '',
      queryParams: {}
    }
  }
};


const getters = {
  getIndexParams:(state) => (tag) => {
    console.log(tag)
    return Object.entries(state.endpointData[tag].queryParams).
        filter(([k, v]) => k !== 'include').
        reduce((accum, [k, v]) => ({...accum, [k]: v}), {})
  },
  getPathVarByTag: (state, getters) => (localState) => {
    const tag = getTag(state, localState);
      return tag !== 'noTag' ?
          state.endpointData[tag].idPathVar :
          ''

  },
  getPathVarsByTag: (state, getters) => (localState) => {
    const tag = getTag(state, localState)
    return state.endpointData[tag].pathVars
  },
  getQueryParamsByTag: (state, getters) => (localState) => {
      const tag = getTag(state, localState);
      return isShowOrSelfMethod(localState) ?
              getters.getShowOrSelfParams(tag) :
              getters.getIndexParams(tag)
      },
  getQueryStringByTag: (state, getters) => (localState) => {
    const queryParams = getters.getQueryParamsByTag(localState)
    const filteredParamsArrayByTag = Object.entries(queryParams)
    .filter(([key, value]) => value.length >= 1)

    const queryStringArray = filteredParamsArrayByTag.map(
        ([key,value]) => typeof value === 'string' ?
            `${key}=${value}`:
            `${key}=${value.join(',')}`)

    return queryStringArray.join('&')
  },
  getShowOrSelfParams: (state) => (tag) => {
    return Object.entries(state.endpointData[tag].queryParams).filter(
        ([k, v]) => k === 'include').reduce(
            (accum, [k, v]) => ({...accum, [k]: v}), {})
  },
  getTag: (state) => (localState) =>
     localState.entry !== undefined && Object.keys(state.endpointData) !== undefined ?
      Object.keys(state.endpointData).
          filter(k => localState.entry.tags.includes(k))[0] :  'noTag'
}

const actions = {
  clearAll({ commit }, localState) {
    commit('CLEAR_ALL', localState)
  },
  async setIds({ commit }, localState) {
    const ids = await axios.get(localState.requestUrl, localState.config).
        then(response => {
          return response.data.data.map(entry => entry.id)
        })
    localState.ids = ids.slice(0,3)

    commit('SET_IDS', localState);
  },
  setPathVar({ commit }, localState) {
    commit('SET_PATH_VAR', localState)
  },
  setQueryParams({ commit }, localState) {
    commit('SET_QUERY_PARAMS', localState)
  },
  setTags({ commit }, localState) {
    commit('SET_TAGS', localState)
  }
};

const mutations = {
  [CLEAR_ALL](state, emptyLocalState){
    const tag = getTag(state, emptyLocalState)
    // if (isShowOrSelfMethod(emptyLocalState)) {
      state.endpointData[tag].idPathVar = ''
    // }
    state.endpointData[tag].queryParams =
        Object.entries(state.endpointData[tag].queryParams).reduce(
            (accum, [paramKey, paramVal]) => ({...accum, [paramKey]:''}), {})
  },
  [SET_IDS](state, localState) {
    const tag = getTag(state, localState)
    state.endpointData[tag].pathVars = localState.ids
  },
  [SET_PATH_VAR](state, localState) {
    const tag = getTag(state, localState)
    console.log(tag)
    state.endpointData[tag].idPathVar = localState.idPathVar
    console.log(localState.idPathVar)
    console.log(state.endpointData[tag])
  },
  [SET_QUERY_PARAMS](state, localState) {
    const tag = getTag(state, localState)
    console.log(tag)
    state = {
      ...state.endpointData,
      [tag]: {
        ...state.endpointData[tag]
        .queryParams = localState.queryParams
      }
    }
  },
  [SET_TAGS] (state, localState) {
    const tag = localState.entry.tags[0]
    state.endpointData[tag] = {idPathVar: '', queryParams: {}}
  }
};

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})

const getTag = (state, localState) => Object.keys(state.endpointData).
    filter(k => localState.entry.tags.includes(k))[0]

const isShowMethod = (localState) =>
    localState.entry.method === 'get' && localState.entry.path.indexOf('{id}') !== -1

const isShowOrSelfMethod = (localState) =>
    isShowMethod(localState) || localState.entry.path === '/me'




