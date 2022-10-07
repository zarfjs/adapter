# @zarfjs/adapter-bun

Bun adapter for [Zarf](https://github.com/zarfjs/zarf). Provide a `Zarf` app, and let this adapter _adapt_ the incoming requests and outgoing responses into a format Bun understands. This is like `Zarf`'s `listen` method, but outside and consistent with the rest of the adapter ecosystem. Eventually, with `Zarf` going slim, and runtime agnostice, you'll have only this!

**Note:** Experimental, as Bun's cutting edge and you'll need either containers/Docker or something like [fly.io](https://fly.io/) to work with Bun.sh today

## Usage
---
```ts
import { Zarf } from '@zarfjs/zarf'
import { createServer } from '@zarfjs/adapter-bun'

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
