FROM node:14

WORKDIR /tinsey/
COPY . .

# "build time" ENVs must be set in Dockerfile via ARGs passed from docker-compose... fun
ARG node_env
ARG google_client_id
ENV NODE_ENV=$node_env
ENV GOOGLE_API_FILBERT_CLIENT_ID=$google_client_id

# NOTE: install of both devDependencies & dependencies required
RUN yarn install --production=false; \
  yarn sapper-build;

# multi-staged builds save space!
FROM node:14-slim

WORKDIR /usr/local/tinsey/
COPY --from=0 /tinsey/ /usr/local/tinsey/
RUN mkdir /usr/local/logs

EXPOSE 3000
CMD ["yarn", "sapper-start"]
