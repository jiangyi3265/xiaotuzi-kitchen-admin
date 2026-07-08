# 小兔子厨房管理后台

小兔子厨房管理后台是私房菜点单项目的运营管理端，提供菜品、分类、订单、厨师、配送员、分享内容、厨房配置等管理功能。项目基于 RuoYi-Vue3 改造，配合后端服务和用户端小程序形成完整三端系统。

## 技术栈

- Vue 3
- Vite
- Element Plus
- Pinia / Vue Router
- Axios
- Nginx
- Docker

## 关联仓库

| 子项目 | 仓库 | 说明 |
| --- | --- | --- |
| 后端服务 | [xiaotuzi-kitchen-backend](https://github.com/jiangyi3265/xiaotuzi-kitchen-backend) | Spring Boot API、权限、订单和业务数据 |
| 管理后台 | [xiaotuzi-kitchen-admin](https://github.com/jiangyi3265/xiaotuzi-kitchen-admin) | Vue3 管理端，用于维护菜品、订单、配送员等 |
| 用户端 | [xiaotuzi-kitchen-app](https://github.com/jiangyi3265/xiaotuzi-kitchen-app) | uni-app 微信小程序，面向用户点单和分享 |

## 快速启动

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build:prod
```

Docker 构建：

```bash
docker build -t xiaotuzi-admin:latest .
```

默认生产接口前缀为 `/prod-api`，由 Nginx 反向代理到后端服务。

## GitHub Actions 部署

推送到 `main` 后会通过 SSH 登录服务器，更新 `/opt/xiaotuzi-kitchen/current/RuoYi-Vue3`，并重建 `admin` 容器。

仓库需要配置以下 Secrets：

```text
SERVER_HOST
SERVER_PORT
SERVER_USER
SERVER_SSH_KEY
SERVER_DEPLOY_PATH
```

## 简历描述示例

基于 Vue3 + Element Plus 搭建私房菜运营后台，实现菜品、分类、订单、配送员和厨房配置管理，并接入 Docker 与 GitHub Actions 自动化发布流程。
