<template>
    <v-flex sm6 class="mr-2">
        <v-toolbar flat height="40px" color="grey darken-3">
            <v-toolbar-title class="subheading grey--text text--lighten-1">Response Codes</v-toolbar-title>
        </v-toolbar>
        <v-data-table
                :headers="headers"
                :items="responses"
                class="elevation-1"
                hide-actions
        >
            <template v-slot:items="props">
                <td>{{ props.item.code }}</td>
                <td>{{ props.item.description }}</td>
            </template>
        </v-data-table>
    </v-flex>
</template>

<script>
    export default {
        name: 'ResponseCodes',
        props: ['responses'],
        data() {
            return {
                headers: [
                    {text: 'Code', value: 'code'},
                    {text: 'Description', value: 'description'},
                ],
            }
        }
    }
</script>`

<style lang="css">
</style>
