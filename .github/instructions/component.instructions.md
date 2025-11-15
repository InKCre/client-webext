---
applyTo: "components/**/*"
---

If a component is complex, broken it into `<compName>.scss`, `<compName>.ts`, `<compName>.vue` and add document `<compName>.md` in `<compName>` folder.
And to make import easy, add `<compName>/index.ts` which has:

```ts
import compName from "./compName.vue";
export default compName;
```
