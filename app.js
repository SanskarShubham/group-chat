require('dotenv').config({ path: './config.env' });

const path = require('path');
const fs = require('fs');
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
require('./util/chat-archive-cronjob')
// MIDDLEWARE IMPORTS IMPORTS
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const userAuth = require('./middleware/auth'); 


const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
// MIDDLEWARE ROUTES
app.use(morgan('combined', { stream: accessLogStream }));
app.use(compression());
app.use(helmet());
app.use(cors())
app.use(express.json());  

// ROUTES IMPORT

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group'); 

// DATABASE and MODEL   IMPORT
const sequelize = require('./util/database');
const User = require('./models/user');
const Forgotpassword = require('./models/forgotPassword');
const Chat = require('./models/chat');
const Group = require('./models/group');
const GroupUsers = require('./models/groupUsers');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'frontend', 'public', 'js')));

// ROUTES
// app.use('/api', expenseRoutes);
app.use('/api', chatRoutes);
app.use('/api', userRoutes);
app.use('/api',userAuth.authorization, groupRoutes);
// app.use('/api', membershipRoutes);
app.set("ipaddr", "127.0.0.1");
app.set("port", 3000);

io.on('connection', (socket) => {
    console.log(`a user connected ${socket.id}`);
    socket.on('message',(msg)=>{
        console.log(msg);
        io.emit('send_message',msg);
    })
});

app.use('/', (req, res) => {

    res.sendFile(path.join(__dirname, req.url));
})
//  ASSOCIATION


User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(Chat);
Chat.belongsTo(User);


User.hasMany(Group);
Group.belongsToMany(User, { through: GroupUsers })
User.belongsToMany(Group, { through: GroupUsers });

Group.hasMany(Chat);


//    sequelize.sync({force:true}) 
sequelize.sync()
    .then(() => {
        server.listen(process.env.PORT || 3000);
    }).catch((err) => {
        console.log(err);
    });

