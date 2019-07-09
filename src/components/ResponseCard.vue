<template>
  <v-flex lg12 class="pa-1">
    <v-toolbar height="40px">
      <v-toolbar-title>Response</v-toolbar-title>
    </v-toolbar>
    <v-card :class="[color, 'darken-5']">
      <v-card-text>
        <v-layout row ma-2>
          <response-codes :responses="entry.responses"></response-codes>
          <response-schema :schema="entry.example"></response-schema>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  import ResponseCodes from './ResponseCodes.vue'
  import ResponseSchema from './ResponseSchema.vue'

  export default {
    name: "response-card",
    components: {
      ResponseCodes,
      ResponseSchema
    },
    props: [
      'color',
      'entry'
    ]
  }
</script>

<style scoped>

</style>


