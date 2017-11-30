import orderTest from "order1.test.json"
import { transform } from "./transform"
import fs from "fs"

// Test config
const TEST_CASE = "Transform hoipos order"
let pass = true

const hoiposOrder = transform(orderTest)
// pass = pass &&
fs.writeFileSync(`${__dirname}/../tmp/hoiposOrder.json`, JSON.stringify(hoiposOrder))
