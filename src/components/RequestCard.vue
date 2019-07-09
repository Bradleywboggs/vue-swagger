<template>
  <v-flex lg12 class="pa-1">
    <v-toolbar height="40px">
      <v-toolbar-title>Request</v-toolbar-title>
    </v-toolbar>
    <v-card :class="[color, 'darken-5']">
      <v-card-text>
        <v-layout row ma-2>
          <request-parameters
                  :entry="entry"
                  :version="version"
                  :baseUrl="baseUrl"
          ></request-parameters>
          <get-request-example
                  v-if="entry.method === 'get'"
                  :entry="entry"
                  :version="version"
                  :baseUrl="baseUrl"
          >
          </get-request-example>
          <post-patch-req-example
                  v-if="['post', 'patch'].includes(entry.method)"
                  :entry="entry"
          ></post-patch-req-example>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  import RequestParameters from './RequestParameters.vue'
  import GetRequestExample from './GetRequestExample.vue'
  import PostPatchReqExample from './PostPatchReqExample.vue'

  export default {
    name: 'request-card',
    components: {
      RequestParameters,
      GetRequestExample,
      PostPatchReqExample
    },
    props: [
      'color',
      'entry',
      'version',
      'baseUrl',
    ],
    methods: {
    }


  }
</script>

<style scoped>

</style>
