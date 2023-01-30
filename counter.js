const nblib = require('nblib2')
const config = require('./config.js')
const DBDomain = "counterboy.pv"
const LogsTable = "logs"
class Counter {
    static async init() {
        await nblib.init({
            nbNode: config.nbpnode,
            debug: true,
            enable_write: true,
        })
        this.nbdomain = await nblib.getDomain(DBDomain)
        if (!this.nbdomain) {
            const res = await nblib.registerDomain(DBDomain, { privateKey: process.env.pvkey })
            this.nbdomain = await nblib.getDomain(DBDomain)
        }
        await this.nbdomain.setPrivateKey(process.env.pvkey)
        await this.setupTable(false)
    }
    static async setupTable(forceUpdate = false) {
        const logsMapping = { p1: 'name', p2: 'ip' }
        let res = await nblib.readDomain("_def." + LogsTable + '.' + DBDomain)
        if (res.code != 0 || forceUpdate) {
            res = await this.nbdomain.delChild({ parent: LogsTable + '.' + DBDomain })
            const kv = [{ k: '_def.' + LogsTable, v: logsMapping }]
            res = await this.nbdomain.updateKey({ kv })
        }
        return true
    }
    static async log({ uid, name, ip }) {
        const kv = { k: uid + '.' + LogsTable, v: "", props: { name, ip } }
        const res = await this.nbdomain.updateKey({ kv })
        return res
    }
    static async count(name) {
        const res = await nblib.mangoQuery({ count: { name, parent: LogsTable + "." + DBDomain } })
        return res
    }
}
module.exports = Counter