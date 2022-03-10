FROM node:16.14.0-alpine3.14 as build

# Copy in only the parts needed to install dependencies
# (This avoids rebuilds if the package.json hasn’t changed)
COPY package.json  .
COPY package-lock.json .

# Install dependencies (including dev dependencies)
RUN npm install

# Copy in the rest of the project
# (include node_modules in a .dockerignore file)
COPY . .

# Build the project
RUN npm run build

# Second stage: runtime
FROM node:16.14.0-alpine3.14

ENV NODE_ENV=production

# Again get dependencies, but this time only install
# runtime dependencies
COPY package.json  .
COPY package-lock.json .
RUN npm install --only=production

# Get the built application from the first stage
COPY --from=build /home/nextjs/app/.next .

# Set runtime metadata
ENV PORT 3000
EXPOSE 3000
