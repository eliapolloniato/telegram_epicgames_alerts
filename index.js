require('dotenv').config()
const _ = require('lodash')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
var fetch = require('./get')
var config = require('./config.json')
var bot = require('./bot')

const adapter = new FileSync('db.json')
const db = low(adapter)

var oldGames = {}


function loop(app) {
    setTimeout(() => {
        fetch.getFreeGames(config.endpoints.FREE_GAMES, config.country, config.allowCountries, config.locale).then((result) => {
            fetch.parseFreeGames(result).then((games) => {
                if (!_.isEqual(oldGames, games)) {
                    bot.botSend(app, { games: games })
                    console.log('nuovo gioco')
                    oldGames = games
                } else {
                    console.log('nessun nuovo gioco')
                }

            })
        })
        loop()
    }, config.timeout * 1000)
}

db.defaults({ chatIds: [], count: 0 })
    .write()


bot.botCreate(process.env.BOT_TOKEN).catch((error) => {
    console.error(error)
}).then((app) => {
    loop(app)
})