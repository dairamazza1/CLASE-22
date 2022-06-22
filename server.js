//EXPRESS
const express = require('express')
const app = express();
// VIEWS
app.set('views', './src/views');
app.set('view engine', 'ejs'); //se define extension (motor de plantilla)
app.use(express.static("./src/public")); // Archivos estaticos

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
const productsRoutes = require('./src/routes/productsRoutes');
const cartRoutes = require('./src/routes/carritoRoutes');

// ENDPOINTS
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
