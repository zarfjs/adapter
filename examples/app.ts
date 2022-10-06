import { Zarf } from '@zarfjs/zarf'

interface AppLocals {
    user: string
}

const app = new Zarf<AppLocals>()

app.get("/hello", (ctx) => {
    return ctx.json({
        hello: "hello"
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
