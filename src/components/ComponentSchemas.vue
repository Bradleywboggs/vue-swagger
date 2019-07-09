<template>
    <v-expansion-panel
      id="components-schema"
      v-model="current">
        <v-expansion-panel-content v-for="(schema, i) in schemas" :key="i">
            <template v-slot:header>
                <h3 :id="i">{{ i }}</h3>
            </template>
            <v-layout row ma-2>
                <v-flex>
                    <schema-view :schema="schema"></schema-view>
                </v-flex>
            </v-layout>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script>
    import SchemaView from './SchemaView.vue'

    export default {
        name: "component-schemas",
        components: {
            SchemaView,
        },
        props: [ 'schemas', 'panel' ],
        data() {
            return {
                current: -1
            }
        },
        watch: {
            panel() {
                this.current = Object.keys(this.schemas).indexOf(this.panel)
                setTimeout(() => {
                    window.document.getElementById(this.panel).scrollIntoView(true)
                }, 500)
            }
        }
    }
</script>

<style>
    #components-schema div.v-expansion-panel__header {
        padding-left: 10px;
    }
</style>
