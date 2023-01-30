const express = require('express')
const cors = require('cors')
require('dotenv').config()
const config = require('./config.js')
const Counter = require('./counter')
const app = express()
app.use(cors());
Counter.init()
const listener = app.listen(config.port, async function () {
    console.log(`counterboy started on port ${config.port}...`);
})
function getClientIp(req) {
    let IP =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    IP = IP.split(',')[0]
    IP = IP.split(":").pop()
    return IP;
}
app.get('/log/:name', async (req, res) => {
    const name = req.params['name']
    if (config.enabled_counters.indexOf(name) === -1) {
        res.json({ code: 1, msg: "counter is not enabled: " + name })
        return
    }
    const uid = Date.now().toString(31)
    const ip = getClientIp(req)
    let ret = await Counter.log({ name, uid, ip })
    if (ret.code === 0) {
        ret = { code: 0, uid, ts: ret.ts }
    }
    res.json(ret)
})
app.get('/count/:name', async (req, res) => {
    const name = req.params['name']
    res.json(await Counter.count(name))
})
app.get('/test', async (req, res) => {
    const uid = Date.now().toString(31)
    const { name, ip } = req.query
    //res.json(await Counter.log({ uid, name, ip }))
    res.json(await Counter.count(name))
})