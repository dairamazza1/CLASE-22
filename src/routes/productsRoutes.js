const express = require('express');
const { Router } = express;
const productRouter = Router();

// WEB SOCKETS
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

// DAOS
const { ProductoDaoArchivo } = require('../daos/productos/ProductosDaoArchivo');
let product = new ProductoDaoArchivo();

// const { ProductoDaoFirebase } = require('../daos/productos/ProductosDaoFirebase');
// let product = new ProductoDaoFirebase();

// const { ProductoDaoMongoDB } = require('../daos/productos/ProductosDaoMongoDB');
// let product = new ProductoDaoMongoDB();

//**************** TEST PRODUCTOS FAKER ****************
productRouter.post('/productos-test', async (req, res, next) => {
    try {
        res.json(await product.popular(req.query.cant));
    } catch (error) {
        next(error);
    }
})

productRouter.get('/productos-test', async (req, res, next) => {
    try {
        let products = product.getAll().then(obj => {
            res.json({allProducts: obj});       
        });   
    } catch (error) {
        next(error);
    }
})
//*******************************************************
productRouter.post('/', async (req, res) => {
    let products = req.body;
    
    if (products && products.name && products.thumbnail && products.price ) {
        prod = await product.save( products.name, products.price , products.thumbnail ).then(obj =>{
            res.json({result: 'Producto cargardo', producto: obj});
        });
       
    } else {
        res.json({result: 'No fue posible cargar el producto'});
    }
});
productRouter.get('/', (req, res) => {
    // let products = product.getAll().then(obj => {
    //     res.json({allProducts: obj});       
    // }); 
    
    listExists = false;
    listNotExists = false;
    
    const prod = product.getAll().then( (obj) =>{
        obj.length  > 0 ?  res.render('pages/index', {listExists: true }) : res.render('pages/index', {listNotExists: true}) ;
    }) 
});
productRouter.get("/:id", (req, res) => {
    let id = isNaN(req.params.id) ? req.params.id : parseInt(req.params.id) ;
    let products = product.getProdById(id).then(obj => {
        res.json(obj);       
    });
});
productRouter.put('/:id', (req,resp) => {
    let id = isNaN(req.params.id) ? req.params.id : parseInt(req.params.id) ;
    try{
        const prodAux = product.updateByID(id,req.body).then( () =>{
            let aux = product.getProdById(id).then( result =>{
                resp.json({result}); 
            })
        })
    }catch(err){
        resp.send('No se puede actualizar el producto')
    }   
}) 
productRouter.delete('/:id', (req,resp) => {
    let id = isNaN(req.params.id) ? req.params.id : parseInt(req.params.id) ;
    try{    
        const prodAux = product.deleteById(id);
        resp.send('Producto eliminado con exito')
    }catch(err){
        resp.send('No se encontró el producto')
    }   
}) 

//Productos WEB SOCKET 
io.on('connection', async(socket) => {
    const prod = await product.getAll().then( (obj) =>{
        socket.emit('products', obj);
    })

    socket.on('new-products', async data => {
        const saveObj = await product.save(data);
        io.sockets.emit('products', await product.getAll());
    })
})

module.exports = productRouter;