export function buildLocalClipboard(c) {
    let val = {
        content: c.content,
        date: new Date(c.ts),
        hostname: c.hostname,
        type: c.content_type
    }
    return val
}
export function buildRemoteClipboard(content, type = "text") {
    const requestClipboardData = {
        ts: new Date().getTime(),
        content: content,
        hostname: "brower",
        content_type: type
    }
    return requestClipboardData
}
// https://gist.github.com/n1k0/b17b5c248a3ee1df99acaae000eccae4
export async function copyToClipoard(text) {
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

export function arrayIncludeAClipboard(arr, c) {
    return arr.some(i => {
        return i.content === c.content &&
            i.date.getTime() == c.date.getTime() &&
            i.hostname == c.hostname && i.type == c.type
    })
}


export function buildUploadResponseText(uploadResponse) {
    const metadata = uploadResponse

    return `${metadata.file_name}@${metadata.file_id} expires ${metadata.life_time}s` 
}

export function clipboardDateFormat(date) {
    // 30s ago :now
    // 1m - 10m ago : show Xm Xs ago
    // 10m - 1h ago : show Xm ago
    // 1h - 24h : show Xh ago
    // 1d - 3d : show Xd ago
    // else : show date.toLocaleString()

    const now = new Date()
    const diff = now - date
    const diffSeconds = Math.floor(diff / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffSeconds < 30) {
        return "now"
    }
    else if (diffMinutes < 1) {
        return `${diffSeconds}s ago`
    }
    else if (diffMinutes < 10) {
        return `${diffMinutes}m ${diffSeconds % 60}s ago`
    }
    else if (diffHours < 1) {
        return `${diffMinutes}m ago`
    }
    else if (diffHours < 24) {
        return `${diffHours}h ago`
    }
    else if (diffDays < 3) {
        return `${diffDays}d ago`
    }
    else {
        return date.toLocaleString()
    }
}
export function isOnlyWhitespace(s){
    return /^\s+$/.test(s)
}
