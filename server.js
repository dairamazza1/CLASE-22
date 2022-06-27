//EXPRESS
const express = require('express')
const app = express();
const PORT = 8080;

// DEPENDENCIAS
const { percentage } = require('./utils/percentage') 
const { normalizr } = require('./utils/normalizrChat')

// MIDDLEWARE
app.use(express.json()); 
app.use(express.urlencoded({extended:true}))

// VIEWS
app.set('view engine', 'ejs'); //se define extensión (motor de plantilla)
app.use(express.static(__dirname + "/public"));

// DAOS
const { ProductoDaoArchivo } = require('./daos/productos/ProductosDaoArchivo');
let product = new ProductoDaoArchivo();

const { ChatDaoArchivo } = require('./daos/chat/ChatDaoArchivo');
const { log } = require('console');
let chat = new ChatDaoArchivo();


// WEB SOCKETS                
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

//Productos WEB SOCKET 
/*io.on('connection', async(socket) => {
    const prod = await product.getAll().then( (obj) =>{
        socket.emit('products', obj);
    })
    socket.on('new-products', async data => {
        const saveObj = await product.save(data);
        io.sockets.emit('products', await product.getAll());
    })
})*/
//chat WEB SOCKET 
io.on('connection', async (socket) => {
    //envío chat normalizado
    const text = await chat.getAll().then( (obj) =>{ 
        const dataContainer = { id: 1, mensajes: [] };
        dataContainer.mensajes = obj;
        const chatNormalizr = normalizr(dataContainer)
        console.log("Usuario conectado al Chat"); 
        socket.emit('text', chatNormalizr);
    })
    //guardo nuevo obj y envio % compresion
    socket.on('new-text', async data => {
        const saveObj = await chat.save(data);

        const dataContainer = { id: 1, mensajes: [] };
        dataContainer.mensajes = await chat.getAll();

        let dataNocomprimida = JSON.stringify(dataContainer).length;
        let dataNormalized = normalizr(dataContainer);
        let dataComprimida = JSON.stringify(dataNormalized).length;

        let compression = percentage(dataComprimida, dataNocomprimida);
        
        try {
            console.log("compression");
            console.log(compression);
            socket.emit("compression", compression);
          } catch (error) {
            console.log(error);
        }
        io.sockets.emit('text', chat.getAll());
    })
})

//*******************   ENDPOINTS   **********************

app.get('/', async (req, res) =>{
    const prod = await product.getAll().then( (obj) =>{
        obj.length  > 0 ?  res.render('pages/index', {listExists: true, listNotExists: false }) : res.render('pages/index', {listNotExists: true, listExists: false}) ;
    })  
})

//PRODUCTOS FAKER 
app.post('/productos-test', async (req, res, next) => {
    try {
        res.json(await product.popular(req.query.cant));
    } catch (error) {
        next(error);
    }
})

app.get('/productos-test', async (req, res, next) => {
    try {
        let products = product.getAll().then(obj => {
            res.json({allProducts: obj});       
        });   
    } catch (error) {
        next(error);
    }
})
//*******************************************************
 

//SERVIDOR
const server = httpServer.listen(PORT, () =>{
    console.log('Servidor escuchando en el puerto '+ server.address().port);
})
server.on('error', error => console.log('Error en el servidor ' + error))