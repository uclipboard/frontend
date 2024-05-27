import config from "./config"

export class ErrUnAuth extends Error {
    constructor(message) {
        super(message);
        this.name = 'ErrUnAuth';
    }
}

export async function sendHistoryRequest() {
    let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)
    try {
        let response = await fetch(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_HISTORY}?token=${token}`)
        if (response.status === 401) {
            throw new ErrUnAuth()
        } else if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}\tmsg: ${response.statusText}`)
        }
        let responesClipboardHostory = await response.json()
        return responesClipboardHostory.data

    } catch (error) {
        if (!error instanceof ErrUnAuth) console.error('There was a problem with the fetch operation:', error)
        else throw error
        return []
    }

}

export async function sendPullRequest() {
    let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)

    try {
        let response = await fetch(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_PULL}?token=${token}`)
        if (response.status === 401) {
            throw new ErrUnAuth()
        } else if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}\tmsg: ${(await response.json()).msg}`)
        }
        let responesClipboardLatest = await response.json()
        return responesClipboardLatest.data
    } catch (error) {
        if (!error instanceof ErrUnAuth) console.error('There was a problem with the fetch operation:', error)
        else throw error
        return []
    }

}

export async function sendUploadRequest(file) {
    let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)

    const formData = new FormData();

    formData.append('file', file);

    try {
        const response = await fetch(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_UPLOAD}?token=${token}`, {
            method: 'POST',
            body: formData,
            headers: {
                "hostname": "browser"
            }
        });

        if (response.status === 401) {
            throw new ErrUnAuth()
        } else if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const uploadResponse = await response.json();
        return uploadResponse.data; // You can return the response if needed

    } catch (error) {
        if (!error instanceof ErrUnAuth) console.error('There was a problem with the fetch operation:', error)
        else throw error
        return {}
    }
}

export async function sendPushRequest(requestClipboardData) {
    let token = localStorage.getItem(config.LOCAL_STORAGE_TOKEN_NAME)

    try {
        let response = await fetch(`${config.API_PREFIX}/${config.API_VERSION}/${config.API_PUSH}?token=${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestClipboardData)
        })

        if (response.status === 401) {
            throw new ErrUnAuth()
        } else if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}\tmsg: ${(await response.json()).msg}`)
        }
        let respones = await response.json()
        return respones.data
    } catch (error) {
        if (!error instanceof ErrUnAuth) console.error('There was a problem with the fetch operation:', error)
        else throw error

        return {}
    }

}