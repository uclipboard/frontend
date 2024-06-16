<template>

    <v-textarea label="clipboard text" v-model="inputText" counter clearable></v-textarea>
    <div class="d-flex ga-4">
        <div class="flex-1-0">
            <v-btn :loading="textActionLoading" text="push" @click="push" block></v-btn>
        </div>
        <div class="flex-1-0">
            <v-btn :loading="textActionLoading" text="pull" @click="pull" block></v-btn>
        </div>
    </div>

    <v-form validate-on="submit lazy" class="mt-4" @submit.prevent="upload">
        <v-file-input label="Select file" v-model="selectedFile" variant="solo" show-size></v-file-input>
        <div class="d-flex ">
            <div class="align-self-center">
                <v-checkbox-btn v-model="uploadFileWithLifeTime"></v-checkbox-btn>
            </div>
            <div class="flex-1-0">
                <v-text-field :disabled="!uploadFileWithLifeTime" label="file lifetime" v-model="fileLifetime"
                    variant="outlined" hide-details>
                    <template v-slot:prepend>
                        <v-tooltip location="bottom" open-on-click>
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" icon="mdi-help-circle-outline"></v-icon>
                            </template>
                            supported suffix: s,m,h,d default:s
                        </v-tooltip>
                    </template>
                </v-text-field>
            </div>
        </div>
        <v-btn class="mt-4" :loading="uploadFileLoading" text="upload" type="upload" block></v-btn>
    </v-form>
    <v-checkbox label="copy text to the textfield above" v-model="copyToTextfield" hide-details></v-checkbox>

    <v-pagination v-model="currentPage" :length="pageCount" rounded="circle"></v-pagination>
    <v-list lines="one" class="mt-4">

        <div class="text-center" v-if="listLoading">
            <v-progress-circular color="primary" indeterminate></v-progress-circular>
        </div>

        <v-list-item v-for="i in clipboardsHistory" :prepend-icon="i.type == 'text' ? 'mdi-text-long' : 'mdi-file'"
            :key="i" :title="`${i.hostname} | ${clipboardDateFormat(i.date)}`"
            :subtitle="isOnlyWhitespace(i.content) ? '[invisible]' : i.content" @click="copy(i)" />
    </v-list>
    <Notice ref="noticeRef" />


</template>
<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import Notice from './Notice'

import config from '@/assets/config';
import { buildUploadResponseText, buildLocalClipboard, copyToClipoard, arrayIncludeAClipboard, buildRemoteClipboard, isOnlyWhitespace, clipboardDateFormat } from '@/assets/utils'
import { ErrUnAuth, sendHistoryRequest, sendPullRequest, sendPushRequest, sendUploadRequest } from '@/assets/request';


const textActionLoading = ref(false)
const inputText = ref("")
const selectedFile = ref(null)
const uploadFileLoading = ref(false)
const clipboardsHistory = ref([])
const uploadFileWithLifeTime = ref(false)
const noticeRef = ref(null)
const fileLifetime = ref("300s")
const currentPage = ref(1)
const pageCount = ref(1)
const listLoading = ref(true)
const copyToTextfield = ref(false)
let pullTimerFd = null

async function snackbar(text) {
    noticeRef.value.openSnackbar(text)
}
async function dialog(text, title = "warning") {
    noticeRef.value.openDialog(title, text)

}
async function copy(i) {
    if (i.type != "text") {
        let webSitePrefix = window.location.origin
        let text = `${webSitePrefix}${config.API_PREFIX}/${config.API_VERSION}/${config.API_DOWNLOAD}/${i.content}?token=${localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)}`
        if (copyToTextfield.value) {
            inputText.value = text
        } else {
            copyToClipoard(text);
            snackbar("File url has been copied, you can download it by yourself.")
        }
    } else {
        let showText;
        if (i.content.length > config.TEXT_SHOW_LIMIT) {
            showText = i.content.slice(0, config.TEXT_SHOW_LIMIT) + "..."
        } else {
            showText = i.content
        }

        if (copyToTextfield.value) {
            inputText.value = i.content
        } else {
            copyToClipoard(i.content);
            snackbar(`'${showText}' copied!`)
        }
    }

}

let errorCounter = 0;
function handleNetworkError(e) {
    if (e instanceof ErrUnAuth) {
        dialog("Token is incorrect! After the correct token is entered, click 'pull' to reload data.")
        if (pullTimerFd !== null) {
            clearInterval(pullTimerFd)
            pullTimerFd = null
            console.debug("remove pull timer")
        }
        return
    } else {
        dialog(e.message)
        errorCounter += 1;
        if (errorCounter > 5) {
            dialog("The network is unstable, please check the network connection. Then click 'pull' to enable dynmaic data pulling.")
            errorCounter = 0
            removePullTimer()
        }
    }

}

function parseTimeStr(t) {
    if (t == "") {
        return 0
    }
    let unit = 0
    let parseLen = t.length - 1
    switch (t[t.length - 1]) {
        case 's':
            unit = 1
            break
        case 'm':
            unit = 60
            break
        case 'h':
            unit = 60 * 60
            break
        case 'd':
            unit = 60 * 60 * 24
            break
        default:
            unit = 1
            parseLen += 1
            break
    }
    console.debug(`${t.substring(0, parseLen)}`)
    let numberNoUnit = parseInt(t.substring(0, parseLen), 10)
    return numberNoUnit * unit

}

async function upload() {
    uploadFileLoading.value = true
    if (selectedFile.value === null) {
        dialog("file is empty!")
    } else {
        let uploadResponse
        try {
            if (uploadFileWithLifeTime.value) {
                if (fileLifetime.value === "") {
                    dialog("the file lifetime is empty.")
                    uploadFileLoading.value = false
                    return
                }
                if (! /^\d+[smhd]?$/.test(fileLifetime.value)) {
                    dialog("the file lifetime has the incorrect format.")
                    uploadFileLoading.value = false
                    return
                }
                let lifeTimeNumber = parseTimeStr(fileLifetime.value)
                console.log(`upload file with lifetime:${lifeTimeNumber}`)
                uploadResponse = await sendUploadRequest(selectedFile.value, lifeTimeNumber)

            } else {
                uploadResponse = await sendUploadRequest(selectedFile.value)
            }
        } catch (e) {
            handleNetworkError(e)
            uploadFileLoading.value = false

            return
        }
        dialog(buildUploadResponseText(uploadResponse), "file infomation")
        selectedFile.value = null
    }
    uploadFileLoading.value = false

}
async function push() {
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
        handleNetworkError(e)
        textActionLoading.value = false

        return
    }

    console.debug(JSON.stringify(responseClipboardPushRequest))

    inputText.value = ""
    textActionLoading.value = false
    snackbar("Push clipboard success!")
    if (pageCount.value === 1) {
        // pull data in the latest histroy page
        pull()
    }
}
async function pull() {
    console.debug("pull data")
    textActionLoading.value = true
    if (pullTimerFd === null) {
        // for some reason, the pull timer is removed, so we need to reopen it
        console.debug("reopen pull timer")
        snackbar("Pull timer has been reopened.")
        getHistory()
    } else {
        await getLatestUpdate()
    }
    textActionLoading.value = false
}
async function getLatestUpdate() {
    // console.debug("update clipboard history")
    let responesClipboardLatest
    try {
        responesClipboardLatest = await sendPullRequest()
    } catch (e) {
        handleNetworkError(e)

        return
    }
    // console.debug(responesClipboardLatest)
    responesClipboardLatest.forEach(e => {
        let clipboard = buildLocalClipboard(e)
        if (!arrayIncludeAClipboard(clipboardsHistory.value, clipboard)) {
            console.debug(`push ${JSON.stringify(clipboard)}`)

            clipboardsHistory.value = [clipboard, ...clipboardsHistory.value]
        }
    });
}
async function getHistory() {
    listLoading.value = true
    let responesClipboardHostory;
    try {
        responesClipboardHostory = await sendHistoryRequest(currentPage.value)
    } catch (e) {
        handleNetworkError(e)
        listLoading.value = false
        return
    }
    console.debug(responesClipboardHostory)
    clipboardsHistory.value = []
    if(responesClipboardHostory.history === null){
        listLoading.value = false
        snackbar("The page is empty, so reset page to 1.")
        currentPage.value = 1
        return  
    }
    responesClipboardHostory.history.forEach(e => {
        clipboardsHistory.value.push(buildLocalClipboard(e))
    })
    pageCount.value = responesClipboardHostory.pages
    listLoading.value = false

}
function removePullTimer() {
    if (pullTimerFd !== null) {
        clearInterval(pullTimerFd)
        pullTimerFd = null
    } else {
        console.debug("the pull timer that required to remove is null")

    }
}
function addPullTimer() {
    removePullTimer()
    pullTimerFd = setInterval(getLatestUpdate, config.PULL_INTERVAL_MS)
}
onMounted(async _ => {
    await getHistory()
    // set pull timer after getting history success
    addPullTimer()

})

onUnmounted(_ => {
    removePullTimer()
})
watch(currentPage, async (new_value, old_value) => {
    console.debug(new_value)
    if (new_value !== 1) {
        console.debug("pull timer added because of page changed to 1")
        removePullTimer()
    } else {
        console.debug("pull timer removed because of page changed")
        addPullTimer()
    }
    getHistory()
})

</script>
