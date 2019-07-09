<template>
  <!--TODO:Improve conditional styling technique: Huge If/Else blocks are ugly-->
  <v-flex v-if="entry.method !== 'delete'"sm6 class="mr-2">
    <v-toolbar flat height="40px" color="grey darken-3">
      <v-toolbar-title class="subheading grey--text text--lighten-1">Request Parameters</v-toolbar-title>
    </v-toolbar>
    <v-data-table
      :headers="displayedHeaders"
      :items="parameters"
      class="elevation-1"
      hide-actions
    >
      <template v-slot:items="parameters">
        <td>{{ parameters.item.name }}</td>
        <td>{{ parameters.item.in }}</td>
        <td>{{ parameters.item.required }}</td>
        <td>{{ parameters.item.schema.type }} {{ displayEnum(parameters.item.schema.enum) }}</td>
        <td>{{ parameters.item.description }}</td>
        <td>
          <div v-if="isShowOrSelfMethod">
            <v-select
              v-if="isIdParam(parameters)"
              v-model="localIdPathVar"
             :items="pathVars"
             :no-data-text="noDataMsg"
             :placeholder="pathVarPlaceholder"
             @change="setPathVar"
              clearable
            >
            </v-select>
            <v-select
              v-if="isIncludeParam(parameters)"
              v-model="localQueryParams[parameters.item.name]"
              :items="parameters.item.example.split(',')"
              :placeholder="parameters.item.name"
              :multiple="supportsMultiple"
              @change="setParams"
              clearable
            ></v-select>
          </div>
          <div v-else>
              <v-text-field
                      type="number"
                      v-model="rawParams[parameters.item.name]"
                      :rules="[rules.greaterThanZero]"
                      :placeholder="parameters.item.name"
                      @input="setParams"
                      clearable
              >
              </v-text-field>
          </div>
        </td>
      </template>
      <template v-slot:no-data>
        No parameters
      </template>
    </v-data-table>
  </v-flex>
  <v-flex v-else>
    <v-toolbar flat height="40px" color="grey darken-3">
      <v-toolbar-title class="subheading grey--text text--lighten-1">Request Parameters</v-toolbar-title>
    </v-toolbar>
    <v-data-table
            :headers="displayedHeaders"
            :items="parameters"
            hide-actions
    >
      <template v-slot:items="parameters">
        <td>{{ parameters.item.name }}</td>
        <td>{{ parameters.item.in }}</td>
        <td>{{ parameters.item.required }}</td>
        <td>{{ parameters.item.schema.type }} {{ displayEnum(parameters.item.schema.enum) }}</td>
        <td>{{ parameters.item.description }}</td>
      </template>
    </v-data-table>
  </v-flex>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex'

  const pluralize = require('pluralize')

  export default {
    name: 'request-parameters',
    props: [
      'entry',
      'userSelected',
      'version',
      'baseUrl',
    ],
    data() {
      return {
        headers: [
          {text: 'Name', value: 'name'},
          {text: 'In', value: 'in'},
          {text: 'Required', value: 'required'},
          {text: 'Type', value: 'type'},
          {text: 'Description', value: 'description'},
          {text: 'Value(s)', value: 'example'}
        ],
        localIdPathVar: '',
        localQueryParams: {
          include: [],
          'page[number]': '',
          'page[size]' : '',
          limit: [],
          sort: [],
          sort_on: [],
          filter: []
        },
        rawParams : {
          'page[number]' : '',
          'page[size]' : '',
        },
        rules: {
          greaterThanZero: value => value >= 0 || 'Value must be greater than 0'
        },
        supportsMultiple: true,
        }
    },

    computed: {
      ...mapGetters([
        'getPathVarByTag',
        'getPathVarsByTag',
        'getQueryStringByTag',
        'getQueryParamsByTag',
      ]),

      displayedHeaders() {
        return ['delete', 'post' ,'patch'].indexOf(this.entry.method) === -1 ? this.headers : [
          {text: 'Name', value: 'name'},
          {text: 'In', value: 'in'},
          {text: 'Required', value: 'required'},
          {text: 'Type', value: 'type'},
          {text: 'Description', value: 'description'},
        ]
      },
      idPathVar() {
        return this.getPathVarByTag(this.localState)
      },
      isShowMethod() {
        return this.entry.method === 'get' && this.entry.path.indexOf('{id}') !== -1
      },
      isShowOrSelfMethod(){
        return this.isShowMethod || this.entry.path  === '/me'
      },
      jwt() {
        return window.jwt
      },
      localState() {
        return {
          config: {
            headers: {
              'Authorization': 'Bearer ' + this.jwt
            }
          },
          requestUrl: this.requestUrl.replace(/{id}/, ''),
          entry: this.entry,
          ids: [],
          queryParams: this.localQueryParams,
          idPathVar: this.localIdPathVar
        }
      },
      noDataMsg(){
        return this.userSelected ?
                `This user doesn't have any associated data` :
                `Please select a user`
      },
      pageNumber() {
        return parseFloat(this.rawParams['page[number]']) > 0 ? this.rawParams['page[number]'] : ''
      },
      pageSize() {
        return parseFloat(this.rawParams['page[size]']) > 0 ? this.rawParams['page[size]'] : ''
      },
      parameters() {
        return this.entry.parameters
      },
      pathVarPlaceholder() {
        return `${pluralize.singular(this.entry.tags[0])} id`
      },
      pathVars() {
        return this.getPathVarsByTag(this.localState)
      },
      queryString() {
        return this.getQueryStringByTag(this.localState)
      },
      queryParams() {
        return this.getQueryParamsByTag(this.localState)
      },
      requestUrl() {
        return `${this.baseUrl}${this.version}${this.entry.path}`
      }
    },
    created() {
      if (this.userSelected) {
        if (this.isShowMethod) {
          return this.$store.dispatch('setIds', this.localState)
        }
      }
    },
    watch: {
      idPathVar() {
        this.localIdPathVar = this.idPathVar
        },
      pageNumber() {
        this.localQueryParams['page[number]'] = this.pageNumber
      },
      pageSize() {
        this.localQueryParams['page[size]'] = this.pageSize
      },
      queryParams : {
        deep: true,
        handler() {
          if (this.isShowOrSelfMethod) {
            this.localQueryParams.include = this.queryParams.include
          }
          else {
            this.rawParams['page[number]'] = this.queryParams['page[number]']
            this.rawParams['page[size]'] = this.queryParams['page[size]']
          }
        }
      }
    },
    methods: {
      displayEnum: function(enumList) {
        if (enumList) {
          return '(Available values: ' + enumList.join(', ') + ')'
        }
        else {
          return ''
        }
      },
      isIdParam(parameters) {
        return parameters.item.name === 'id'
      },
      isIncludeParam(parameters) {
        return parameters.item.name === 'include'
      },
      setPathVar() {
        return this.$store.dispatch('setPathVar', this.localState)
      },
      setParams() {
        return this.$store.dispatch('setQueryParams', this.localState)
      },
    }
  }

</script>

<style lang="css">
</style>
