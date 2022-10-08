# @zarfjs/adapter-deno

Deno adapter for [Zarf](https://github.com/zarfjs/zarf). Provide a `Zarf` app, and let this adapter _adapt_ the incoming requests and outgoing responses into a format Deno understands.

**Note:** This adapter currently doesn't do much besides providing a wrapper around the Deno server methods. You doesn't always need this, and will be pretty good(or better) with default Deno's `serve` methods.

## Usage
---

**Server Listener**
```ts
import { Zarf } from "https://deno.land/x/zarf@v0.0.1-alpha.20/index.ts"
import { createServer } from 'https://deno.land/x/zarfjs_adapter@v1.0.2/index.ts'

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

### Run Examples
```
deno run --unstable --reload --allow-read --allow-env --allow-net --watch example/app-deploy.ts
```
```
deno run --unstable --reload --allow-read --allow-env --allow-net --watch example/app.ts
```
**Deploy**
```
deployctl deploy --project=zarf example/app-deploy.ts --token=xxxxx
```

## Author
---
Aftab Alam https://github.com/one-aalam

## License
---
Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
