<h1 align="center">
  Pixiv Album
  <br>
  <br>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/license-GPL%203.0-brightgreen.svg" alt="GPL 3.0 LICENSE"></a>
  <a href="https://github.com/KAKETAKAGE/PixivAlbum/releases"><img src="https://img.shields.io/badge/release-v0.0.1-blue.svg" alt="Pixiv Collect Releases"></a>
</h1>

- [注意](#注意)
- [介绍](#介绍)
- [如何使用](#如何使用)
  - [进入设置界面](#进入设置界面)
  - [进入收集界面](#进入收集界面)
  - [进入浏览界面](#进入浏览界面)
  - [关于搜索](#关于搜索)
  <br><br>

# 注意

软件在 [Releases](https://github.com/KAKETAKAGE/PixivAlbum/releases) 中下载 <br>
本项目图片收集功能由 [PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 项目提供支持。请把打包后的文件放在项目根目录下的collect文件夹中<br>
需要安装数据库：[MongoDB](https://www.mongodb.com/try/download/community) [教程](/.github/docs/MongoDB.md)<br>
请在 [PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 项目打包后的执行目录下放置保存了 [Pixiv](https://www.pixiv.net/) 登入后cookie的cookie.txt文件 [教程](/.github/docs/Cookie.md)<br>

如果打开软件报错，请尝试右键管理员运行，可能是因为没有权限修改软件目录下的配置文件<br>
**软件问题请在 Issues 中提出** <br>
**cookie 错误或 MongoDB 错误未测试，程序中也未作出应对**

# 介绍
这是一个 Pixiv 离线化的项目

[YouTube 演示视频](https://www.youtube.com/watch?v=mYO8d-TbU9c)

1. 浏览除小说外的所有排行榜
2. 收藏作品关注画师
3. 浏览插画，动图
4. 调用 [PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 收集图片并实时显示收集进度
   <br>
   
声明：本项目主界面设计模仿了 [pixivic-pc](https://github.com/cheer-fun/pixivic-pc) ，代码未抄袭，如有不妥之处请告知

![主界面](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/home.png)
![作品界面](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/illust.png)
![收集界面](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/collect.png)
![设置界面](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/setting.png)

# 如何使用

这是一个暂时地使用教程，后续补充。软件在 [Releases](https://github.com/KAKETAKAGE/PixivAlbum/releases) 中下载<br>
_看此教程前请先阅读 [注意](#注意)_ <br>

软件侧边栏从上到下依次是浏览界面、收集界面、设置界面 <br>
首次打开软件是没有图片的，需要在收集界面添加下载任务

### 进入设置界面

配置介绍，有需求的话自行修改

* 开关功能：收集界面左边的两个功能的开关。现在用来占位置，`数据库信息` 功能以后会删了
* 数据库名：`默认：Pixiv` 更换数据库名，不会把源数据库数据移动到新数据库中
* 图片保存路径：`默认：剩余空间最大的分区:\Pixiv` 收集的图片保存在这
* 图片读取路径：`图片保存路径` 必须是图片读取路径，可以额外添加
* 图片移动：[PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 里有介绍
* Python执行文件：[PixivCollect](https://github.com/KAKETAKAGE/PixivCollect) 项目打包后文件路径
* 数据库端口号：`默认：27017` 要在配置文件中修改

### 进入收集界面

图片收集的参数选择，需要熟悉 [Pixiv-Rank](https://www.pixiv.net/ranking.php) 界面的排行榜选择

因为是自用软件，我当时开发没有考虑到用户看不懂，这里翻译一下

| 英文       | 中文    |     | 英文     | 中文    |
|----------|-------|-----|--------|-------|
| overall  | 综合    |     | illust | 插画    |
| ugoira   | 动图    |     | manga  | 漫画    |
| daily    | 今日    |     | weekly | 本周    |
| monthly  | 本月    |     | rookie | 新人    |
| original | 原创    |     | male   | 受男生欢迎 |
| female   | 受女生欢迎 |     |        |       |

`等待排行`：因为 Pixiv 排行榜更新时间每天都在推迟，并且不是同时全部更新。因此如果你抓着 Pixiv 更新时间收集图片请开启此选项

`图片排除`： overall 排行榜包括插画、漫画、动图。如果你不想下载漫画，就在图片排除界面把对应排行榜最右边的红色按钮选中。i图标有介绍

`预设`：把当前 `模式选择` 和 `图片排除` 保存，预设旁的输入框可以修改预设名。日期不保存

```
1. 保存信息并下载 综合今日R18插画
2. 保存信息并下载 综合本周全年龄和R18G插画
3. 保存信息并下载 全部插画排行榜
4. 漫画排行榜只保存信息
选择后如下图，之后点击右上角的加号，添加任务
```
![参数选择](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/task_add_1.png)
![排除模式](https://raw.githubusercontent.com/KAKETAKAGE/PixivAlbum/master/.github/imgs/task_add_2.png)

### 进入浏览界面

右下角的 📅 图标，选择你刚刚添加的图片收集任务的参数 <br>
软件默认打开的是 `全年龄插画日榜` ，暂时没有提供自定义功能

### 关于搜索

**搜索功能现在很不完善** <br>

直接输入 `作品ID` 可以通过搜索建议直接进入作品界面，画师同理 <br>
不使用搜索建议时可以直接按回车搜索，选择了搜索建议必须用 `Ctrl+S` 进行搜索 <br> 
现在只能搜索插画日榜的数据，并且模糊搜索在数据量较大时比较慢。<br>
插画和动图暂时没有区别。
