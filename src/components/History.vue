<template>

    <v-textarea label="clipboard text" v-model="text" counter></v-textarea>
    <v-row no-gutters>
        <v-col cols="12" sm="6">
            <v-btn :loading="loading" text="push" @click="push" block></v-btn>
        </v-col>
        <v-col cols="12" sm="6">
            <v-btn class="ml-4" :loading="loading" text="pull" @click="pull" block></v-btn>
        </v-col>
    </v-row>


    <v-list lines="one" class="mt-4">
        <v-list-item v-for="i in clipboardsHistory" :prepend-icon="i.type == 'text' ? 'mdi-text-long' : 'mdi-file'"
            :key="i" :title="`${i.hostname} at ${i.date}`" :subtitle="i.content" @click="copy(i)"></v-list-item>
    </v-list>
    <v-snackbar v-model="snackbar">
        {{ snackbarText }}

        <template v-slot:actions>
            <v-btn color="blue" variant="text" @click="snackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>

</template>

<script>
import config from '@/plugins/config';

function buildClipboard(c) {
    let val = {
        content: c.content,
        date: new Date(c.ts),
        hostname: c.hostname,
        type: c.content_type
    }
    return val
}
// https://gist.github.com/n1k0/b17b5c248a3ee1df99acaae000eccae4
async function copyToClipoard(text) {
    if ("clipboard" in navigator && typeof navigator.clipboard.writeText === "function") {
        // Chrome
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(() => false);
    } else {
        // Firefox
        const input = document.createElement("input");
        input.value = text;
        input.style.position = "fixed";
        input.style.top = "-2000px";
        document.body.appendChild(input);
        input.select();
        try {
            return Promise.resolve(document.execCommand("copy"))
                .then(res => {
                    document.body.removeChild(input);
                    return res;
                });
        } catch (err) {
            return Promise.resolve(false);
        }
    }
}




function arrIncludeClipboard(arr, c) {
    return arr.some(i => {
        return i.content === c.content &&
            i.date.getTime() == c.date.getTime() &&
            i.hostname == c.hostname && i.type == c.type
    })
}
export default {
    data: vm => ({
        loading: false,
        snackbar: false,
        snackbarText: "",
        text: "",
        pullTimerFd: null,
        clipboardsHistory: [
            {
                content: "hello world!",
                type: "text",
                hostname: "uclipboard",
                date: "now",
            }
        ]
    }),

    methods: {
        async copy(i) {
            copyToClipoard(i.content);
            if (i.type != "text") {
                this.snackbarText = `'${i.content}' filename copied, download it in file panel!`
            } else {
                this.snackbarText = `'${i.content}' copied!`
            }
            this.snackbar = true

        },

        async push() {
            // TODO:error handler
            this.loading = true
            console.log(`upload ${this.text}`)
            const requestClipboardData = {
                ts: new Date().getTime(),
                content: this.text,
                hostname: "web_brower",
                content_type: "text"
            }
            console.log(requestClipboardData)
            await fetch(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_PUSH}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestClipboardData)
            })
            this.text = ""
            // use snakebar when success
            this.loading = false
            this.pull()
        },
        async pull() {
            console.log("pull data")
            this.loading = true

            this.update()
            this.loading = false
        },
        async update() {
            console.log("update clipboard history")

            // TODO:error handler
            let responesClipboardLatest = (await (await fetch(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_PULL}`)).json()).data
            // console.log(responesClipboardLatest)
            responesClipboardLatest.forEach(e => {
                let newClipboard = buildClipboard(e)
                if (!arrIncludeClipboard(this.clipboardsHistory, newClipboard)) {
                    console.log(`push ${JSON.stringify(newClipboard)}`)

                    this.clipboardsHistory = [newClipboard, ...this.clipboardsHistory]
                }
            });
        },
        async getHistory() {
            this.clipboardsHistory = []
            // TODO:error handler
            let responesClipboardHostory = (await (await fetch(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_HISTORY}`)).json()).data
            console.log(responesClipboardHostory)
            responesClipboardHostory.forEach(e => {
                this.clipboardsHistory.push(buildClipboard(e))
            })

        }
    },
    mounted: function () {
        this.getHistory()
        this.pullTimerFd = setInterval(this.update, config.PULL_INTERVAL_MS)

    },
    unmounted: function () {
        clearInterval(this.pullTimerFd)
    }
}
</script>