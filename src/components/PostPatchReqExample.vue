<template>
  <v-flex sm6 class="mr-2">
    <v-toolbar flat height="40px" color="grey darken-3">
      <v-toolbar-title class="subheading grey--text text--lighten-1">Request Body Example</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <json-viewer
                :value="processedRequestBodyExample"
                :expand-depth=5
                theme="json-viewer"
                copyable
        ></json-viewer>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  // import RequestForm from './RequestForm'
  import axios from 'axios'

  export default {
    name: "post-patch-request-example",
    props: ['entry'],
    data() {
      return {
        response: '',
      }
    },
    components: {},
    computed: {
      requestBodyExample() {
        return this.entry.requestBody.content['application/json'].example
      },
      processedRequestBodyExample() {
        return JSON.parse(this.requestBodyExample.replace(/\*/g, ``).replace(/#/g, `"`))
      },

    }
  }

</script>

<style scoped>

</style>
