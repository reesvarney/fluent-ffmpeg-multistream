const net = require('net')
const fs = require('fs')
const path = require('path');

var counter = 0
class UnixStream {
  constructor (stream, onSocket) {
    let sockpath = './' + (++counter) + '.sock'
    this.url = 'unix:' + sockpath
    if(process.platform === "win32") {
      sockpath = path.join('\\\\?\\pipe', './' + (++counter) + '.sock')
      this.url = sockpath
    }
    

    try {
      fs.statSync(sockpath)
      fs.unlinkSync(sockpath)
    } catch (err) {}
    const server = net.createServer(onSocket)
    stream.on('finish', () => {
      server.close()
    })
    server.listen(sockpath)
  }
}

function StreamInput (stream) {
  return new UnixStream(stream, socket => stream.pipe(socket))
}
module.exports.StreamInput = StreamInput

function StreamOutput (stream) {
  return new UnixStream(stream, socket => socket.pipe(stream))
}
module.exports.StreamOutput = StreamOutput
