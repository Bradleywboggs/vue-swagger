<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
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
          <div v-if="hasExampleParam(parameters)">
            <div v-if="isIdParam(parameters)">
            <v-select
                    v-model="localIdPathVar"
                    :type="getType(parameters)"
                    min="0"
                    :items="parameters.item.example.split(',')"
                    :placeholder="pathVarPlaceholder"
                    @change="setPathVar"
                    :rules="[rules.required]"
            ></v-select>
            </div>
            <div v-else>
            <v-select
                    v-model="displayedQueryParams[parameters.item.name]"
                    :items="parameters.item.example.split(',')"
                    :placeholder="parameters.item.name"
                    :multiple="isArrayParam(parameters)"
                    @change="setParams"
                    clearable
            ></v-select>
            </div>
          </div>
          <div v-else>
            <div v-if="isIdParam(parameters)">
            <v-text-field
                    v-if="isIdParam(parameters)"
                    v-model="localIdPathVar"
                    :type="getType(parameters)"
                    min="0"
                    :placeholder="pathVarPlaceholder"
                    @input="setPathVar"
                    :rules="[rules.required]"
                    clearable
            ></v-text-field>
            </div>
            <div v-else>
              <v-text-field
                      :type="getType(parameters)"
                      min="0"
                      v-model="displayedQueryParams[parameters.item.name]"
                      :placeholder="parameters.item.name"
                      @input="setParams"
                      clearable
              >
              </v-text-field>
            </div>
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
  import { mapGetters } from 'vuex'

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
        displayedQueryParams : {},
        rules: {
          required: value => value !== '' || 'This field is required'
        }
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
      localQueryParams() {
          return Object.entries(this.displayedQueryParams).reduce(
                  (accum, [paramKey, paramVal]) => paramVal === null ?
                          ({...accum, [paramKey]: ''}) :
                          ({...accum, [paramKey]: paramVal}), {})
      },
      localState() {
        return {
          config: {
            headers: {
              // 'Authorization': 'Bearer ' + this.jwt
            }
          },
          requestUrl: this.requestUrl.replace(/{id}/, ''),
          entry: this.entry,
          ids: [],
          queryParams: this.localQueryParams,
          idPathVar: this.localIdPathVar
        }
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
      // return this.$store.dispatch('setTags', this.localState)
      // if (this.isShowMethod) {
      //     this.$store.dispatch('setIds', this.localState)
      //   }
      },
    watch: {
      idPathVar() {
        this.localIdPathVar = !this.idPathVar ? '' : this.localIdPathVar
        },
      queryParams : {
        deep: true,
        handler() {
          if (this.queryParams !== undefined) {
            if (Object.values(this.queryParams).every(param => !param)) {
              Object.entries(this.displayedQueryParams).forEach(([k, v]) => this.displayedQueryParams[k] = '')
            }
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
      isArrayParam(parameters) {
        return parameters.item.schema.type === 'array'
      },
      hasExampleParam(parameters) {
        return !! parameters.item.example
      },
      getType(parameters) {
        return this.isArrayParam(parameters) ?
                parameters.item.schema.items.type === 'string' ?
                        'text' :
                        'number'
                                             :
                parameters.item.schema.type === 'string' ?
                        'text' :
                        'number'
      }
      ,
      setPathVar() {
          return this.$store.dispatch('setPathVar', this.localState)
      },
      setParams() {
        if (this.queryParams !== undefined) {
          return this.$store.dispatch('setQueryParams', this.localState)
        }
      },
    }
  }

</script>

<style lang="css">
</style>
