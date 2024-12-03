# vite-plugin-uniapp-pages-config

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

## 介绍

- pages.json 分文件配置
- pages.json path 路由常量定义


## 快速使用

```shell
npm add -D vite-plugin-uniapp-pages-config
```

```shell
yarn add -D vite-plugin-uniapp-pages-config
```

```shell
pnpm add -D vite-plugin-uniapp-pages-config
```

### 分文件配置

**src/pages/demo02/page.json**
```json
{
  "index.vue": { // 自定当前目录下文件名，配置内容参考uniapp的pages.style的配置
    "navigationBarTitleText": "Demo02"
  }
}
```
**src/pages/index/page.json**
```json
{
  "index.vue": {
    "tabBar": true, // 标识这是一个tabbar, 这里会影响常量的生成，会给常量添加一个前缀TAR_BAR_
    "navigationBarTitleText": "首页"
  }
}
```
**生成的pages.json**

> 注意事项：pages.json 的注释必须删除，不然会读取失败

```json
{
  "pages": [ // 只会合并pages,下面的配置不会影响
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/demo02/index",
      "style": {
        "navigationBarTitleText": "Demo02"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },
  "tabBar": {
    "color": "#494949",
    "selectedColor": "#8f60df",
    "backgroundColor": "#fff",
    "height": "60px",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      }
    ]
  }
}
```

### 路由常量定义

**常量生成规则**
```shell
# 标识了index.vue是TabBar
src/pages/index/index.vue => PAGES.TAB_BAR_INDEX_INDEX = "/pages/index/index";
# 未标识index.vue是TabBar
src/pages/index/index.vue => PAGES.INDEX_IDNEX = "/pages/index/index";
src/pages/demo02/index.vue => PAGES.DEMO02_INDEX = "/pages/demo02/index";
src/pages/demo02/detail.vue => PAGES.DEMO02_DETAIL = "/pages/demo02/detail";
# 驼峰命名会转下划线
src/pages/demo02/detailForm.vue => PAGES.DEMO02_DETAIL_FORM = "/pages/demo02/detailForm";
```

**vite.config.ts**

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from 'unplugin-auto-import/vite'
import { PagesConfig, PagesConfigResolver } from 'vite-plugin-uniapp-pages-config'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [uni(),
        AutoImport({
            imports: ['vue', 'uni-app'],
            // 自动导入常量
            resolvers: [PagesConfigResolver()]
        }),
        PagesConfig({
            // 常量DTS输出位置
            dts: 'src/types/page-constants.d.ts'
        })
    ],
});
```

**src/pages/index/index.vue**

```vue
<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" />
    <view class="text-area" @click="handleToDemo02">
      <text class="title">{{ title }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// 没有使用 auto-import 可以自己导入
// import { PAGES } from 'virtual:page-constants'
const title = ref('to demo02')


function handleToDemo02() {
  console.log(PAGES.DEMO02_INDEX)
  uni.navigateTo({
    url: PAGES.DEMO02_INDEX
  })
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
```







## License
[MIT](./LICENSE) License © 2024-PRESENT [TwoKe](https://github.com/TwoKe945)


[npm-version-src]: https://img.shields.io/npm/v/vite-plugin-uniapp-pages-config?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/vite-plugin-uniapp-pages-config
[npm-downloads-src]: https://img.shields.io/npm/dm/vite-plugin-uniapp-pages-config?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/vite-plugin-uniapp-pages-config