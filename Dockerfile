FROM node:16.14.0-alpine3.14

RUN apk add --no-cache libc6-compat

RUN npm i -g npm

#ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

WORKDIR /home/nextjs/app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY package.json .
COPY package-lock.json .

RUN chown -R nextjs:nodejs /home/nextjs

USER nextjs

# If you are building your code for production
# RUN npm install --only=production

RUN npm install
RUN npx browserslist@latest --update-db
RUN npx next telemetry disable

COPY . .
