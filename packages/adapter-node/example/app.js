import { Zarf } from '@zarfjs/zarf'
import { createServer } from '../dist/index.cjs'

const app = new Zarf()

app.get("/hello/:user", (ctx, params) => {
    return ctx.json({
        hello: params.user
    })
})

app.get("/hello/:user.:ext", (ctx, params) => {
    if(params.ext === 'txt') {
        return ctx.text(`Hello, ${params.user}`)
    } else if(params.ext === 'json') {
        return ctx.json({
            hello: params.user
        })
    } else {
        return ctx.text(`Unsupported extension: ${params.ext}`)
    }
})

app.post("/hello", async(ctx) => {
    const { request } = ctx
    const body = await request?.json()
    // do something with the body
    return ctx.json({
        body
    })
})

app.get("/", (ctx) => {
    return ctx.html(`Welcome to Zarf App server`)
})

const server = createServer(app).listen({
    port: 3000
}, (server) => {
    console.log(`Server started on 3000`)
})
