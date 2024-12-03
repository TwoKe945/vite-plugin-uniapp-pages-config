import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from 'unplugin-auto-import/vite'
import { PagesConfig, PagesConfigResolver } from 'vite-plugin-uniapp-pages-config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(),
    AutoImport({
      imports: ['vue', 'uni-app'],
      resolvers: [PagesConfigResolver()]
    }),
    PagesConfig({
      dts: 'src/types/page-constants.d.ts'
    })
  ],
});
