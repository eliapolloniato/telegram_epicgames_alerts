const { Telegraf } = require('telegraf')
const Extra = require('telegraf/extra')

function updateDB(db, chatId, username, type, groupTitle) {
    return new Promise((resolve, reject) => {
        if (!db.get('chatIds').find({ chatId: chatId }).value()) {
            console.log('nuovo utente:', username ? username : chatId)
            db.get('chatIds')
                .push({ chatId: chatId, type: type, name: username ? username : groupTitle })
                .write()
            db.update('count', n => n + 1)
                .write()
            let message = 'Notifiche attivate in quest{{type}}'
            resolve(message.replace('{{type}}', type === 'group' ? 'o gruppo' : 'a chat'))
        } else {
            db.get('chatIds')
                .remove({ chatId: chatId })
                .write()
            db.update('count', n => n - 1)
                .write()
            let message = 'Notifiche disattivate in quest{{type}}'
            reject(message.replace('{{type}}', type === 'group' ? 'o gruppo' : 'a chat'))
        }
    })
}

function botCreate(db, token) {
    return new Promise((resolve, reject) => {
        try {
            const bot = new Telegraf(token)
            bot.start((ctx) => ctx.reply('Questo bot ti invierà una notificha ogni volta che un gioco diventerà gratuito nell\'Epic Games Store.'))
            bot.command('notifica', (ctx) => {
                updateDB(db, ctx.chat.id, ctx.chat.username, ctx.chat.type, ctx.chat.title).catch((err) => {
                    ctx.reply(err)
                }).then((result) => {
                    if (result) {
                        ctx.reply(result)
                    }
                })
            })
            bot.help((ctx) => ctx.reply('Comandi:\n/notifica -> abilita le notifiche in questa chat'))
            bot.launch()
            resolve(bot)
        } catch (error) {
            reject(error)
        }
    })
}

function botSend(db, bot, data) {
    return new Promise((resolve, reject) => {
        let userList = db.get('chatIds')
            .value()
        userList.forEach(user => {
            data.games.forEach(game => {
                bot.telegram.sendPhoto(user.chatId,
                    game.image,
                    Extra.caption(`*${game.title}* di ${game.publisher} è ora gratis!\nFine promozione: ${game.endDate.format('llll')}\nPrezzo iniziale: ${game.price.originalPrice/100} ${game.price.currencyCode}\nDescrizione: ${game.description}`).markdown()
                ).catch((err) => reject(err))
            })
        })
        resolve('done')
    })
}


module.exports = {
    botCreate,
    botSend
}