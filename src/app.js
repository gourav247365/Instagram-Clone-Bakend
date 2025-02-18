import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()

app.use(
  cors(
    {
      origin: process.env.CORS_ORIGIN,
      credential: true
    }
  )
)
app.use(
  express.json(
    {
      limit: "16kb"
    }
  )
)
app.use(
  express.urlencoded(
    {
      extended: true,
      limit: "16kb"
    }
  )
)
app.use(
  express.static("public")
)
app.use(
  cookieParser()
)

const server = createServer(app)
const io = new Server(server,
  { 
    cors: { 
      origin: process.env.CORS_ORIGIN, 
      methods: ["GET", "POST"] 
    },
    transports: ['websocket', 'polling'] 
  }
)

io.on('connection', (socket) => {

  console.log('A User Connected')

  socket.on('join', (chatId) => {
    socket.join(chatId)
    console.log('room Joined', chatId)
  })

  socket.on('message', (data) => {
    console.log(data);
    
    socket.to(data.chatId).emit('getMessage', data)
  })

  socket.on('typing', (data) => {
    console.log(data);
    
    socket.to(data.chatId).emit('getTyping', data)
  })

  socket.on('deleteMessage', (data) => {
    socket.to(data.chatId).emit('getDeleteMessage', data)
  })

})

// test route
app.get('',(req,res)=> {
  res.send("<h1>Hello World</h1>")
})
app.get('/test',(req,res)=> {
  res.send("<h1>Success</h1>")
})

// routes import
import userRouter from './routes/user.route.js'
import relationRouter from './routes/relation.routes.js'
import postRouter from './routes/post.routes.js'
import likeRouter from './routes/like.route.js'
import chatRouter from './routes/chat.route.js'
import notificationRouter from './routes/notification.route.js'
import messageRouter from './routes/message.route.js'
import commentRouter from './routes/comment.route.js'

// routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/relations', relationRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/likes', likeRouter)
app.use('/api/v1/chats', chatRouter)
app.use('/api/v1/notifications', notificationRouter)
app.use('/api/v1/messages', messageRouter)
app.use('/api/v1/comments', commentRouter)


export { server }