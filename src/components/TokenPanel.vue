<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-text-field v-model="token" :rules="rules" label="token"></v-text-field>
    <v-row no-gutters>
      <v-col class="mr-2">
        <v-btn :loading="loading" text="update" type="submit" block></v-btn>
      </v-col>
      <v-col class="ml-2">
        <v-btn :loading="loading" text="clear" @click="clear" block></v-btn>
      </v-col>
    </v-row>

  </v-form>
  <Notice ref="noticeRef" />
</template>
<script setup>
import config from '@/assets/config';
import { MD5 } from 'crypto-js';
import Notice from './Notice'
import { ref } from 'vue';

const loading = ref(false)

const rules = [value => checkApi(value)]
const timeout = ref(null)
const token = ref("")
const noticeRef = ref(null);

async function submit(event) {
  loading.value = true

  const results = await event
  if (results["valid"]) {
    let encryptSalt = config.ENCRYPT_SALT
    let md5_1 = MD5(encryptSalt + token.value)
    let md5_2 = MD5(encryptSalt + md5_1)
    let md5_3 = MD5(encryptSalt + md5_2)
    console.log(`update token ${md5_3}`)
    localStorage.setItem(config.LOCAL_STORAGE_TOKEN_NAME, md5_3)
    token.value = ""
  }
  loading.value = false

}
async function clear() {
  clearTimeout(timeout.value)
  timeout.value = setTimeout(() => {
    localStorage.removeItem(config.LOCAL_STORAGE_TOKEN_NAME)
    noticeRef.value.openSnackbar("clear token completed.")
  }, 500)
}
async function checkApi(token) {
  return new Promise(resolve => {
    clearTimeout(timeout.value)
    timeout.value = setTimeout(() => {
      if (!token) return resolve('Please enter a token')
      return resolve(true)
    }, 500)
  })
}
</script>
