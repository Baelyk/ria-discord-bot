const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs-jetpack')

const secrets = require('./secrets.json')
let data // TODO: if data.json doesn't exist, create it

const commands = [
  {
    name: 'Points',
    invoker: (args) => {
      return args[0] === 'points'
    },
    function: points
  }
]

function parseId (id) {
  return id.replace('<@', '').replace('>', '')
}

function points (message, args) {
  // args = ['points', 'give or view', 'person', 'undefined or number']
  if (args[1] === 'give' && args.length === 4) {
    let nickname
    client.fetchUser(parseId(args[2])).then(user => {
      nickname = message.guild.member(user).nickname || user.username // in case they have a nickname

      if (data.points[parseId(args[2])] === undefined) {
        data.points[parseId(args[2])] = parseInt(args[3])
      } else {
        data.points[parseId(args[2])] += parseInt(args[3])
      }
      message.reply(`gave ${nickname} ${args[3]} points.`)
      saveData()
    })
  } else if (args[1] === 'view' && args.length === 3) {
    let nickname
    client.fetchUser(parseId(args[2])).then(user => {
      nickname = message.guild.member(user).nickname || user.username // in case they have a nickname

      if (data.points[parseId(args[2])] === undefined) {
        message.reply('You have no points :(')
      } else {
        message.reply(`${nickname} has ${data.points[parseId(args[2])]} points.`)
      }
      saveData()
    })
  } else {
    message.reply('What do you want to do with that command? Use `points give <user> <points>` to give someone points, or use `points view <user>` to view someones points!')
  }
}

function saveData () {
  fs.write('data.json', data)
  data = require('./data.json')
}

client.on('ready', () => {
  console.log('Ready!')
})

client.on('message', message => {
  if (message.content === 'ping') {
    message.react('🏓')
  }

  if (message.content.startsWith(`<@${client.user.id}>`) && message.content.length > `<@${client.user.id}>`.length) {
    const args = message.content.split(' ').slice(1)
    let doneCommand = false
    commands.forEach(command => {
      if (command.invoker(args)) {
        doneCommand = true
        command.function(message, args)
      }
    })
    if (!doneCommand) {
      message.reply('hmmm... I couldn\'t find a command that matches that.')
    }
  } else if (message.content.startsWith(`<@${client.user.id}>`)) {
    message.reply('what?')
  }
})

if (!fs.exists('data.json')) {
  fs.write('data.json', {
    points: {}
  })
}
data = require('./data.json')

client.login(secrets.token)
