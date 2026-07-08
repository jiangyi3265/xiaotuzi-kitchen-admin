# ============================================================================
# 小兔子厨房 管理后台（RuoYi-Vue3 / Vue3 + Vite）生产镜像
# 多阶段：Node 构建 dist -> Nginx 托管并反代后端
# 构建：docker build -t xiaotuzi-admin:latest -f RuoYi-Vue3/Dockerfile RuoYi-Vue3
# ============================================================================

# ---- 构建阶段 ----
FROM node:18-alpine AS build
WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build:prod

# ---- 运行阶段 ----
FROM nginx:1.25-alpine
COPY --from=build /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
