<template>
    <v-flex lg12 class="my-4">
        <v-toolbar>
            <v-toolbar-title>Schemas</v-toolbar-title>
        </v-toolbar>
        <v-card>
            <v-card-text>
                <component-schemas
                  :panel="panel"
                  :schemas="components.schemas"/>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
    import ComponentSchemas from './ComponentSchemas.vue'

    export default {
        name: "components",
        props: [ 'components', 'panel' ],
        components: {
            ComponentSchemas,
        }
    }
</script>

<style scoped>

</style>
