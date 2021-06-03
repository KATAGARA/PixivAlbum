<h1 align="center">
  Pixiv Album
  <br>
  <br>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/license-GPL%203.0-brightgreen.svg" alt="GPL 3.0 LICENSE"></a>
  <a href="https://github.com/KAKETAKAGE/PixivAlbum/releases"><img src="https://img.shields.io/badge/release-v0.0.1-blue.svg" alt="Pixiv Collect Releases"></a>
</h1>

- [注意](#注意)
- [介绍](#介绍)
- [后续计划](#后续计划)
- [您可能会遇到包括但不限于以下问题](#您可能会遇到包括但不限于以下问题)
  - [已知BUG](#已知BUG)
- [支持和捐助](#支持和捐助)
  <br><br>

# 注意
_本项目不提供任何翻墙工具和方法_

**本项目目前最新版本为测试版~~的测试版~~**<br>
**[PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 与 [PixivAlbum](https://github.com/KAKETAKAGE/PixivAlbum) 项目开发周期已有快两个月了，因个人原因非重大BUG下次更新应该在明年初了。**<br>
**因中途被搁置了半年多（懒），！！！请忽然源代码中的注释 ！！！**

本项目图片收集功能由 [PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 项目提供支持。请把打包后的文件放在项目根目录下的collect文件夹中<br>
需要安装数据库：[MongoDB](https://www.mongodb.com/try/download/community) [教程](/.github/docs/MongoDB.md)。<br>
请在 [PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 项目打包后的执行目录下放置保存了 [Pixiv](https://www.pixiv.net/) 登入后cookie的cookie.txt文件 [教程](/.github/docs/Cookie.md)。

**cookie 错误或 MongoDB 错误未测试，程序中也未作出应对。**

# 介绍
这是一个 Pixiv 离线化的项目。

[Bilibili 演示视频]()

1. 浏览除小说外的所有排行榜
2. 收藏作品关注画师
3. 浏览插画，动图
4. 调用 [PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 收集图片并实时显示收集进度
   <br>
   
声明：本项目主界面设计模仿了 [pixivic-pc](https://github.com/cheer-fun/pixivic-pc) ，代码未抄袭，如有不妥之处请告知。

![主界面](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/home.png)
![作品界面](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/illust.png)
![收集界面](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/collect.png)
![设置界面](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/setting.png)

# 后续计划
~~（明年计划）~~ <br>
如有功能请求或现有功能建议，可以在 [Issues](https://github.com/KAKETAKAGE/PixivAlbum/issues) 中提出，新建 issues 时在在右边选择相应 Label。
- [ ] 异常
- [ ] 日志
- [ ] 项目结构
- [ ] 消息传递
- [ ] 瀑布流逻辑优化
- [ ] 点击图片全屏显示
- [ ] 作者作品时间线
- [ ] 主进程返回数据统一
- [ ] 与 PixivCollect 项目 List 模块对应的参数选择
- [ ] 设置界面美化
- [ ] 搜索功能完善
- [ ] 关注和收藏界面特殊化  <br><br>

以下功能看反响吧
- [ ] 体积
- [ ] 非key更换
- [ ] 本地无图片时网络加载
- [ ] 更多的动画
- [ ] 语言包
- [ ] 跨平台
- [ ] 模块化安装，拓展功能

# 您可能会遇到包括但不限于以下问题

* ~~开发者跑路~~
* 代码丑，代码结构混乱
* 莫名其妙（~~可能开发者都不知道~~）的错误
* 功能不完善
* 程序无法运行
* 浏览R18图然后社死

## 已知BUG
以下BUG会在0.1.0版本完成Debug。
* PixivCollect 程序不存在时报错
* 所有图片都失效时，无法加载下一页
* 滑倒底部之后，之后页的图片一直失效，会一直加载
* 程序推出后 PixivCollect 未关闭
* 图片分析和数据库信息功能关闭后还会接收到主进程结果
* 预设操作弹出多个消息
* cookie 和 MongoDB 错误

# 支持和捐助
如果您感觉本项目帮到了您，您可以对我进行支持和捐助，不胜感激 (>▽<)

![收款码](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/QR_code.jpg)
