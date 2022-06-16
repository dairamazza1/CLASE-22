// const socket = io.connect();
const { schema, normalize, denormalize } = require('normalizr') 
const util = require('util')
const { percentage } = require('../utils/percentage') 

function print(objeto) {
    console.log(util.inspect(objeto, false, 12, true));
}

function renderChat(data) {
    let fecha=  new Date();

    let dia = fecha.getDate();
    let anio = fecha.getFullYear();
    let mes = (fecha.getMonth() + 1);

    let hora = fecha.getHours() + ":";
    let minutos = fecha.getMinutes() + ":";
    let segundos = fecha.getSeconds() ;
    const msg = data.map((elem, index) => {
      return `<div>
                    <strong class="blue_chat">${elem.user}</strong> [<strong class="brown_chat">${dia}/${mes}/${anio } ${hora}${minutos}${segundos}</strong>]:
                    <em class="green_chat">${elem.message}</em>
              </div>`;
    }).join(" ");
    document.getElementById("text_set").innerHTML = msg;
    // console.log(msg);
}

function addChat(e) {
     const obj = {
        author: {
          email: document.getElementById("email").value,
          nombre: document.getElementById("name").value,
          apellido: document.getElementById("lastname").value,
          edad: document.getElementById("age").value,
          alias: document.getElementById("alias").value,
          avatar: document.getElementById("thumbnail").value
        },
        text: { text: document.getElementById("text").value }
    };

    // console.log("_________");
    // console.log(obj);
     socket.emit('new-text', obj);

    document.getElementById("email").value = '';
    document.getElementById("name").value = '';
    document.getElementById("lastname").value = '';
    document.getElementById("age").value = '';
    document.getElementById("alias").value = '';
    document.getElementById("thumbnail").value = '';
    document.getElementById("text").value = '';

    return false;
}

socket.on('text', data => {
    try {
      const dataChat = { id: 1, mensajes: [] };
      dataChat.mensajes = data;
      //esquema de autor del mensaje
      let author = new schema.Entity("author",{}, { 
        idAttribute: "email" 
      });
      //esquema de autores
      let chat = new schema.Entity("chat", {
        author: {author}
      });
      //esquema objeto
      let dataObj = new schema.Entity("data", {
        mensaje : [chat]
      });

        console.log('----------- OBJETO ORIGINAL --------------');
        const notCompressDataLength = JSON.stringify(dataObj).length;
        console.log(notCompressDataLength);

        console.log('----------- OBJETO NORMALIZADO --------------');
        const normalizeData = normalize(dataChat, chat);
        print(normalizeData)
        const compressDataLength = JSON.stringify(normalizeData).length;
        console.log(compressDataLength);

        console.log('----------- OBJETO DESNORMALIZADO --------------');
        const denormalizeData = denormalize(normalizeData.result, chat, normalizeData.entities);
        print(denormalizeData)

        // PORCENTAJE DE COMPRESIÓN
        percentage(compressDataLength,notCompressDataLength);
    
        // enviar obj desnormalizado al front
        renderChat(denormalizeData);
      } catch (error) {
        console.log("ERROR - NO FUNCIONA");
        console.log(error);
      }
})