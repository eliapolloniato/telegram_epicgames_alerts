require('dotenv').config()
const _ = require('lodash')
var fetch = require('./get')
var config = require('./config.json')

var oldGames = {}

function loop() {
    setTimeout(() => {
        fetch.getFreeGames(config.endpoints.FREE_GAMES, config.country, config.allowCountries, config.locale).then((result) => {
            fetch.parseFreeGames(result).then((games) => {
                if (!_.isEqual(oldGames, games)) {
                    console.log(games)
                    oldGames = games
                } else {
                    console.log('nessun nuovo gioco')
                }

            })
        })
        loop()
    }, config.timeout * 1000)
}

loop()