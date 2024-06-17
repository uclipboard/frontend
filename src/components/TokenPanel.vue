<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-text-field v-model="token" color="secondary" :rules="rules"
      :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'" :type="visible ? 'text' : 'password'"
      @click:append-inner="visible = !visible" label="token"></v-text-field>
    <div class="d-flex ga-4">
      <div class="flex-1-0">
        <v-btn :loading="loading" text="clear" color="primary" @click="clear" block></v-btn>
      </div>
      <div class="flex-1-0">
        <v-btn :loading="loading" text="update" color="primary" type="submit" block></v-btn>
      </div>
    </div>
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
const visible = ref(false)

async function submit(event) {
  loading.value = true

  const results = await event
  console.log(results.valid)
  if (!results.valid) {
    loading.value = false
    return
  }
  let encryptSalt = config.ENCRYPT_SALT
  let md5_1 = MD5(encryptSalt + token.value)
  let md5_2 = MD5(encryptSalt + md5_1)
  let md5_3 = MD5(encryptSalt + md5_2)
  console.log(`update token ${md5_3}`)
  localStorage.setItem(config.LOCAL_STORAGE_TOKEN_NAME, md5_3)
  token.value = ""
  noticeRef.value.openSnackbar("update token completed.")
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
