require('dotenv').config({ path: './config.env'});

const path = require('path');
const fs =  require('fs');
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

// MIDDLEWARE IMPORTS
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression =  require('compression');
const morgan = require('morgan');


const app = express(); 
const server = createServer(app);
const io = new Server(server);

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'});
// MIDDLEWARE ROUTES
app.use(morgan('combined',{stream:accessLogStream}));
// app.use(compression());
// app.use(helmet());
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
app.use(express.static(path.join(__dirname, 'frontend','public','js')));

// ROUTES
// app.use('/api', expenseRoutes);
app.use('/api', chatRoutes);
app.use('/api', userRoutes);
app.use('/api', groupRoutes);
// app.use('/api', membershipRoutes);

io.on('connection', (socket) => {
    console.log('a user connected');
  });

app.use('/',(req,res)=>{
  
    res.sendFile(path.join(__dirname,req.url));
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

