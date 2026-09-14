# 麒麟的个人网站（AstroPaper 主题）

基于 GitHub 上星标最高的 Astro 个人网站主题 [AstroPaper](https://github.com/satnaing/astro-paper)（5000+ star）搭建，托管在 GitHub Pages，**不需要买服务器**。

线上地址：https://sll521000.github.io
代码仓库：https://github.com/sll521000/sll521000.github.io

## 日常使用

| 想改什么 | 改哪里 |
|----------|--------|
| 网站名字、介绍、社交链接 | `astro-paper.config.ts` |
| 首页"我正在做什么"卡片 | `src/pages/index.astro` 顶部的 `projects` 数组 |
| 关于页 | `src/content/pages/about.md` |
| 写文章（读书笔记等） | 在 `src/content/posts/` 新建 `.md` 文件 |
| 界面文字（导航、按钮等） | `src/i18n/lang/zh.ts` |

本地预览：`npm run dev`（http://localhost:4321，保存自动刷新）

发布更新：`npm run push -- "这次改了什么"`，1 分钟左右自动上线。
（电脑不装 git 也能用：脚本走 GitHub API + 你已登录的 gh CLI。）

## 写一篇文章的格式

在 `src/content/posts/` 新建 `my-post.md`：

```markdown
---
title: 文章标题
description: 一句话摘要
pubDatetime: 2026-09-13T20:00:00+08:00
featured: false
tags:
  - 读书
---

正文用 Markdown 写。
```

## 注意

- 主题构建时需要从 Google Fonts 下载字体（仅影响构建机器，国内本地构建会自动降级为系统字体，不影响线上）。
- 仓库是 `用户名.github.io` 形式的**用户站点**，直接挂在根地址，无子路径。
- 部署状态：https://github.com/sll521000/sll521000.github.io/actions
