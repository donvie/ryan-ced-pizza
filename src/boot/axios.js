import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { reactive } from 'vue'
import { sumBy, sortBy } from 'lodash'
import Artyom from 'artyom.js'
import qs from 'qs'

import VueChartkick from 'vue-chartkick'
import 'chartkick/chart.js'

// const { customAlphabet } = require('nanoid')
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890ABCDEF', 6)

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'https://ccd-mirdc.ap.ngrok.io/api' })

// api.defaults.headers.common['Authorization'] = 'Bearer ' + jwt

import { LocalStorage } from 'quasar'

// $global.jwt = LocalStorage.getItem('jwtt')
// $global.user = LocalStorage.getItem('userr')
// $global.cart = LocalStorage.getItem('cartt') || []

if (LocalStorage.getItem('jwtt')) {
  api.defaults.headers.common.Authorization = 'Bearer ' + LocalStorage.getItem('jwtt')
}

const $global = reactive({
  user: LocalStorage.getItem('userr'),
  jwt: LocalStorage.getItem('jwtt'),
  address: LocalStorage.getItem('addresss'),
  landmark: LocalStorage.getItem('landmarkk'),
  contactNo: LocalStorage.getItem('contactNoo'),
  items: [],
  cart: LocalStorage.getItem('cartt') || [],
  reviewing: false,
  loading: false,
  cartIsOpen: false,
  ordersIsOpen: false,
  salesIsOpen: false,
  profileMenuIsOpen: false,
  orders: [],
  placingOrder: false,
  sales: { byDay: {}, byMonth: {}, today: 0 }
})

export default boot(({ app }) => {
  app.use(VueChartkick)

  const artyom = new Artyom()

  artyom.initialize({
    // lang: 'en-GB',
    continuous: true,
    debug: true, // Show what recognizes in the Console
    listen: true, // Start listening after this
    speed: 1, // Talk a little bit slow
    mode: 'normal' // This parameter is not required as it will be normal by default
  }).then(() => {
    console.log('Ready to work !')
  })
  // artyom.fatality() // use this to stop any of

  // setTimeout(function () { // if you use artyom.fatality , wait 250 ms to initialize again.
  //   artyom.initialize({
  //     lang: 'en-US', // A lot of languages are supported. Read the docs !
  //     continuous: true, // recognize 1 command and stop listening !
  //     listen: true, // Start recognizing
  //     debug: true, // Show everything in the console
  //     speed: 1 // talk normally
  //   }).then(function () {
  //     console.log('Ready to work !')
  //   })
  // }, 250)

  if (artyom.recognizingSupported()) {
    console.log('PWEDE')
  } else {
    console.log('ayaw bro')
    // This browser doesn't support webkitSpeechRecognition
  }
  app.config.globalProperties.$chupipay = artyom
  app.config.globalProperties.$qs = qs
  app.config.globalProperties.$lodash = {
    sumBy,
    sortBy
  }

  app.config.globalProperties.$nanoid = nanoid

  app.config.globalProperties.$global = $global

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  app.config.globalProperties.$popupCenter = ({ url, title, w, h }, listener) => {
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height

    const systemZoom = width / window.screen.availWidth
    const left = (width - w) / 2 / systemZoom + dualScreenLeft
    const top = (height - h) / 2 / systemZoom + dualScreenTop
    const newWindow = window.open(url, title,
      `
      scrollbars=yes,
      width=${w / systemZoom}, 
      height=${h / systemZoom}, 
      top=${top}, 
      left=${left}
      `
    )

    if (window.focus) newWindow.focus()

    newWindow.onblur = newWindow.close

    window.removeEventListener('message', listener, false)
    window.addEventListener('message', e => {
      if (e.origin !== window.location.host) return

      listener(e.data)
    }, false)

    return newWindow
  }
})

export { api }
