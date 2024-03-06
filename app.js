require('dotenv').config({ path: './config.env'});

const path = require('path');
const fs =  require('fs');
const express = require('express');

// MIDDLEWARE IMPORTS
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression =  require('compression');
const morgan = require('morgan');


const app = express(); 

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'});
// MIDDLEWARE ROUTES
app.use(morgan('combined',{stream:accessLogStream}));
app.use(compression());
app.use(helmet());
app.use(cors({
    "origin":"http://127.0.0.1:5500"
}))
app.use(express.json());

// app.set('view engine', 'ejs');
// app.set('views', 'views');

// ROUTES IMPORT
const expenseRoutes = require('./routes/expense');
const userRoutes = require('./routes/user');
const membershipRoutes = require('./routes/membership');

// DATABASE and MODEL   IMPORT
const sequelize = require('./util/database');
const User = require('./models/user');
const Forgotpassword = require('./models/forgotPassword');
const Expense = require('./models/expense');
const Order = require('./models/order');




app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/api', expenseRoutes);
app.use('/api', userRoutes);
app.use('/api', membershipRoutes);

app.use((req,res)=>{
    res.sendFile(path.join(__dirname,'frontend',req.url));
})
//  ASSOCIATION
User.hasMany(Expense);
Expense.belongsTo(User);
 
User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword); 
Forgotpassword.belongsTo(User);

//   sequelize.sync({force:true})
 sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT || 3000);
    }).catch((err) => {
        console.log(err);
    });

