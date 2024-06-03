import config from "./config"

export class ErrUnAuth extends Error {
    constructor(message) {
        super(message);
        this.name = 'ErrUnAuth';
    }
}

let fetchWrapper = async (url, options) => {
    try {
        let response = await fetch(url, options)
        if (response.status === 401) {
            throw new ErrUnAuth()
        } else if (!response.ok) {
            let errorResponse = await response.json()
            
            throw new Error(`HTTP ERROR[${response.status}]: ${errorResponse.msg}`)
        }
        return response
    }
    catch (error) {
        if (!error instanceof ErrUnAuth) console.error('There was a problem with the fetch operation:', error)
        else throw error
    }
}

// page starts with 1
export async function sendHistoryRequest(page) {
    let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)
    let response = await fetchWrapper(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_HISTORY}?token=${token}&page=${page}`)

    let responesClipboardHostory = await response.json()
    return responesClipboardHostory.data
}

export async function sendPullRequest() {
    let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)

    let response = await fetchWrapper(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_PULL}?token=${token}`)
    let responseJson = await response.json()
    return responseJson.data
}

export async function sendUploadRequest(file, lifetime = null) {
    let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)

    const formData = new FormData();

    formData.append('file', file);
    let url = `${config.API_PREFIX}/${config.API_VERSION}/${config.API_UPLOAD}?token=${token}`
    if (lifetime !== null) {
        url += `&lifetime=${lifetime}`
    }
    const response = await fetchWrapper(url, {
        method: 'POST',
        body: formData,
        headers: {
            "hostname": "browser"
        }
    });

    const uploadResponse = await response.json();
    return uploadResponse.data; // You can return the response if needed
}

export async function sendPushRequest(requestClipboardData) {
    let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)

    let response = await fetchWrapper(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_PUSH}?token=${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestClipboardData)
    })

    let respones = await response.json()
    return respones.data

}
