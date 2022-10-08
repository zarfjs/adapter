# @zarfjs/adapter-cf-worker

Cloudflare worker adapter for [Zarf](https://github.com/zarfjs/zarf). Provide a `Zarf` app, and let this adapter _adapt_ the incoming requests and outgoing responses into a format Cloudflare understands.


## Usage
---
**Basic**

```ts
import { Zarf } from '@zarfjs/zarf'
import { createFetchAdapter } from '@zarfjs/adapter-cf-worker'

const app = new Zarf()

app.get("/hello/:user", (ctx, params) => {
    return ctx.json({
        user: params.user
    })
})

export default {
    fetch: createFetchAdapter(app)
};

```
**Static**

```ts
import { Zarf } from '@zarfjs/zarf'
import { createStaticFetchAdapter } from '@zarfjs/adapter-cf-worker/static'

const app = new Zarf()

app.get("/hello/:user", (ctx, params) => {
    return ctx.json({
        user: params.user
    })
})

export default {
    fetch: createStaticFetchAdapter(app, {
        cors: true, // wanna enable CORS for all assets to all?
    })
};
```
For detailed example refer [example](./example/app.ts)

## Author
---
Aftab Alam https://github.com/one-aalam

## License
---
Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
