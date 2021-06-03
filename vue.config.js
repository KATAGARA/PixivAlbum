const path = require('path');

function resolve (dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    publicPath: './',
    devServer: {
        // can be overwritten by process.env.HOST
        host: '0.0.0.0',
        port: 7012
    },

    // css,html中 @import "~common/stylus/font.styl"
    // js中 @/common/js/xxx.js 等价于 src/common/js/xxx.js
    chainWebpack: config => {
        config.resolve.alias
            .set('@', resolve('src'))
            .set('src', resolve('src'))
            .set('assets', resolve('src/assets'))
            .set('common', resolve('src/common'))
            .set('components', resolve('src/components'));
    },

    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                "appId": "com.album.pixiv",
                "productName":"PixivAlbum",
                "win": {
                    "icon":"./pixiv_p.ico",
                    "target": [
                        {
                            "target": "nsis",
                            "arch": ["ia32", "x64"]
                        }
                    ]
                },
                "nsis": {
                    "oneClick": false,
                    "allowToChangeInstallationDirectory": true,
                    "installerIcon": "./pixiv_p.ico",
                    "uninstallerIcon": "./pixiv_p.ico",
                    "installerHeaderIcon": "./pixiv_p.ico",
                    "createDesktopShortcut": true,
                    "createStartMenuShortcut": true,
                    "shortcutName": "PixivAlbum",
                },
                "extraFiles": [
                    "config",
                    "collect",
                ]
            }
        }
    }
};
