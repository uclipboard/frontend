<template>

    <v-textarea label="clipboard text" v-model="inputText" counter clearable></v-textarea>
    <v-row no-gutters>
            <v-col class="mr-2">
                <v-btn :loading="textActionLoading" text="push" @click="push" block></v-btn>
            </v-col>
            <v-col class="ml-2">
                <v-btn :loading="textActionLoading" text="pull" @click="pull" block></v-btn>
            </v-col>
    </v-row>


    <v-form validate-on="submit lazy" class="mt-4" @submit.prevent="upload">
        <v-file-input label="Select file" v-model="selectedFile" variant="underlined" show-size></v-file-input>
        <v-btn :loading="uploadFileLoading" text="upload" type="upload" block></v-btn>
    </v-form>


    <v-list lines="one" class="mt-4">
        <v-list-item v-for="i in clipboardsHistory" :prepend-icon="i.type == 'text' ? 'mdi-text-long' : 'mdi-file'"
            :key="i" :title="`${i.hostname} at ${i.date.toLocaleString()}`" :subtitle="i.content"
            @click="copy(i)"></v-list-item>
    </v-list>
    <Notice ref="noticeRef" />


</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Notice from './Notice'

import config from '@/assets/config';
import { buildUploadResponseText, buildLocalClipboard, copyToClipoard, arrayIncludeAClipboard, buildRemoteClipboard } from '@/assets/utils'
import { ErrUnAuth, sendHistoryRequest, sendPullRequest, sendPushRequest, sendUploadRequest } from '@/assets/request';


const textActionLoading = ref(false)
const inputText = ref("")
const selectedFile = ref(null)
const uploadFileLoading = ref(false)
const clipboardsHistory = ref([
    {
        content: "hello world!",
        type: "text",
        hostname: "uclipboard",
        date: "now",
    }
])
const noticeRef = ref(null);

let pullTimerFd = null


async function snackbar(text) {
    noticeRef.value.openSnackbar(text)
}
async function dialog(text, title = "warning") {
    noticeRef.value.openDialog(title, text)

}
async function copy(i) {
    if (i.type != "text") {
        copyToClipoard(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_DOWNLOAD}/${i.content}?token=${localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)}`);
        snackbar("File url has been copied, you can download it by yourself.")
    } else {
        copyToClipoard(i.content);
        snackbar(`'${i.content}' copied!`)

    }

}

function handleUnauthError(e) {
    if (e instanceof ErrUnAuth) {
        dialog("Token is incorrect! After the correct token is entered, click 'pull' to reload data.")
        if (pullTimerFd !== null) {
            clearInterval(pullTimerFd)
            pullTimerFd = null
            console.debug("remove pull timer")
        }
        return
    } else {
        throw e
    }

}
async function upload() {

    uploadFileLoading.value = true
    if (selectedFile.value === null) {
        dialog("file is empty!")
    } else {
        let uploadResponse
        try {
            uploadResponse = await sendUploadRequest(selectedFile.value)
        } catch (e) {
            handleUnauthError(e)
            return
        }
        dialog(buildUploadResponseText(uploadResponse), "file infomation")

        selectedFile.value = null
    }
    uploadFileLoading.value = false
}
async function push() {
    console.debug(inputText.value)
    if (inputText.value === "") {
        dialog("Input clipboard is empty!")
        return
    }
    textActionLoading.value = true
    console.debug(`upload ${inputText.value}`)
    const requestClipboardData = buildRemoteClipboard(inputText.value)
    console.debug(requestClipboardData)
    let responseClipboardPushRequest
    try {
        responseClipboardPushRequest = await sendPushRequest(requestClipboardData)
    } catch (e) {
        handleUnauthError(e)
        return
    }

    console.debug(JSON.stringify(responseClipboardPushRequest))

    inputText.value = ""
    textActionLoading.value = false
    snackbar("Push clipboard success!")
    pull()
}
async function pull() {
    console.debug("pull data")
    textActionLoading.value = true
    if (pullTimerFd === null) {
        console.debug("reopen pull timer")
        getHistory()
        pullTimerFd = setInterval(getLatestUpdate, config.PULL_INTERVAL_MS)
    }
    await getLatestUpdate()
    textActionLoading.value = false
}
async function getLatestUpdate() {
    console.debug("update clipboard history")
    let responesClipboardLatest
    try {
        responesClipboardLatest = await sendPullRequest()
    } catch (e) {
        handleUnauthError(e)
        return
    }
    console.debug(responesClipboardLatest)
    responesClipboardLatest.forEach(e => {
        let clipboard = buildLocalClipboard(e)
        if (!arrayIncludeAClipboard(clipboardsHistory.value, clipboard)) {
            console.debug(`push ${JSON.stringify(clipboard)}`)

            clipboardsHistory.value = [clipboard, ...clipboardsHistory.value]
        }
    });
}
async function getHistory() {
    clipboardsHistory.value = []
    let responesClipboardHostory;
    try {
        responesClipboardHostory = await sendHistoryRequest()
    } catch (e) {
        handleUnauthError(e)
        return
    }
    console.debug(responesClipboardHostory)
    responesClipboardHostory.forEach(e => {
        clipboardsHistory.value.push(buildLocalClipboard(e))
    })

}

onMounted(_ => {
    getHistory()
    pullTimerFd = setInterval(getLatestUpdate, config.PULL_INTERVAL_MS)

})

onUnmounted(_ => {
    if (pullTimerFd !== null) {
        clearInterval(pullTimerFd)
        pullTimerFd = null
    }
})


</script>