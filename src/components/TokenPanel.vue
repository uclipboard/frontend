<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-text-field v-model="token" :rules="rules" label="token"></v-text-field>

    <v-btn :loading="loading" text="update" type="submit" block></v-btn>
  </v-form>
</template>
<script>
import config from '@/assets/config';
import { MD5 } from 'crypto-js';
export default {
  data: vm => ({
    loading: false,
    rules: [value => vm.checkApi(value)],
    timeout: null,
    token: "",
  }),

  methods: {
    async submit(event) {
      this.loading = true

      const results = await event
      if (results["valid"]) {
        let encryptSalt = config.ENCRYPT_SALT
        let md5_1 = MD5(encryptSalt + this.token)
        let md5_2 = MD5(encryptSalt + md5_1)
        let md5_3 = MD5(encryptSalt + md5_2)
        console.log(`update token ${md5_3}`)
        localStorage.setItem(config.LOCAL_STORAGE_TOKEN_NAME, md5_3)
      }
      this.loading = false

    },
    async checkApi(token) {
      return new Promise(resolve => {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          if (!token) return resolve('Please enter a token')
          return resolve(true)
        }, 500)
      })
    },
  },
}
</script>