import { Zarf } from '@zarfjs/zarf'
import { createStaticFetchAdapter } from '../src/static'

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
    const data = await request?.formData()
    // @ts-ignore
    let body = JSON.stringify([...data], null);
    // handling multipart/form-data with binary files like images by using response.formData() does not work in CloudFlare Workers. The response goes through a utf-8 transformation which corrupts the files and make them unreadable. In addition, you lose the filename information , which sometimes is important.
    return ctx.json({
        body
    })
})

app.get("/", (ctx) => {
    return ctx.html(`Welcome to Zarf App server`)
})


export default {
    fetch: createStaticFetchAdapter(app, {
        cors: true,
    })
};
