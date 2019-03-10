/**
 * Example:
 * npm i -g ini
 * node index.js /path/config.ini /path/rtmp.conf
 */

const fs = require('fs');
const path = require('path')
const ini = require('ini');

const settingsPath = path.resolve(process.argv[2])
const configPath = path.resolve(process.argv[3])
const settings = ini.parse(fs.readFileSync(settingsPath, 'utf-8'))
let rtmp = fs.readFileSync(configPath, { encoding: 'utf-8' })

const apps = []
const pushes = []

Object.keys(settings).forEach((sectionName) => {
  Object.keys(settings[sectionName]).forEach((source) => {
    let name
    if (source === 'youtube') {
      name = `YOUTUBE_${sectionName}`
    } else if (source === 'vk') {
      name = `VK_${sectionName}`
    }
    if (name) {
      pushes.push(`push rtmp://localhost/${name};`)
      apps.push(
        `application ${name} {
          live on;
          record off;
          push ${settings[sectionName][source]};
          allow publish all;
        }`
      )
    }
  })
})

let pushString = '#PUSH#\n'
pushes.forEach((push) => {
  pushString += push + '\n'
})
pushString += '#PUSH#'
rtmp = rtmp.replace(/#PUSH#([\s\S]*?)#PUSH#/gm, pushString)

let appString = '#APP#\n'
apps.forEach((app) => {
  appString += app + '\n'
})
appString += '#APP#'
rtmp = rtmp.replace(/#APP#([\s\S]*?)#APP#/gm, appString)

fs.writeFileSync(configPath, rtmp, { encoding: 'utf-8' })