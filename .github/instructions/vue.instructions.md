---
applyTo: "**/*.vue"
---

### Scripts

- Use VueUse when you can.

### Template

- Use display flex when you can.
- Set flex so that icon's width and height takes effect in buttons.

### Icons

You can use icons from almost any icon sets by the power of [Iconify](https://iconify.design/).

It will only bundle the icons you use. Check out [unplugin-icons](https://github.com/unplugin/unplugin-icons) for more details.

### Assets

Reference assets using `import asset_name from "~/assets/assets/asset_name.png";` and then set `:src="asset_name"`.

### Naming

- Name components in `common/` with prefix `INK` or `ink`
