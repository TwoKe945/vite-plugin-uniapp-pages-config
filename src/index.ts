import type { Plugin } from 'vite'
import { resolve, basename, dirname, join, extname } from 'path'
import {readFileSync, existsSync, mkdirSync} from 'fs'
import { writeFile } from 'fs/promises'
import { mkdirpSync } from 'fs-extra'
import { sync } from 'fast-glob'
import { render } from 'ejs'

import { PagesConfigOptions } from './types'
import { Context, PAGE_CONSTANTS_MODULE_NAME, CONSTANT_NAME } from './context'
import { declarationTemplate, constantTemplate } from './template'

function createVirtualModuleID(name: string) {
    const virtualModuleId = `virtual:${name}`;
    const resolvedVirtualModuleId = "\0" + virtualModuleId;
    return {
        virtualModuleId,
        resolvedVirtualModuleId
    };
}

const {  virtualModuleId, resolvedVirtualModuleId } = createVirtualModuleID(PAGE_CONSTANTS_MODULE_NAME)

/**
 * 获取页面
 * @param pageBaseName
 */
function getPageNameKey(pageBaseName: string): string {
    return pageBaseName.replace(/\\/g, '_').toUpperCase();
}

function withTabBar(pageBaseName: string) {
    return `TAB_BAR_${pageBaseName}`
}

function camelToSnake(camelStr: string) {
    return camelStr.replace(/([A-Z])/g, (_match, p1) => `_${p1.toLowerCase()}`).replace(/^_/, '');
}

function generatePagesParams(envDir: string, pagesDir?: string) {
    const cwdDir = pagesDir || resolve(envDir, 'src', 'pages');
    const pagesDirName = basename(cwdDir);

    const pagesConfig = sync([ `**/page.json`], { cwd: cwdDir }).map(path => ({
        originPath: path,
        path: `${cwdDir}/${path}`
    }))
    const originPagesConfigPath = resolve(envDir, 'src', 'pages.json');
    const originPagesConfig = JSON.parse(readFileSync(originPagesConfigPath, 'utf8'));
    const pagesMap = (originPagesConfig['pages'] || []).reduce((acc: any, cur: any) => {
        acc[cur.path] = cur
        return acc
    }, {})
    const constants = {}
    for (let pageConfigPath of pagesConfig) {
        const config = JSON.parse(readFileSync(pageConfigPath.path, 'utf8'))
        Object.keys(config).forEach(key => {
            const pagePath = resolve(dirname(pageConfigPath.path), key)
            if (!existsSync(pagePath)) {
                throw new Error(`Page "${pagePath}" not found.`)
            }
            const pageBaseName = key.replace(extname(key), "");
            const path = join(pagesDirName, dirname(pageConfigPath.originPath), pageBaseName).replace(/\\/g, "/")
            let uniqueKey = getPageNameKey(join(dirname(pageConfigPath.originPath), camelToSnake(pageBaseName)));
            if (config[key].tabBar) {
                // 处理tabBar
                uniqueKey = withTabBar(uniqueKey)
               delete config[key].tabBar
            }
            const page = {
                path,
                style: config[key]
            } as any

            (constants as any)[uniqueKey] = page
            if (!pagesMap[page.path] || JSON.stringify(pagesMap[page.path]).trim() != JSON.stringify(page).trim()) {
                pagesMap[page.path] = page
            }
        })
    }
    const pages = []
    for (let key in pagesMap) {
        pages.push(pagesMap[key])
    }
    originPagesConfig['pages'] = pages
    return {
        pages: originPagesConfig,
        constants
    }
}


function createPagesConstants(constantName:string, constants: Record<string, {
    path: string,
    style: {  navigationBarTitleText: string  },
}>) {
    return render(constantTemplate, {
        constants,
        constantName
    }, { async: false })

}

async function writeDeclaration(envDir: string, constantPathName: string, constantName:string, constants: Record<string, {
    path: string,
    style: {  navigationBarTitleText: string  },
}>) {
    const declaration = render(declarationTemplate, {
        constants,
        constantName,
        virtualModuleName: virtualModuleId
    }, { async: false })
    const dtsDir = resolve(envDir, dirname(constantPathName));
    if (!existsSync(dtsDir)) {
        mkdirpSync(dtsDir)
    }
    await writeFile(resolve(dtsDir, basename(constantPathName)), declaration, 'utf-8');
}

export function PagesConfig(options?: PagesConfigOptions) {
    const ctx = new Context(options);
    return {
        name: 'vite-plugin-uniapp-pages-config',
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },
        load(id) {
            if (id === resolvedVirtualModuleId) {
                return ctx.constant;
            }
        },
        async configResolved(config) {
            const envDir = config.envDir;
            // 生成pages.json文件
            const { pages, constants } = generatePagesParams(envDir, ctx.pagesDir);
            // 生成pages.json
            const outputFilePath = resolve(envDir, 'src', 'pages.json');
            await writeFile(outputFilePath, JSON.stringify(pages, null, 2), 'utf-8');
            // 生成常量
            if (ctx.dts) {
                ctx.constant = createPagesConstants(ctx.constantName , constants)
                await writeDeclaration(envDir, ctx.dtsName, ctx.constantName , constants)
            }
        },
    } as Plugin
}

export function PagesConfigResolver() {
    return (name: string) => {
        if (name === CONSTANT_NAME) {
            return {
                name: name,
                from: virtualModuleId,
            };
        }
    }
}

