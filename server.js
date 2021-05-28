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
      console.log('Erro conectando ao banco de dados', err)
      return
  }
  console.log('Conectado ao banco de dados!')
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
	// Ignore echoed and non command messages.
	if(self || message[0] !== '!') {
    return;
  }
  //Check for roles
  const badges = tags.badges || {};
  const isBroadcaster = badges.broadcaster;
  const isMod = badges.moderator;
  const isModUp = isBroadcaster || isMod;
  
  // Split commands from querys 
  let params = message.slice(1).split(' ');
  let command = params.shift().toLowerCase();
  
  // Conditional checks
  if(command === 'addcom') {
    if (isModUp){
      con.query("SELECT 1 from comandos WHERE comando = '"+params[0]+"'", (error, res) => {
        if (error) {
          console.log(error);
          client.say(channel, "Erro no banco de dados! NotLikeThis ");
        }
        if (res.length  > 0) {
          console.log('Falha ao adicionar um comando');
          client.say(channel, "Esse comando já existe! NotLikeThis ");
        } else {
          console.log('Inserido novo comando');
          con.query( "INSERT INTO comandos (`comando`, `resposta`) VALUES ('"+params[0]+"', '"+params.slice(1).join(' ')+"')" , (error, res) => {
            if (error) {
              console.log(error);
              client.say(channel, "Erro no banco de dados! NotLikeThis ");
            }
             client.say(channel, "Comando adicionado! Façam um bom uso. Keepo");
           })
        }
      })
    } else {
      client.say(channel, "Somente mods podem adicionar comandos. CoolStoryBob ");
    }
  } else if (command === 'editcom') {
    if (isModUp){
      con.query("SELECT 1 from comandos WHERE comando = '"+params[0]+"'", (error, res) => {
        if (error) {
          console.log(error);
          client.say(channel, "Erro no banco de dados! NotLikeThis ");
        }
        if (res.length  < 0) {
          console.log('Falha ao adicionar um comando');
          client.say(channel, "Esse comando não existe! NotLikeThis ");
        } else {
          console.log('Editando um comando');
          con.query( "UPDATE comandos SET resposta = '"+params.slice(1).join(' ')+"' WHERE comando = '"+params[0]+"';", (error, res) => {
            if (error) {
              console.log(error);
              client.say(channel, "Erro no banco de dados! NotLikeThis ");
            }
             client.say(channel, "Comando modificado! KomodoHype");
           })
        }
      })
    } else {
      client.say(channel, "Comando editado, brinks! Tu não pode fazer isso. Keepo"); 
    }
  } else if (command === 'delcom') {
    if (isModUp){
      con.query("SELECT 1 from comandos WHERE comando = '"+params[0]+"'", (error, res) => {
        if (error) {
          console.log(error);
          client.say(channel, "Erro no banco de dados! NotLikeThis");
        }
        if (res.length  < 0) {
          console.log('Falha ao adicionar um comando');
          client.say(channel, "Esse comando não existe! NotLikeThis");
        } else {
          console.log('Excluindo um comando');
          con.query( "DELETE FROM comandos WHERE comando = '"+params[0]+"'", (error, res) => {
            if (error) {
              console.log(error);
              client.say(channel, "Erro no banco de dados! NotLikeThis");
            }
             client.say(channel, "Comando excluído! BibleThump ");
           })
        }
      })
    } else {
      client.say(channel, "Lhe falta uma espada para poder fazer isso! 4Head ");
    }
  } else {
    con.query("SELECT resposta FROM comandos WHERE comando = '!"+command+"'", (error, res) => {
      if (error) {
        console.log(error);
        client.say(channel, "Erro no banco de dados! NotLikeThis");
      }
        res.forEach(row => {
        client.say(channel, row.resposta);
      });
    })
  }  
});