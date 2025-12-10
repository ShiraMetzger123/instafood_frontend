# שלב build – בונה את האפליקציה של React
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# מניחה שיש לך script בשם "build" ב-package.json
RUN npm run build

# שלב serve – Nginx
FROM nginx:alpine

# מורידים קונפיג ברירת מחדל
RUN rm /etc/nginx/conf.d/default.conf

# מעתיקים את קבצי ה-build של React
COPY --from=build /app/build /usr/share/nginx/html

# מעתיקים קובץ קונפיג שניצור רגע
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
