import {execSync, spawnSync} from "child_process";
import * as path from "path"
import {copyFileSync, existsSync, readFileSync, rmSync, mkdirSync} from "fs"
import {ChalkInstance} from "chalk";

type ReactTvConfig = {
    files: string[]
}

const deviceFlagIndex = process.argv.indexOf("--device")
let deviceArg: string
if (deviceFlagIndex == -1 || process.argv.length <= deviceFlagIndex + 1) {
    throw Error("Missing device argument")
} else {
    deviceArg = process.argv[deviceFlagIndex + 1]
}

const isEmulator = deviceArg === "emulator"
const clean = !isEmulator

if (clean) {
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGUSR1', cleanup);
    process.on('SIGUSR2', cleanup);
    process.on('uncaughtException', cleanup);
}

const appPath = path.resolve("app")
const servicePath = path.resolve("service")
const appReactTvPath = path.resolve(appPath, "react-tv")
const appWebOSPath = path.resolve(appReactTvPath, "webos")

const packageJsonContent = JSON.parse(readFileSync(path.resolve(appPath, "package.json"), {encoding: "utf-8"}))
const reactTvConfig: ReactTvConfig = packageJsonContent["react-tv"]

function cleanup(error?: any) {
    const toDelete = [
        path.resolve(appPath, "bundle.js"),
        path.resolve(appWebOSPath, "icon.png"),
        path.resolve(appWebOSPath, "icon-large.png")
    ].concat(reactTvConfig.files.map(file => path.resolve(appWebOSPath, file)))

    toDelete.forEach(file => {
        if (existsSync(file)) rmSync(file)
    })

    if (error) throw error
}

async function resolveChalk(): Promise<ChalkInstance> {
    const chalk = await import("chalk")
    return new chalk.Chalk()
}

cleanup()

const chalk = await resolveChalk()

console.log(chalk.dim("Building app..."))
execSync("npm run build", {cwd: appPath})
console.log(chalk.blue(" successfully built app"))

console.log(chalk.dim("Building service..."))
execSync("npm run build", {cwd: servicePath})
console.log(chalk.blue(" successfully built service"))

reactTvConfig.files.forEach((file) => {
    const filePath = path.resolve(appWebOSPath, file)
    const dirname = path.dirname(filePath)

    if (!existsSync(dirname)) {
        mkdirSync(dirname, {recursive: true})
    }
    copyFileSync(path.resolve(appPath, file), filePath)
})
copyFileSync(path.resolve(appReactTvPath, "icon.png"), path.resolve(appWebOSPath, "icon.png"))
copyFileSync(path.resolve(appReactTvPath, "icon-large.png"), path.resolve(appWebOSPath, "icon-large.png"))

if (isEmulator) {

} else {
    console.log(chalk.dim("Packaging..."))
    execSync(`ares-package ${appWebOSPath} service`)

    if (clean) cleanup()

    console.log(chalk.dim('Installing...'));
    const config = JSON.parse(readFileSync(path.resolve(appWebOSPath, "appinfo.json"), {encoding: "utf-8"}))

    const latestIPK = `${config.id}_${config.version}_all.ipk`;
    console.log(chalk.blue(` installing ${latestIPK} as IPK`));
    execSync(`ares-install --device ${deviceArg} ${latestIPK}`)

    console.log(chalk.dim('Launching...'));
    execSync(`ares-launch --device ${deviceArg} ${config.id}`);
    console.log(chalk.yellow(` launched`));

    console.log(chalk.dim('Inspecting...'));
    spawnSync(
        "ares-inspect",
        [`-a ${config.id} --device ${deviceArg}`],
        {
            stdio: "inherit",
            shell: true,
            encoding: "utf-8"
        }
    )
}