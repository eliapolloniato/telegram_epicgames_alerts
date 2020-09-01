if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const _ = require('lodash')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
var fetch = require('./get')
var config = require('./database/config.json')
var bot = require('./bot')

const adapter = new FileSync('./database/db.json')
const db = low(adapter)

var oldGames = {}


function loop(app) {
    setTimeout(() => {
        fetch.getFreeGames(config.endpoints.FREE_GAMES, config.country, config.allowCountries, config.locale).then((result) => {
            fetch.parseFreeGames(result).then((games) => {
                let newIds = []
                games.forEach(e => {
                    newIds.push(e.id)
                })

                let oldIds = db.get('games').value()

                let newGamesIds = _.difference(newIds, oldIds)

                if (newGamesIds.length > 0) {
                    let newGames = []
                    games.forEach((e => {
                        if (newGamesIds.includes(e.id)) {
                            newGames.push(e)
                        }
                    }))
                    bot.botSend(app, { games: newGames }).catch((err) => {
                        console.error(err)
                    })
                    db.set('games', newIds)
                        .write()
                }
            })
        })
        loop()
    }, config.timeout * 1000)
}

db.defaults({ chatIds: [], count: 0, games: [] })
    .write()


bot.botCreate(process.env.BOT_TOKEN).catch((error) => {
    console.error(error)
}).then((app) => {
    loop(app)
})