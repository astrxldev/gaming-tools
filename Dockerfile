FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ron-utils/package.json ./packages/ron-utils/
COPY packages/rond/package.json ./packages/rond/
COPY packages/gidmgcalculator/package.json ./packages/gidmgcalculator/
COPY packages/tailwind-theme/package.json ./packages/tailwind-theme/

RUN npm install

EXPOSE 8707

CMD ["npm", "run", "gidmgcalculator:dev"]
