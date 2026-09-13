# 个人网站（Astro + GitHub Pages）

用 [Astro](https://astro.build/) 从零搭建的个人网站，托管在 GitHub Pages，**不需要买服务器**。

线上地址：https://sll521000.github.io/personal-website/
代码仓库：https://github.com/sll521000/personal-website

## 日常使用（三步）

1. 打开 `src/pages/index.astro`，把文件顶部 `site` 对象里带【替换】标注的内容改成你自己的（名字、介绍、作品、邮箱等）。
2. 本地预览（可选）：`npm run dev`，浏览器打开 http://localhost:4321
3. 发布更新：`npm run push -- "这次改了什么"`，等 1 分钟左右网站自动更新。

> `npm run push` 电脑上不装 git 也能用（内部用 isomorphic-git + 你已登录的 gh CLI 令牌），提交并推送到 GitHub 后，GitHub Actions 会自动构建发布。

## 常用命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | 本地开发预览（localhost:4321，保存自动刷新） |
| `npm run build` | 构建到 `dist/` 目录 |
| `npm run preview` | 本地预览构建结果 |
| `npm run push -- "说明"` | 提交并推送，触发线上自动部署 |

## 文件结构

```
personal-website/
├── src/pages/index.astro     ← 网站全部内容和样式（日常只改这个）
├── public/favicon.svg        ← 网站图标
├── astro.config.mjs          ← Pages 域名和仓库名配置（不用动）
├── .github/workflows/deploy.yml ← 推送后自动构建部署（不用动）
└── scripts/push.mjs          ← npm run push 背后的脚本（不用动）
```

## 注意事项

- 改内容只需要改 `index.astro` 顶部的 `site` 对象；想大改样式就改下面的 `<style>` 部分。
- 仓库配置的是**项目站点**，访问地址带 `/personal-website/` 路径；如果以后想用根地址（`sll521000.github.io`），把代码推到名为 `sll521000.github.io` 的仓库并删掉 `astro.config.mjs` 里的 `base` 即可。
- 部署状态可在仓库的 **Actions** 标签页查看：https://github.com/sll521000/personal-website/actions
