import {FileSystemEntry} from "./device-connection";

const pkgInfo = require("./package.json");
const Service = require("webos-service");
const service = new Service(pkgInfo.name);
service.activityManager.idleTimeout = 60 * 3

let deviceConnection: ReturnType<typeof requireDeviceConnection> | null = null
const requireDeviceConnection = () => require("./device-connection")
const getDeviceConnection = () => {
    if (!deviceConnection) {
        deviceConnection = requireDeviceConnection()
    }
    return deviceConnection
}

service.register("findDevicesOnNetwork", async (message) => {
    try {
        const {findDevicesOnNetwork} = require("./find-devices-on-network")
        const devs = await findDevicesOnNetwork()
        message.respond({
            returnValue: true,
            payload: devs
        });
    } catch (e) {
        message.respond({
            returnValue: false,
            errorCode: 1,
            errorText: e.toString()
        });
    }
});

type ConnectToDeviceParams = {
    host: string
    username: string
    password: string
}

service.register("connectToDevice", async (message: Message<ConnectToDeviceParams>) => {
    try {
        const {payload: {host, username, password}} = message
        const {connectToDevice} = getDeviceConnection()
        await connectToDevice(host, username, password)
        message.respond({
            returnValue: true,
        });
    } catch (e) {
        message.respond({
            returnValue: false,
            errorCode: 1,
            errorText: e.toString()
        });
    }
})

type ListFilesOnDeviceRequestPayload = {
    host: string
    directory: string
}

service.register("listFilesOnDevice", async (message: Message<ListFilesOnDeviceRequestPayload, FileSystemEntry[]>) => {
    try {
        const {payload: {host, directory}} = message
        const {listFilesOnHost} = getDeviceConnection()
        const directoryListing = await listFilesOnHost(host, directory)
        message.respond({
            returnValue: true,
            payload: directoryListing
        });
    } catch (e) {
        message.respond({
            returnValue: false,
            errorCode: 1,
            errorText: e.toString()
        });
    }
})

type ReadFileOnDevicePayload = {
    host: string
    file: string
}

service.register("readFileOnDevice", async (message: Message<ReadFileOnDevicePayload, any>) => {
    try {
        const {payload: {host, file}} = message
        const {openFileOnHost, readFileOnHost, closeFileOnHost} = getDeviceConnection()
        const {sftp, handle} = await openFileOnHost(host, file)
        const buffer = new Buffer(65535)
        let pos = 0
        let offset = 0
        let bytesRead = 0
        while (pos <= buffer.length - 1) {
            const nbytes = await readFileOnHost(host, sftp, handle, buffer, pos, buffer.length - pos, bytesRead)
            pos+=nbytes
            bytesRead+=nbytes
            if (nbytes === 0) {
                break
            }
        }
        await closeFileOnHost(host, sftp, handle)
        message.respond({
            returnValue: true,
            payload: buffer
        });
    } catch (e) {
        message.respond({
            returnValue: false,
            errorCode: 1,
            errorText: e.toString()
        });
    }
})

type CloseConnectionPayload = { host: string }

service.register("closeConnection", async (message: Message<CloseConnectionPayload>) => {
    try {
        const {payload: {host}} = message
        const {closeConnection} = getDeviceConnection()
        closeConnection(host)
        message.respond({
            returnValue: true,
        });
    } catch (e) {
        message.respond({
            returnValue: false,
            errorCode: 1,
            errorText: e.toString()
        });
    }
})
