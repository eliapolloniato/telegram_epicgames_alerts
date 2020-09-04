const axios = require('axios')
const moment = require('moment')

function parsePrice(data) {
    let price = {
        originalPrice: data.totalPrice.originalPrice,
        discountPrice: data.totalPrice.discountPrice,
        currencyCode: data.totalPrice.currencyCode
    }


    return price
}

function getFreeGames(Free_endpoint, country = "IT", allowCountries = "IT", locale = "it-IT") {
    return new Promise((resolve, reject) => {
        axios.get(Free_endpoint.replace('{{country}}', country).replace('{{allowCountries}}', allowCountries).replace('{{locale}}', locale)).catch((err) => {
            reject({ error: err, decription: "Errore nella richiesta" })
        }).then((response) => {
            let { data } = response.data
            let { elements } = data.Catalog.searchStore
            let free = elements.filter(offer => offer.promotions &&
                offer.promotions.promotionalOffers.length > 0 &&
                offer.promotions.promotionalOffers[0].promotionalOffers.find(p => p.discountSetting.discountPercentage === 0))
            resolve(free)
        }).catch((err) => reject(err))
    })
}

function parseFreeGames(input) {
    return new Promise((resolve, reject) => {
        let list = []
        if (input.length < 1) reject({ error: 'Input non valido' })
        for (let i = 0; i < input.length; i++) {
            let element = input[i]
            let game = {
                title: element.title,
                id: element.id,
                description: element.description,
                image: element.keyImages[0].url,
                publisher: element.customAttributes[1].value,
                price: parsePrice(element.price),
                startDate: moment(element.promotions.promotionalOffers[0].promotionalOffers[0].startDate).locale('it'),
                endDate: moment(element.promotions.promotionalOffers[0].promotionalOffers[0].endDate).locale('it')
            }
            list.push(game)
        }
        resolve(list)
    })
}

module.exports = {
    getFreeGames,
    parseFreeGames
}