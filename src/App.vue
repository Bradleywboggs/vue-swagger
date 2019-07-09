<template>
  <v-app id="app" dark>
    <v-content>
      <v-container fluid fill-height>
        <vue-swag
        swagger-yaml="http://10.0.1.84:8082/openapi2.yaml"
        ></vue-swag>

      </v-container>
    </v-content>
  </v-app>
</template>
<script>
  import VueSwag from './components/VueSwag.vue'

  export default {
    name: 'App',
    components: {
      VueSwag
    },
    data () {
      return {
        //
      }
    }
  }
</script>
