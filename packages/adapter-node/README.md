# @zarfjs/adapter-node

Node.js adapter for [Zarf](https://github.com/zarfjs/zarf). Provide a `Zarf` app, and let this adapter _adapt_ the incoming requests and outgoing responses into a format Node.js understands.

**Note:** It works, but it's yet to be fully tested for compatibility issues

## Usage
---
```ts
import { Zarf } from '@zarfjs/zarf'
import { createServer } from '@zarfjs/adapter-node'

const app = new Zarf()

app.get("/hello/:user", (ctx, params) => {
    return ctx.json({
        hello: params.user
    })
})

const server = createServer(app).listen({
    port: 3000
}, (server) => {
    console.log(`Server started on 3000`)
})
// Tell how your users can use the package with Zarf
```

## Author
---
Aftab Alam https://github.com/one-aalam

## License
---
Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
