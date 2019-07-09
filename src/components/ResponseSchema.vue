<template>
  <v-flex sm6 class="mr-2">
    <v-toolbar flat height="40px" color="grey darken-3">
      <v-toolbar-title class="subheading grey--text text--lighten-1">Response Schema</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-switch
        v-if="schema"
        v-model="expandAll"
        label="expand all"
        @change="rerenderViewer"
      ></v-switch>
    </v-toolbar>
    <v-card>
      <v-card-text ma-2>
        <div
            :class="viewerClass"
            v-if="schema">
              <json-viewer
                    :key="viewerKey"
                    :value="processedSchema"
                    :expand-depth="depth"
                    copyable
                    theme="json-viewer"
             ></json-viewer>
          </div>
        <div v-else>
          <v-flex pl-4>No Schema Available</v-flex>
        </div>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>

  export default {
    name: 'ResponseSchema',
    props: [
      'schema'
    ],
    data() {
      return {
        expandAll: false,
        viewerKey: 0,
      }
    },
    computed: {
      processedSchema() {
        return typeof this.schema === 'string'
                ? JSON.parse(this.schema.replace(/\*/g, ``).replace(/#/g, `"`))
                : this.schema
      },
      depth() {
        return !this.expandAll ? 1 : 10
      },
      viewerClass() {
        return this.expandAll ? 'scrolling-viewer' : ''
      }
    },
    methods:{
      toggleDepth() {
        !this.expandAll ? this.depth = 1 : this.depth = 10
      },
      rerenderViewer() {
        this.toggleDepth();
        this.viewerKey += 1
      }
    }
  }
</script>

<style>
  .v-toolbar__content .v-input {
    flex: 0 1 auto;
  }
  .v-toolbar__content .v-input.v-input--selection-controls  {
    padding-top: 1.5em;
  }
</style>
