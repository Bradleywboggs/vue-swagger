<template>
  <v-flex class="mr-2">
    <v-toolbar flat height="40px" color="grey darken-3">
      <v-toolbar-title class="subheading grey--text text--lighten-1">{{ schema.title }}</v-toolbar-title>
    </v-toolbar>
    <div class="schema-description">{{ schema.description }}</div>
    <div class="schema-list-header red--text">required</div>
    <ul class="schema-ul">
      <li v-for="(item, key) in schema.required" :key="key">{{ item }}</li>
    </ul>
    <div class="schema-list-header blue--text">properties</div>
    <table class="schema-table">
      <thead>
        <tr>
          <th>name</th>
          <th>type</th>
          <th>description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, key) in schema.properties" :key="key">
          <td>{{ key }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.description }}</td>
        </tr>
      </tbody>
    </table>
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
        expandAll: false
      }
    },
    computed: {
      depth() {
        // return 1
        return this.expandAll ? 5 : 1
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
  .schema-description {
    margin: 0 2em 0 2em;
  }
  .schema-list-header {
    text-align: center;
    font-weight: bold;
    margin: 1.5em 2em;
    border-bottom: 1px #999999 solid;
  }
  .schema-ul {
    columns: 2;
    -webkit-columns: 2;
    -moz-columns: 2;
    margin: 1.5em 2em;
    list-style-type: none;
  }
  .schema-table {
    width: 95%;
    margin: 1.5em 2em;
  }
  .schema-table th,
  .schema-table td {
    border-bottom: 1px #666666 solid;
    padding: 4px;
  }
  .schema-table th {
    text-align: center;
    font-size: .85em;
  }
  .schema-table td {
    min-width: 33.3%;
  }
</style>
