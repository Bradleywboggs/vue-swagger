<template>
  <v-layout v-if="api.info" row wrap>
    <v-flex lg12>
      <span class="display-1">{{api.info.title}}</span>
      <div v-if="api.info.description" v-html="marked(api.info.description || '')"></div>
    </v-flex>
    <v-flex v-if="api.info.contact" lg12>
      <v-icon>home</v-icon>
      <span style="margin-left: 10px; margin-right: 10px"><a :href="api.info.contact.url">{{api.info.contact.name || api.info.contact.url}}</a></span>
      <v-icon>email</v-icon>
      <span style="margin-left: 10px"><a :href="'mailto:'+api.info.contact.email">{{api.info.contact.email}}</a></span>
    </v-flex>
    <v-flex lg12>
      <v-layout>
        <v-flex xs8 sm6 lg2 mr-4>
          <v-select v-model="version" :items="versions" solo ></v-select>
        </v-flex>

      </v-layout>
      <v-flex><a :href="swaggerYaml">api-docs.yaml</a></v-flex>
      <template v-if="api.info.termsOfService">
        <span><a :href="api.info.termsOfService">Terms of Service</a></span>
      </template>
    </v-flex>
    <v-flex
      lg12
      v-for="(entries, tag) in versionedTags"
      :key="tag"
      class="my-3">
      <v-toolbar>
        <v-toolbar-title class="headline">{{ tag }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn flat @click="setPanel(tag)">View Schema</v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-expansion-panel>
            <v-expansion-panel-content
              v-for="(entry, i) in entries"
              :key="i"
              :class="[chooseColor(entry.method), 'darken-6']">
              <template v-slot:header>
                <v-btn  v-bind:color="chooseColor(entry.method)" dark style="maxWidth: 25px">
                  <strong>{{ entry.method.toUpperCase() }}</strong>
                </v-btn>
                <h3>{{ entry.path }}</h3>
              </template>
              <request-card
                :color="chooseColor(entry.method)"
                :entry="entry"
                :version="version"
                :baseUrl="baseUrl"
              >
              </request-card>
              <response-card
                :color="chooseColor(entry.method)"
                :entry="entry"></response-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>
      </v-card>
    </v-flex>
    <components
      :panel="panel"
      :components="api.components"/>
  </v-layout>
</template>


<script>
  import Vue from 'vue'
  import ResponseCard from './ResponseCard.vue'
  import RequestCard from './RequestCard.vue'
  import Components from './Components.vue'
  import store from '../store'
  // import RequestForm from './RequestForm.vue'
  // import ResponseDisplay from './ResponseDisplay.vue'
  // import SecurityTable from './SecurityTable.vue'
  // import Snippet from './Snippet.vue'

  import axios from 'axios'
  import jsYaml from 'js-yaml'
  import stringify from 'json-stringify-pretty-compact'
  import marked from 'marked'

  const pluralize = require('pluralize')

  export default {
    name: 'vue-swag',
    props: {
      swaggerYaml: {
        type: String,
        required: true
      }
    },
    store,
    components: {
      ResponseCard,
      RequestCard,
      Components,
    },
    data() {
      return {
        selectedEntry: null,
        currentSchema: ' ',
        currentExamples: {},
        currentFields: {},
        currentRequest: {
          contentType: '',
          body: '',
          params: {},
          security: {}
        },
        currentResponse: null,
        api: {},
        tags: {},
        httpRequest: null,
        versions: [],
        version: '',
        baseUrl: '',
        panel: -1,
      }
    },
    computed: {
      versionedTags : function () {
        // Convert tags object to array of key/value entries
        const versionedTagEntries = Object.entries(this.tags)
                //Filter out 'included' and 'inactive' entries and every entry which contains no path objects corresponding to selected version
                .filter(([k,v]) => v.some(pathObject => pathObject.servers) ?
                        v.some(pathObject => pathObject.servers[0].url.includes(this.version)) : this.tags);
        // Reduce the filtered array of key/value entries into the new versionedTags object
        return versionedTagEntries.reduce((carryAccumulation, [key,value]) => ({...carryAccumulation, [key]: value }), {});
      },

    },
    methods: {
      marked,
      stringify,
      setPanel(tag) {
        this.panel = pluralize.singular(tag)
      },
      chooseColor(httpMethod) {
        httpMethod = httpMethod.toUpperCase();
        switch (httpMethod) {
          case 'GET':
            return 'blue';
          case 'PATCH':
            return 'orange';
          case 'POST':
            return 'green';
          case 'DELETE':
            return 'red';
          default:
            return 'blue';
        }
      },
      reset(entry) {
        const newParams = {};
        (entry.parameters || []).forEach(p => {
          newParams[p.name] = (p.in === 'query' && this.queryParams && this.queryParams[p.name]) || (p.in === 'header' && this.headers && this.headers[p.name]) || null
          if (!newParams[p.name]) {
            if (p.schema && p.schema.enum) {
              newParams[p.name] = p.schema.enum[0]
            }
            if (p.schema && p.schema.type === 'array') {
              newParams[p.name] = []
            }
            if (p.example) {
              newParams[p.name] = p.example
            }
          }
        })
        this.currentRequest.params = newParams

        const newSecurity = {}
        entry.security.forEach(s => {
          this.$set(newSecurity, s.scheme.name, this.currentRequest.security[s.scheme.name] || null)
        })
        this.currentRequest.security = newSecurity

        if (entry.requestBody) {
          this.currentRequest.contentType = entry.requestBody.selectedType
          const example = entry.requestBody.content[this.currentRequest.contentType].example
          this.currentRequest.body = typeof example === 'string' ? example : stringify(example, null, 2)
        }
      },
      select(entry) {
        this.reset(entry)
        this.selectedEntry = entry
      },
      openSchemaDialog(schema) {
        this.currentSchema = schema
        this.$refs.schemaDialog.open()
      },
      openExamplesDialog(examples) {
        this.currentExamples = examples
        this.$refs.examplesDialog.open()
      },
      openFieldsDialog(fields) {
        this.currentFields = fields
        this.$refs.fieldsDialog.open()
      },
      prepareHTTPRequest() {
        const entry = this.selectedEntry
        const request = this.currentRequest
        if (!entry || !request) return
        let params = Object.assign({}, ...(entry.parameters || [])
          .filter(p => p.in === 'query' && (p.schema.type === 'array' ? request.params[p.name].length : request.params[p.name]))
          .map(p => ({
            // TODO : join character for array should depend of p.style
            [p.name]: p.schema.type === 'array' ? request.params[p.name].join(',') : request.params[p.name]
          }))
        )
        let headers = Object.assign({}, ...(entry.parameters || [])
          .filter(p => p.in === 'header' && (p.schema.type === 'array' ? request.params[p.name].length : request.params[p.name]))
          .map(p => ({
            // TODO : join character for array should depend of p.style
            [p.name]: p.schema.type === 'array' ? request.params[p.name].join(',') : request.params[p.name]
          }))
        )

        entry.security
          .filter(s => !!request.security[s.scheme.name])
          .forEach(s => {
            if (s.scheme.in === 'header') {
              headers[s.scheme.name] = request.security[s.scheme.name]
            } else if (s.scheme.in === 'query') {
              params[s.scheme.name] = request.security[s.scheme.name]
            }
          })

        const httpRequest = {
          method: entry.method,
          url: this.api.servers.length && (this.api.servers[0].url + entry.path.replace(/{(\w*)}/g, (m, key) => {
            return request.params[key]
          })),
          params,
          headers,
          credentials: true
        }

        const contentType = this.selectedEntry.requestBody && this.selectedEntry.requestBody.selectedType
        if (contentType) {
          headers['content-type'] = this.selectedEntry.requestBody.selectedType
          if (contentType === 'multipart/form-data') {
            httpRequest.body = this.$refs.requestForm.getFormData()
          } else {
            httpRequest.body = request.body
          }
        }

        this.httpRequest = httpRequest
      },
      request() {
        this.prepareHTTPRequest()
        axios(this.httpRequest).then(res => {
          this.currentResponse = res
        }, res => {
          this.currentResponse = res
        })
      }
    },
    async mounted() {
      const raw = await loadOpenapi(this.swaggerYaml)
      this.api = jsYaml.load(raw)
      this.tags = await processApi(this.api)
      this.versions =  this.api.servers.map(
              server => server.url.substring(server.url.length - 2))
      if(this.versions.every(version => version.substring(0,1) !== 'v'))
      {
        console.log(`VUESWAG WARNING!!! Make sure your server url(s) is/are versioned as 'v0', v1', 'v2' etc, and that the version is indicated at the end of the url path
    Some examples: http://apisarefun.io/api/v1, https://www.myapisgotswagger.api.com/v3, http://www.myapiiscoolerthanyourapi.org/v0`)}
      this.version = this.versions.reduce(
              (mostRecent, version) => parseInt(version.substring(1)) > parseInt(mostRecent.substring(1)) ?
                      version:
                      mostRecent,'v-1')

      this.baseUrl = this.api.servers[0].url.substring(0, this.api.servers[0].url.length - 2)
    }
  }

  const defaultStyle = {
    query: 'form',
    path: 'simple',
    header: 'simple',
    cookie: 'form'
  }

  const loadOpenapi = async (yaml) => {
    const {data} = await axios.get(yaml)
    return data
  }

  const processApi = async (derefAPI) => {
    const tags = {}
    Object.keys(derefAPI.paths).forEach(path => {
      Object.keys(derefAPI.paths[path])
        .filter(method => ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].indexOf(method.toLowerCase()) !== -1)
        .forEach(method => {
          const entry = derefAPI.paths[path][method]
          entry.method = method
          entry.path = path
          // Filling tags entries
          entry.tags = entry.tags || []
          if (!entry.tags.length) {
            entry.tags.push('No category')
            console.log(`VUESWAG WARNING!! 'Path: ${entry.path}, Method: ${entry.method}' doesn't have a tag associated with it  in your api definition (yaml file),
            So VueSwag will not be able to reach its full potential for you.`)
          }
          entry.tags.forEach(tag => {
            tags[tag] = tags[tag] || []
            tags[tag].push(entry)
          })

          // Add path level parameters to the operation
          entry.parameters = entry.parameters || []
          if (derefAPI.paths[path].parameters) {
            entry.parameters = derefAPI.paths[path].parameters.concat(entry.parameters)
          }
          if (entry.parameters) {
            entry.parameters.forEach(p => {
              p.style = p.style || defaultStyle[p.in]
              p.explode = p.explode || (p.style === 'form')
              p.schema = p.schema || {type: 'string'}
            })
          }
          if (entry.requestBody) {
            if (entry.requestBody.content && Object.keys(entry.requestBody.content).length) {
              Vue.set(entry.requestBody, 'selectedType', Object.keys(entry.requestBody.content)[0])
              entry.requestBody.required = true
              //Object.values(entry.requestBody.content).forEach(contentType => processContent(contentType, api))
            }
          }

          // security comes from the root ofthe API or the operation
          entry.security = entry.security || derefAPI.security || []
          entry.security.forEach(s => {
            const key = Object.keys(s)[0]
            s.key = key
            s.scheme = derefAPI.components.securitySchemes[key]
          })

          // Some preprocessing with responses
          entry.schema = ''
          entry.example = ''
          entry.responses = entry.responses || []

          let newResponses = []
          if (entry.responses) {
            Object.keys(entry.responses).forEach(response => {
              if ((response === '200' || response === '201') && entry.responses[response].content) {
                entry.schema = entry.responses[response].content['application/json'].schema;
                entry.example = entry.responses[response].content['application/json'].example;
              }
              newResponses.push({
                "code": response,
                "description": entry.responses[response].description,
              })
            })
          }
          entry.responses = newResponses

        })
    })

    return tags
  }


</script>

<style>
  li.v-expansion-panel__container {
    margin-bottom: 5px;
  }
  li .v-expansion-panel__header {
    padding-top: 1px;
    padding-right: 10px;
    padding-left: 1px;
    padding-bottom: 1px;
  }
  li .v-expansion-panel__body {
    padding-top: 1px;
    padding-right: 1px;
    padding-left: 1px;
    padding-bottom: 1px;
  }
  li .v-expansion-panel__body .v-card__text {
    padding-top: 1px;
    padding-right: 1px;
    padding-left: 1px;
    padding-bottom: 1px;
  }
</style>
