const express = require('express');
const { get } = require('express/lib/response');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors())
const database = {
    users: [
        {
            id:  '123',
            name: 'John',
            email: 'John@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id:  '124',
            name: 'Sally',
            email: 'Sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res)=> {
    res.send(database.users);
})

app.post('/signin', (req, res)=> {
    // Load hash from your password DB.
    bcrypt.compare("apples",'$2a$10$/OXsawjDsbu0aTyznMuInuKXAHZLyah3Xd7g4.HaLo6uaGOge9FfC', function(err, res) {
        // res === true
        console.log('password correct',res )
    });
    bcrypt.compare("not_bacon",'$2a$10$/OXsawjDsbu0aTyznMuInuKXAHZLyah3Xd7g4.HaLo6uaGOge9FfC', function(err, res) {
        // res === false
        console.log('password icorrect',res )
    });
    
    if(req.body.email === database.users[0].email && 
        req.body.password === database.users[0].password){
            res.json(database.users[0]);
        }else {
            res.status(400).json('error loging in');
        }
    
})

app.post('/register', (req, res)=> {
    const {email, name, password } = req.body;
        // Store hash in your password DB.
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            console.log(hash);
        });
    });

    database.users.push( {
        id:  '125',
        name: name,
        email: email,
        entries: 0,
        joined: new Date()
    })
    res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req, res)=> {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id == id ){
            found = true;
           return res.json(user);
        }
    })
    if(!found){
        res.status(400).json('user not found');
    }
})

app.put('/image', (req, res)=> {
    const { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id == id ){
            found = true;
            user.entries++;
           return res.json(user.entries);
        }
    })
    if(!found){
        res.status(400).json('user not found');
    }
})


 
app.listen(3001, ()=> {
    console.log('app is running on port 3001');
});
