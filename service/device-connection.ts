const Client = require("ssh2").Client

const connections = {}

export type FileSystemEntry = {
    isDirectory: boolean
    name: string
}

export function connectToDevice(
    host: string,
    username: string,
    password: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        const ssh = new Client()
        ssh.on("ready", () => {
            connections[host] = ssh
            resolve()
        }).on("error", error => {
            reject(error)
            delete connections[host]
        }).connect({
            host,
            username,
            password
        })
    })
}

export function listFilesOnHost(host: string, directory: string): Promise<FileSystemEntry[]> {
    return new Promise((resolve, reject) => {
        const connection = connections[host]
        if (!connection) {
            reject(new Error(`${host} does not have an active connection`))
        } else {
            connection.sftp((err, sftp) => {
                if (err) reject(err);
                else sftp.readdir(directory, (err, list) => {
                    if (err) reject(err)
                    else resolve(list.map(({filename, longname}) => ({
                        name: filename,
                        path: `${directory}/${filename}`,
                        isDirectory: longname.charAt(0) === 'd'
                    })).sort((a, b) => {
                        const aDir = a.isDirectory ? 0 : 1
                        const bDir = b.isDirectory ? 0 : 1
                        const dirComparison = aDir - bDir
                        return dirComparison !== 0 ? dirComparison : a.name.localeCompare(b.name)
                    }))
                });
            });
        }
    })
}

export function readFileOnHost(
    host: string,
    sftp: any,
    handle: any,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number
): Promise<number> {
    return new Promise((resolve, reject) => {
        const connection = connections[host]
        if (!connection) {
            reject(new Error(`${host} does not have an active connection`))
        } else {
            sftp.read(handle, buffer, offset, length, position, (err, chunk) => {
                if (err) reject(err)
                else resolve(chunk)
            })
        }
    })
}

export function openFileOnHost(host: string, file: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const connection = connections[host]
        if (!connection) {
            reject(new Error(`${host} does not have an active connection`))
        } else {
            connection.sftp((err, sftp) => {
                if (err) reject(err);
                else {
                    sftp.open(file, 'r', 0o666, (err, handle) => {
                        if (err) reject(err)
                        else resolve({sftp, handle})
                    })
                }
            });
        }
    })
}

export function closeFileOnHost(host: string, sftp: any, handle: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const connection = connections[host]
        if (!connection) {
            reject(new Error(`${host} does not have an active connection`))
        } else {
            sftp.close(handle, (err) => {
                if (err) reject(err)
                else resolve()
            })
        }
    })
}

export function closeConnection(host: string) {
    connections[host]?.end()
    delete connections[host]
}

export function closeAll() {
    for (const key in connections) {
        connections[key]?.end()
    }
}

process.on('exit', closeAll);
process.on('SIGINT', closeAll);
process.on('SIGUSR1', closeAll);
process.on('SIGUSR2', closeAll);
process.on('uncaughtException', closeAll);
