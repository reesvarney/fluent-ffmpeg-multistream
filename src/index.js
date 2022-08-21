const net = require('net')
const fs = require('fs')
const path = require('path');

let counter = 0
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
    } catch{}

    this.server = net.createServer((socket)=>{
      socket.on("error", ()=>{
        try{
          this.server.close()
        } catch{}
      })
      onSocket(socket);
    })
    stream.on('finish', () => {
      this.server.close()
    });

    this.server.listen(sockpath)
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
