const SERVICE_URL = "luna://com.jeppeman.lg.playground.service/"

export function findDevicesOnNetwork(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        webOS.service.request<string[]>(SERVICE_URL, {
            method: "findDevicesOnNetwork",
            onSuccess: response => resolve(response.payload),
            onFailure: error => reject(error)
        })
    })
}

export type ConnectToDeviceRequestPayload = { host: string; username: string; password: string }

export function connectToDevice(payload: ConnectToDeviceRequestPayload): Promise<void> {
    return new Promise((resolve, reject) => {
        webOS.service.request(SERVICE_URL, {
            method: "connectToDevice",
            parameters: payload,
            onSuccess: () => resolve(),
            onFailure: error => reject(error)
        })
    })
}

export type ListFilesOnDeviceRequestPayload = { host: string; directory: string }
export type ListFilesOnDeviceResponsePayload = { name: string; path: string; isDirectory: boolean }[]

export function listFilesOnDevice(payload: ListFilesOnDeviceRequestPayload): Promise<ListFilesOnDeviceResponsePayload> {
    return new Promise((resolve, reject) => {
        webOS.service.request<ListFilesOnDeviceResponsePayload>(SERVICE_URL, {
            method: "listFilesOnDevice",
            parameters: payload,
            onSuccess: response => resolve(response.payload),
            onFailure: error => reject(error)
        })
    })
}

export type ReadFileOnDeviceRequestPayload = { host: string; file: string }

export function readFileOnDevice(payload: ReadFileOnDeviceRequestPayload): Promise<any> {
    return new Promise((resolve, reject) => {
        webOS.service.request<string>(SERVICE_URL, {
            method: "readFileOnDevice",
            parameters: payload,
            onSuccess: response => resolve(response.payload),
            onFailure: error => reject(error)
        })
    })
}


export type CloseConnectionPayload = { host: string }

export function closeConnection(payload: CloseConnectionPayload): Promise<void> {
    return new Promise((resolve, reject) => {
        webOS.service.request(SERVICE_URL, {
            method: "closeConnection",
            parameters: payload,
            onSuccess: () => resolve(),
            onFailure: error => reject(error)
        })
    })
}
