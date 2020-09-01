export NODE_ENV=production
docker build -t eliapolloniato/telegram_epicgames_alerts .
docker run --name telegram_epicgames_alerts --restart unless-stopped -d -v $(pwd)/database:/usr/src/app/database -e BOT_TOKEN_2 eliapolloniato/telegram_epicgames_alerts