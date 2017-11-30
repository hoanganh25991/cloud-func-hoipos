import fs from "fs"
import cpr from "child_process"
const _ = console.log
const {dependencies} = require(`${__dirname}/../package.json`)
const defaultPkg = require(`${__dirname}/defaultPkg.json`)

_("[INFO] Create pkg")
const pkg = {...defaultPkg, dependencies}
const pkgPath = `${__dirname}/../functions/package.json`
fs.writeFileSync(pkgPath, JSON.stringify(pkg))

_("[INFO] Copy config")
const configLog = cpr.execSync(`cp ${__dirname}/../src/config.json ${__dirname}/../functions`)
_(configLog.toString())

_("[INFO] Build")
const buildLog = cpr.execSync(`yarn build`)
_(buildLog.toString())

// _("[INFO] Deploy")
// const cmd = [  `cd functions`,  `yarn install`,  `yarn deploy`]
// const deployLog = cpr.execSync(cmd.join("&&"))
// _(deployLog.toString())
