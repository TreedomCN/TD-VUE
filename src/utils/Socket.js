import { Toast } from 'vant'
var socket
function init() {
  var host = 'wss://aicar.treedom.cn/'
  return new Promise((resolve, reject) => {
    try {
      socket = new WebSocket(host)
      socket.onopen = function() {
        console.log()
        socket.send(JSON.stringify({ 'type': 'login', 'client_name': window.user.username, 'room_id': 1, 'from': 'room' }))
        Toast('链接成功')
        resolve()
      }
      socket.onmessage = function(e) {
        console.log(JSON.parse(e.data))
      }
      const inv = setInterval(() => {
        socket.send(JSON.stringify({ 'type': 'ping' }))
      }, 5000)
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
    // socket.send(JSON.stringify({}))
    socket.close()
    socket = null
  } catch (ex) {
    console.log(ex)
  }
}

export { socket, send, init }
