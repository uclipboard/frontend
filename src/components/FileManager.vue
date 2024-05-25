<template>
  <v-form validate-on="submit lazy" @submit.prevent="upload">

    <v-file-input label="Select file" v-model="selectedFile" variant="underlined" show-size></v-file-input>
    <v-btn :loading="uploadLoading" text="upload" type="upload" block></v-btn>


  </v-form>
  <v-form validate-on="submit lazy" class="mt-4" @submit.prevent="download">

    <v-text-field label="file name" v-model="downloadFileName">
    </v-text-field>

    <v-btn :loading="downloadLoading" text="download" block></v-btn>
    <v-chip class="mt-4" prepend-icon="mdi-message-alert-outline">download latest file with empty file name</v-chip>

  </v-form>




  <v-dialog v-model="dialog" width="auto">
    <v-card max-width="400" prepend-icon="mdi-update" :text="dialogMsg" title="WARNING">
      <template v-slot:actions>
        <v-btn class="ms-auto" text="ok" @click="dialog = false"></v-btn>
      </template>
    </v-card>
  </v-dialog>

</template>

<script>
import config from '@/plugins/config';

async function downloadFile(fileUrl, filename) {
    const response = await fetch(fileUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

export default {
  data: vm => ({
    uploadLoading: false,
    downloadLoading: false,
    selectedFile: null,
    dialog: false,
    dialogMsg: "",
    downloadFileName: "",
  }),
  methods: {
    async upload(event) {
      this.uploadLoading = true
      if (this.selectedFile == null) {
        this.dialogMsg = "file is not select!"
        this.dialog = true
      } else {
        let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)
        // TODO:upload file
        this.selectedFile = null
      }
      this.uploadLoading = false
    },
    async download() {
      this.downloadLoading = true
      // TODO:download file
      this.downloadFileName = ""
      this.downloadLoading = false
    }
  }
}
</script>
