# @zarfjs/adapter-deno

Deno adapter for [Zarf](https://github.com/zarfjs/zarf). Provide a `Zarf` app, and let this adapter _adapt_ the incoming requests and outgoing responses into a format Deno understands.

**Note:** This adapter currently doesn't do much besides providing a wrapper around the Deno server methods. You doesn't always need this, and will be pretty good(or better) with default Deno's `serve` methods.

## Usage
---
```ts
import { Zarf } from "https://deno.land/x/zarf@v0.0.1-alpha.20/index.ts"
import { createServer } from '../src/index.ts'

const app = new Zarf()

app.get("/hello/:user", (ctx, params) => {
    return ctx.json({
        hello: params.user
    })
})

createServer(app).listen({
    port: 3000
}, (server) => {
    console.log(`Server started on ${server.port}`)
})
```

## Author
---
Aftab Alam https://github.com/one-aalam

## License
---
Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
