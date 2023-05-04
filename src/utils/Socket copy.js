import { Toast } from 'vant'
var socket
function init() {
  var host = 'ws://47.112.157.241:8090/'
  return new Promise((resolve, reject) => {
    try {
      socket = new WebSocket(host)
      socket.onopen = function() {
        socket.send('web')
        Toast('链接成功')
        resolve()
      }
      const inv = setInterval(() => {
        socket.send('heart')
      }, 1000)
      socket.onclose = function(e) {
        console.log('websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
        console.log(e)
        clearInterval(inv)
        // if (e.code === 1006)
      }
    } catch (ex) {
      Toast('链接失败，刷新重新试一下～')
      reject()
    }
  })
}
function send(msg) {
  try {
    socket.send(msg)
  } catch (ex) {
    console.log(ex)
  }
}
window.onbeforeunload = function() {
  try {
    console.log('quit')
    socket.send('quit')
    socket.close()
    socket = null
  } catch (ex) {
    console.log(ex)
  }
}

export { socket, send, init }
