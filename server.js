const express = require('express');
const { get } = require('express/lib/response');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '1234',
      database : 'face-recognition'
    }
  });

const app = express();

app.use(express.json());
app.use(cors())

app.get('/', (req, res)=> {
    res.send('success');
})

app.post('/signin', (req, res)=> {
    db.select('email','hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash); 
        if(isValid){
           return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
            res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('worng credentials');
        }
    })
    .catch(err => res.status(400).json('worng credentials'))
})

app.post('/register', (req, res)=> {
    const {email, name, password } = req.body;
    var salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);// Store hash in your password DB.
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                    email: loginEmail[0].email,
                    name: name,
                    joined: new Date()
            }).then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res)=> {
    const { id } = req.params;
    db.select('*').from('users').where({id})
    .then(user => {
        if(user.length){
            res.json(user[0])
        } else {
            res.status(400).json('user not found')
        }
    })
    .catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res)=> {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to entries'))
})


 
app.listen(3001, ()=> {
    console.log('app is running on port 3001');
});
