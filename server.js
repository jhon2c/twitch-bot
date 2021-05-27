require('dotenv').config();
const mysql = require('mysql');
const tmi = require('tmi.js');

const con = mysql.createConnection({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASS, 
  database: process.env.DB_NAME
});

con.connect((err) => {
  if (err) {
      console.log('Erro connecting to database...', err)
      return
  }
  console.log('Connection established!')
})

const client = new tmi.Client({
  connection: {
    reconnect: true
  },
  channels: [
    'jh0n_c'
  ],
  identity: {
    username: process.env.USERNAME,
    password: process.env.OAUTH
  }
});

client.connect();

client.on('message', (channel, tags, message, self) => {
	// Ignore echoed messages.
	if(self || message[0] !== '!') {
    return;
  }
  //Check for roles
  const badges = tags.badges || {};
  const isBroadcaster = badges.broadcaster;
  const isMod = badges.moderator;
  const isModUp = isBroadcaster || isMod;

  let params = message.slice(1).split(' ');
  console.log(params[0]);
  let command = params.shift().toLowerCase();
  console.log(command);


  if(command === 'addcom') {
    if (isModUp){
      // INSERT INTO comandos (`comando`, `resposta`) VALUES ('"+params[0]+"', '+params.slice(1).join(' ')+"'");
      // SELECT EXISTS(SELECT * from ExistsRowDemo WHERE ExistId=104);
      var cnt ="";
      con.query("SELECT 1 from comandos WHERE comando = '"+params[0]+"'", (error, res) => {
        if (error) {
          console.log(error);
          client.say(channel, "Erro no banco de dados");
        }
        console.log(res.length);
      })

      // con.query( "INSERT INTO comandos (`comando`, `resposta`) VALUES ('"+params[0]+"', '"+params.slice(1).join(' ')+"')" , (err, res) => {
      //    if (err) throw err
       //   client.say(channel, "Comando adicionado!");
      //})
    } else {
      
    }
  } else if (command === 'editcom') {
    if (isModUp){
      // UPDATE `comandos` SET `resposta` = 'Visite: http://zmlabs.com.br' WHERE `comandos`.`id` = 1;
    } else {
      
    }
  } else if (command === 'delcom') {
    if (isModUp){
       // DELETE FROM `comandos` (`id`, `comando`, `resposta`) VALUES (NULL, '!agenda', 'Todo dia');
    } else {
      
    }
  } else {
    con.query("SELECT resposta FROM comandos WHERE comando = '!"+command+"'", (err, rows) => {
      if (err) throw err
        rows.forEach(row => {
        client.say(channel, row.resposta);
      });
    })
  }  
});