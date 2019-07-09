<template>
  <v-flex sm6 class="mr-2">
    <v-toolbar flat height="40px" color="grey darken-3">
      <v-toolbar-title class="subheading grey--text text--lighten-1">Request Example</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isIndexRequest" @click="makeIndexRequest" flat>Try it Now</v-btn>
      <v-btn v-if="isShowRequest" @click="makeShowRequest" flat>Try it Now</v-btn>
      <v-btn v-if="response" @click="clear">Clear</v-btn>
    <v-switch
        v-if="response"
        v-model="expandAll"
        label="expand all"
        @change="rerenderViewer"
    ></v-switch>
    </v-toolbar>
      <v-card>
          <v-card-text>
              <v-layout row wrap >
                <v-flex sm6 pl-2 pr-2>
                  <v-alert
                    :value="pathVarAlert"
                    type="info"
                    v-text="pathVarAlertMsg"
                  >
                  </v-alert>
              </v-flex>
              </v-layout>
          </v-card-text>
      </v-card>
    <v-card>
      <v-card-text row wrap>
          <v-layout>
          <v-flex class="subheading grey--text text--lighten-1" pt-4 pb-4 pl-4>url:</v-flex>
          <v-flex pt-4 pb-4>{{currentUrl}}</v-flex>
          </v-layout>
              <div
           class="scrolling-viewer"
           v-if="response"
          >
              <json-viewer
                  v-if="response"
                  :key="viewerKey"
                  :value="response"
                  :expand-depth="depth"
                  theme="json-viewer"
                  copyable
          ></json-viewer>
          </div>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>

  import axios from 'axios'
  import { mapState, mapActions, mapGetters } from 'vuex'

  export default {
    name: "get-request-example",
    props: [
      'version',
      'entry',
      'baseUrl',
    ],
    data() {
      return {
        response: '',
        pathVar: null,
        pathVarAlert: false,
        expandAll: true,
        viewerKey: 0,
        pathVarAlertMsg: 'Please select a user'

      }
    },
    computed: {
      // config() {
      //   return {
      //     headers: {'Authorization': 'Bearer ' + this.jwt}
      //   }
      // },
      idPathVar() {
        return this.$store.getters.getPathVarByTag(this.localState)
      },
      queryString() {
        return this.$store.getters.getQueryStringByTag(this.localState)
      },
      requestUrl() {
        return this.queryString ?
            `${this.baseUrl}${this.version}${this.entry.path}?${this.queryString}` :
            `${this.baseUrl}${this.version}${this.entry.path}`
      },
      showRequestUrl() {
        return this.idPathVar ?
            this.requestUrl.replace(/{id}/, this.idPathVar) :
            this.requestUrl
      },
      currentUrl() {
        return this.isShowRequest ? this.showRequestUrl : this.requestUrl
      },
      isShowRequest() {
        return this.entry.method === 'get' && (this.entry.path.indexOf('{') !== -1)
      },
      isIndexRequest() {
        return this.entry.method === 'get' && (this.entry.path.indexOf('{') === -1)
      },
      depth() {
        return !this.expandAll ? 1 : 10;
      },
      localState() {
        return {
          entry: this.entry,
          idPathVar: '',
          queryParams: {
            include: [],
            'page[number]': '',
            'page[size]': '',
            limit: [],
            sort: [],
            sort_on: [],
            filter: []
          }
        }
      }
    },
    methods: {
      makeIndexRequest() {
        if (!this.userSelected) {
          this.pathVarAlert = true
        }
        axios.get(this.currentUrl, this.config).then(response => this.response = response.data).
            catch(error => this.response = error.response.data ? error.response.data : error);
      },
      makeShowRequest() {
        if (!this.idPathVar) {
          this.pathVarAlert = true
        } else {
          this.pathVarAlert = false
        }
        axios.get(this.currentUrl, this.config).
            then(response => this.response = response.data).
            catch(error => this.response = error.response.data ? error.response.data : error);
      },

      clear() {
        this.response = ''
        this.pathVarAlert = false
        this.$store.dispatch('clearAll', this.localState)
      },
      toggleDepth() {
        !this.expandAll ? this.depth = 1 : this.depth = 10
      },
      rerenderViewer() {
        this.toggleDepth();
        this.viewerKey += 1
      },

    }
  }

</script>

<style scoped>

</style>
