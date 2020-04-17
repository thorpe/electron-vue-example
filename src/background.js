'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import store from './store.js'
import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'

const log = require('electron-log')

const { autoUpdater } = require('electron-updater')
// const isDevelopment = process.env.NODE_ENV !== 'production'

let win
console.log(store.state.config.api_key)

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow() {
  win = new BrowserWindow({
    width: 860,
    height: 750,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.setMenu(null)
  win.setResizable(false)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    } else {
      win = null
    }
  })
}

log.info('-------------------setFeedURL')
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'jampick-kr',
  repo: 'chainflix-storage-update'
})
log.info('-------------------setFeedURL')

app.on('ready', createWindow)
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
//
// if (isDevelopment) {
//   if (process.platform === 'win32') {
//     process.on('message', data => {
//       if (data === 'graceful-exit') {
//         app.quit()
//       }
//     })
//   } else {
//     process.on('SIGTERM', () => {
//       app.quit()
//     })
//   }
// }

autoUpdater.on('update-available', async () => {
  log.info('update-available')
  const aaa = await win.webContents.send('update_available')
  log.info(aaa)
})

autoUpdater.on('update-downloaded', async () => {
  log.info('update-downloaded')
  await win.webContents.send('update_downloaded')
})

ipcMain.on('app_version', async (event) => {
  log.info('app_version')
  await event.sender.send('app_version', { version: app.getVersion() })
})

ipcMain.on('quit_and_install', async () => {
  log.info('quit_and_install')
  await autoUpdater.quitAndInstall()
})

ipcMain.on('check_for_update', async () => {
  log.info('check_for_update')

  await autoUpdater.checkForUpdates()
})
