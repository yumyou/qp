FROM node:16-alpine as build-stage

WORKDIR /admim

COPY .npmrc package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
ARG NODE_ENV=""
RUN env ${NODE_ENV} npm run build:prod

## -- stage: dist => nginx --
FROM nginx:alpine

ENV TZ=Asia/Shanghai

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /admim/dist /usr/share/nginx/html

EXPOSE 80
