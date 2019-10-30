/*
 * @Descripttion: 
 * @version: 
 * @Author: lhy
 * @Date: 2019-10-30 15:19:49
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2019-10-30 16:08:28
 */
import { File } from 'gulp-util';
import { basename, relative, resolve } from 'path';
const Transform = require('readable-stream').Transform;
/** 解析所有文件的moduleID, 生成config后插到入口文件的头部 */
export function addRequireConfig (option: OptionType) {
    const mainJs = option.mainJs || 'main.js';
    const pathConfig: object = {};
    let mainFile;
    return new Transform({
        objectMode: true,
        transform: (file: File, enc, callback) => {
            const fileName = basename(file.path);
            if (fileName !== mainJs) {
                const relativePath = relative(option.sourceDir, file.path);
                const touchModuleId = file.contents.toString().match(/define\(["']([0-9a-zA-Z@_\-/]+)["']/g);
                const bundlePath = option.deloyDir + relativePath.replace(/.js$/, '');
                touchModuleId.map((item) => {
                    const moduleId = item.replace(/^define\("/, '').replace(/"$/, '');
                    pathConfig[moduleId] = bundlePath;
                });
            } else {
                mainFile = file;
            }
            callback(null, file);
        },
        // 将pathConfig对象中的moduleId打印成config文件，塞入主文件main.js
        flush (callback) {
            const finalConfig = 'require.config({paths:' + JSON.stringify(pathConfig) + '});\n';
            mainFile.contents = Buffer.from(finalConfig + mainFile.contents.toString());
            this.push(mainFile);
            callback();
        }
    });
}
