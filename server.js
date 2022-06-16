//EXPRESS
const express = require('express')
const app = express();

//ROUTES
const productsRoutes = require('./src/routes/productsRoutes');
const cartRoutes = require('./src/routes/carritoRoutes');

// DAOS
const { ProductoDaoArchivo } = require('./src/daos/productos/ProductosDaoArchivo');
let product = new ProductoDaoArchivo();

// VIEWS
app.set('view engine', 'ejs'); //se define extension (motor de plantilla)
app.use(express.static(__dirname + "/public"));
app.use(express.json()); //tiene q estar para qe se llene el req body
const urlencodedParser = app.use(express.urlencoded({extended:true}))

// WEB SOCKETS
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);


//chat
io.on('connection', async (socket) => {
    const text = await chat.getAll(knexSqLite).then( (obj) =>{  
        socket.emit('text', obj);
    })
    socket.on('new-text', async data => {
        const saveObj = await chat.save(knexSqLite,data);
        io.sockets.emit('text', chat.getAll(knexSqLite));
    })
})


app.use('/api', productsRoutes);
// app.use('/api/carrito', cartRoutes);
app.get('*', function (req,res) {
    res.status(404).send({
        status: "error",
        data: "404: Page not found",
        error: -2,
        description: "Ruta "+ req.baseUrl + req.path +" no implementada"
    });
});

////////////////////////////////////////////////

const server = app.listen(8080, () => {
    console.log('La aplicacion esta escuchando');
})
