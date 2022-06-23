//EXPRESS
const express = require('express')
const app = express();

// ROUTES
const  httpServer  = require('./src/routes/productsRoutes');
// const cartRoutes = require('./src/routes/carritoRoutes');

// VIEWS
app.set('views', __dirname + '/src/views');
app.set('view engine', 'ejs'); //se define extension (motor de plantilla)
app.use(express.static( __dirname + "/src/public")); // Archivos estaticos

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ENDPOINTS
app.use('/api', httpServer.app );
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

const server = httpServer.httpServer.listen(8080, () => {
    console.log('La aplicacion esta escuchando' );
})
httpServer.httpServer.on("Error", (error) => console.log("error en servidor ${error}"));
