import { PagesConfigOptions } from './types'
import { cwd } from 'process'
import {resolve} from "path";


export const CONSTANT_NAME = "PAGES";
export const PAGE_CONSTANTS_MODULE_NAME = 'page-constants';
export const PAGE_CONSTANTS_DTS_NAME = PAGE_CONSTANTS_MODULE_NAME + '.d.ts';

function withDefaults(options: PagesConfigOptions, defaultValue: PagesConfigOptions): PagesConfigOptions {
    if (Object.keys(options).length === 0) return Object.assign({}, defaultValue);
    return Object.assign(defaultValue, options);
}

export class Context {

    private _constantVirtualCode?:string;
    private _cwd:string

    constructor(private options?: PagesConfigOptions) {
        this._cwd = cwd();
        this.options = withDefaults(options || {}, {
            dts: false,
            pagesDir:  resolve(this._cwd, "src", "pages")
        })
    }
    get cwd() {
        return this._cwd
    }

    get constantName() {
        return CONSTANT_NAME
    }

    get pagesDir() {
        return this.options!.pagesDir!
    }

    get dtsName() {
        return (this.options!.dts == true ? PAGE_CONSTANTS_DTS_NAME : this.options!.dts) as string
    }

    get dts() {
        return !!this.options!.dts
    }

    set constant(code: string) {
        this._constantVirtualCode = code;
    }

    get constant() {
        return this._constantVirtualCode!;
    }

}