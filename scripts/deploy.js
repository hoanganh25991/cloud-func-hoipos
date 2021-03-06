import fs from "fs"
import cpr from "child_process"

// import config
import config from "../src/config.json"
import { dependencies } from "../package.json"
import defaultPkg from "defaultPkg.json"

const _ = console.log
const args = process.argv.slice(2)

const run = ({ config, defaultPkg, dependencies, args }) => {
  _(`[INFO] Usage: yarn deploy [projectName]`)

  const projectName = args[0] || "hoidev"
  const projectId = Object.keys(config).filter(key => {
    const project = config[key]
    if (typeof project !== "object") return false
    return project.name === projectName
  })[0]

  _(`[INFO] Project name: ${projectName}`)
  _(`[INFO] Project Id: ${projectId}`)
  if (!projectId) return

  _(`[INFO] Make functions dir`)
  const funcDir = `${__dirname}/../functions`
  const funcDirExist = fs.existsSync(funcDir)
  if (!funcDirExist) fs.mkdirSync(funcDir)

  _("[INFO] Copy config")
  cpr.execSync(`cp ${__dirname}/../src/config.json ${funcDir}`)

  _("[INFO] Create pkg")
  const pkg = { ...defaultPkg, dependencies }
  const pkgPath = `${__dirname}/../functions/package.json`
  fs.writeFileSync(pkgPath, JSON.stringify(pkg))

  _("[INFO] Build")
  const buildLog = cpr.execSync(`yarn build`)
  _(buildLog.toString())

  _("[INFO] ChDir & Deploy")
  const cmd = [`cd ${funcDir}`, `yarn install`, `firebase use ${projectId} && firebase deploy --only functions`]
  const deployLog = cpr.execSync(cmd.join("&&"))
  _(deployLog.toString())
}

try {
  run({ config, defaultPkg, dependencies, args })
} catch (err) {
  _("[run ERR]", err)
}
