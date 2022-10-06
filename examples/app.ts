import { Zarf } from '@zarfjs/zarf'

const app = new Zarf()

app.get("/hello/:user", (ctx, params) => {
    return ctx.json({
        hello: params.user
    })
})

app.get("/hello/:user.:ext", (ctx, params) => {
    if(params.ext === 'txt') {
        return ctx.json({
            hello: params.user
        })
    } else {
        return ctx.text(`Hello, ${params}`)
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

app.listen({
    port: 3000
}, (server) => {
    console.log(`Server started on ${server.port}`)
})
