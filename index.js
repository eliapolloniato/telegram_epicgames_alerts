require('dotenv').config()
var fetch = require('./get')
var config = require('./config.json')

fetch.getFreeGames(config.endpoints.FREE_GAMES, config.country, config.allowCountries, config.locale).then((result) => {
    fetch.parseFreeGames(result).then((games) => {
        console.log(games)
    })
})