import { serve } from "https://deno.land/std@0.158.0/http/server.ts"
import { Zarf } from "https://deno.land/x/zarf@v0.0.1-alpha.20/index.ts"
import { createAdapter } from "../src/static.ts"

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
    return ctx.html(`Welcome to Zarf Deno App server`)
})

// @ts-ignore: due to incompatibility of response types - Promise<Response | undefined> -> Promise<Response>
await serve(createAdapter(app, {
    forwardOnError: true
}));
