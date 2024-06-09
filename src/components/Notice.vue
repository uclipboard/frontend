<template>

    <v-snackbar v-model="snackbar">
        {{ snackbarText }}

        <template v-slot:actions>
            <v-btn color="secondary" variant="text" @click="snackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>

    <v-dialog
      v-model="dialog"
      width="auto"
      min-width="20%"
      max-width="60%"
      >
      <v-card
        prepend-icon="mdi-alert"
        :text="dialogText"
        :title="dialogTitle"
      >
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            text="Ok"
            @click="dialog = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>


</template>

<script setup>
import { onMounted, ref } from 'vue';
const dialog = ref(false)
const dialogText = ref("")
const snackbar = ref(false)
const snackbarText = ref("")
const dialogTitle = ref("")

async function openSnackbar(text) {
    console.log(`openSnackbar(${text})`)

    snackbarText.value = text
    snackbar.value = true
}


async function openDialog(title,text) {
    console.log(`openDialog(${title},${text})`)

    dialogTitle.value = title
    dialogText.value = text
    
    dialog.value = true
}


defineExpose({
    openSnackbar,
    openDialog
})

onMounted(_ => {
    console.log("mount notice")
})
</script>