const Discord = require('discord.js')
const fs = require('fs-jetpack')
const nsapi = require('nsapi')
const WikiBot = require('nodemw')

const client = new Discord.Client()
const wiki = new WikiBot({
  server: 'ria.baelyk.com',
  path: '/wiki',
  debug: true
})
const ns = new nsapi.NsApi('Babylatia, Discord bot')

const secrets = require('./secrets.json')
let data // TODO: if data.json doesn't exist, create it

const commands = [
  {
    name: 'Points',
    invoker: (args) => {
      return args[0] === 'points'
    },
    function: points
  }, {
    name: 'Search',
    invoker: (args) => {
      return args[0] === 'wiki'
    },
    function: searchWiki
  }, {
    name: 'NS API',
    invoker: args => {
      return args[0] === 'ns'
    },
    function: nsApi
  }, {
    name: 'Nation Info',
    invoker: (args) => {
      return args[0] === 'nation'
    },
    function: nationInfo
  }
]

function nationInfo (message, args) {
  // ['nation', 'link or wiki or overview', 'nation']
  if (args[1] === 'link') {
    args[2] = args.splice(2).join('_')
    if (args[2].length > 0) {
      ns.nationRequest(args[2], ['name'])
      .then(data => {
        message.reply(`https://nationstates.net/nation=${args[2]}`)
      })
      .catch(error => {
        if (error.responseMetadata.statusMessage === 'Not Found') {
          message.reply(`I couldn't find a nation called '${args[2]}'`)
        } else {
          message.reply(`that gave me an unexpected error!`)
        }
      })
    } else {
      message.react('😒')
      message.reply('the full syntax includes a nation, like so: `nation link <nation_name_here>`')
    }
  } else if (args[1] === 'wiki') {
    args[2] = args.splice(2).join(' ')
    if (args[2].length > 0) {
      wiki.api.call({
        action: 'query',
        list: 'search',
        srsearch: args[2],
        srwhat: 'text',
        utf8: ''
      }, (err, info, next, data) => {
        if (err) console.error(err)
        let result = data.query.search[0]
        if (result !== undefined) {
          const url = `http://ria.baelyk.com/wiki/index.php?title=${result.title.replace(' ', '_')}`
          message.reply(url)
        } else {
          message.reply(`hmmm... I didn't get any results for '${args[2]}'`)
        }
      })
    } else {
      message.react('😒')
      message.reply('the full syntax includes a nation, like so: `nation wiki <nation_name_here>`')
    }
  } else if (args[1] === 'overview') {
    if (args[2].length > 0) {
      wiki.api.call({
        action: 'query',
        list: 'search',
        srsearch: args[2],
        srwhat: 'text',
        utf8: ''
      }, (err, info, next, data) => {
        if (err) console.error(err)
        if (data.query.search[0] !== undefined) {
          let title = data.query.search[0].title
          if (title !== undefined) {
            wiki.api.call({
              action: 'query',
              prop: 'extracts',
              exintro: '',
              explaintext: '',
              titles: escape(title),
              redirects: 1,
              indexpageids: 1
            }, (err, info, next, data) => {
              if (err) console.error(err)
              let summary = data.query.pages[data.query.pageids[0]].extract
              if (summary !== undefined) {
                summary = summary === '' ? 'no summary available' : summary
                message.reply(summary)
              } else {
                message.reply(`hmmm... I didn't get any results for '${args[2]}'`)
              }
            })
          } else {
            message.reply(`hmmm... I didn't get any results for '${args[2]}'`)
          }
        } else {
          message.reply(`hmmm... I didn't get any results for '${args[2]}'`)
        }
      })
    } else {
      message.react('😒')
      message.reply('the full syntax includes a nation, like so: `nation overview <nation_name_here>`')
    }
  }
}

function nsApi (message, args) {
  // args = ['ns', 'delegate', 'region']
  args[1] = args[1].toLowerCase()
  args[2] = args.splice(2).join('_')
  if (args[1] === 'delegate' || args[1] === 'founder' || args[1] === 'numnations' || args[1] === 'rflag') {
    if (args[1] === 'rflag') {
      ns.regionRequest(args[2], ['flag']).then(data => {
        let info = data.flag
        message.reply({file: info})
      })
      .catch(error => {
        if (error.responseMetadata.statusMessage === 'Not Found') {
          message.reply(`I couldn't find a region called '${args[2]}'`)
        } else {
          message.reply(`that gave me an unexpected error!`)
        }
      })
    } else {
      ns.regionRequest(args[2], [args[1]]).then(data => {
        let info = data[args[1]]
        message.reply(`the ${args[1]} of ${args[2]} is ${info}`)
      })
      .catch(error => {
        if (error.responseMetadata.statusMessage === 'Not Found') {
          message.reply(`I couldn't find a region called '${args[2]}'`)
        } else {
          message.reply(`that gave me an unexpected error!`)
        }
      })
    }
  } else if (args[1] === 'animal' || args[1] === 'capital' || args[1] === 'currency' || args[1] === 'demonym' || args[1] === 'endorsements' || args[1] === 'flag' || args[1] === 'fullname' || args[1] === 'gdp' || args[1] === 'influence' || args[1] === 'leader' || args[1] === 'motto' || args[1] === 'population' || args[1] === 'region' || args[1] === 'religion' || args[1] === 'tax') {
    if (args[1] === 'flag') {
      ns.nationRequest(args[2], ['flag']).then(data => {
        let info = data.flag
        message.reply({file: info})
      })
      .catch(error => {
        if (error.responseMetadata.statusMessage === 'Not Found') {
          message.reply(`I couldn't find a nation called '${args[2]}'`)
        } else {
          message.reply(`that gave me an unexpected error!`)
        }
      })
    } else {
      ns.nationRequest(args[2], [args[1]]).then(data => {
        let info = data[args[1]]
        message.reply(`the ${args[1]} of ${args[2]} is ${info}`)
      })
      .catch(error => {
        if (error.responseMetadata.statusMessage === 'Not Found') {
          message.reply(`I couldn't find a nation called '${args[2]}'`)
        } else {
          message.reply(`that gave me an unexpected error!`)
        }
      })
    }
  }
}

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
    .catch((error) => {
      if (error) console.error(error)
      if (error.code === 50035) message.reply('make sure you ping the person you want to give points to.')
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
    .catch((error) => {
      if (error) console.error(error)
      if (error.code === 50035) message.reply('make sure you ping the person you want to view the points of.')
    })
  } else {
    message.reply('What do you want to do with that command? Use `points give <user> <points>` to give someone points, or use `points view <user>` to view someones points!')
  }
}

function searchWiki (message, args) {
  let search = args.slice(1).join(' ')
  wiki.api.call({
    action: 'query',
    list: 'search',
    srsearch: search,
    srwhat: 'text',
    utf8: ''
  }, (err, info, next, data) => {
    if (err) console.error(err)
    if (data.query.search[0] !== undefined) {
      let result = data.query.search[0]
      const url = `http://ria.baelyk.com/wiki/index.php?title=${result.title.replace(' ', '_')}`
      message.reply(`page ${result.title} found: ${url}`)
    } else {
      message.reply(`hmmm... I didn't get any results for '${search}'`)
    }
  })
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
        console.log(`${message.author} issued command ${command.name} with args [${args}] and message content ${message.content}`)
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
