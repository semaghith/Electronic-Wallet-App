FROM node:18 as base

WORKDIR /app
COPY package.json .


FROM base as development

RUN npm install
COPY . .
CMD [ "npm", "run", "dev" ]
EXPOSE 4000


FROM base as production

RUN npm install --only=prod
COPY . .
CMD [ "npm", "start" ]
EXPOSE 4000