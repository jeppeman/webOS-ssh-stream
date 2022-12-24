const os = require("os")
const cp = require("child_process")
const ip = require("ip")

export function findDevicesOnNetwork({address = '', skipNameResolution = false, arpPath = 'arp'} = {}) {
    const servers = getServers()

    return new Promise((resolve) => {
        const result = []
        let processed = 0
        servers.forEach(s => {
            cp.exec(`nslookup ${s}`, (error, stdout, stderr) => {
                if (!error) {
                    const lines = stdout.toString("utf-8")
                        .split("\n")
                        .filter(line => line.trim().length)
                    const columns = lines[lines.length - 1].split(" ")
                    const hostname = columns[columns.length - 1]
                    if (hostname.indexOf("192.168") === -1) {
                        result.push(hostname)
                    }
                }
                if (processed >= servers.length - 1) {
                    resolve(result)
                }
                processed++
            })
        })
    })
}

function getServers() {
    const interfaces = os.networkInterfaces()
    const result = []

    for (const key in interfaces) {
        const addresses = interfaces[key]
        for (let i = addresses.length; i--;) {
            const address = addresses[i]
            if (address.family === 'IPv4' && !address.internal) {
                const subnet = ip.subnet(address.address, address.netmask)
                let current = ip.toLong(subnet.firstAddress)
                const last = ip.toLong(subnet.lastAddress) - 1
                while (current++ < last) result.push(ip.fromLong(current))
            }
        }
    }
    return result
}
