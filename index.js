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
                    bot.botSend(db, app, { games: newGames }).catch((err) => {
                        throw new Error(err)
                    }).then(() => console.log('nuovo gioco'))
                    db.set('games', newIds)
                        .write()
                }
            })
        }).catch((err) => {
            console.log(err)
        })

        loop(app)
    }, config.timeout * 1000)
}

db.defaults({ chatIds: [], count: 0, games: [] })
    .write()


bot.botCreate(db, process.env.BOT_TOKEN_2).catch((error) => {
    console.error(err)
    process.exit(1)
}).then((app) => {
    loop(app)
})