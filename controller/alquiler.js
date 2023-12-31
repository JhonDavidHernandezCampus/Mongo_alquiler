import { Router } from "express";
import {conx} from './../db/db.js';
import {limit} from './../middleware/limit.js';
import {validateID} from './../middleware/validateID.js';
import { verify, DTOData } from "./../middleware/verifyData.js";


const router = Router();

const db = await conx();
const cliente = db.collection("cliente");
const alquiler = db.collection("alquiler");

// 4. Listar todos los alquileres activos junto con los datos de los 
// clientes relacionados. 
router.get('/', limit(),verify ,async(req,res)=>{
    try {
        let result = await cliente.aggregate([
            {
                $lookup:{
                    from:"alquiler",
                    localField:"ID_Cliente",
                    foreignField:"ID_Alquiler",
                    as: "Alquiler_FK"
                }
            },
            {
                $project:{
                    "Alquiler_FK._id":0,
                    "Alquiler_FK.ID_Cliente":0,
                    "Alquiler_FK.ID_Alquiler":0,
                    "Alquiler_FK.ID_Automovil":0
                }
            },
            {
                $unwind: "$Alquiler_FK"
            },
            {
                $match:{
                    "Alquiler_FK.Estado":{$eq: "Libre"}
                }
            }
        ]).toArray();

        res.send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

// 6. Obtener los detalles del alquiler con el ID_Alquiler específico. 
router.get('/uno/:id',limit(), validateID ,verify,async(req,res,next)=>{
    let id = parseInt(req.params.id);
    try {
        let result = await alquiler.find({ ID_Alquiler:id }).toArray();
        res.send(result);
    } catch (error) {
        res.status(404).send({error:error});
    }
});

// 9. Obtener el costo total de un alquiler específico. 
router.get('/costo/:id', limit(), verify, validateID, async(req,res)=>{
    try {
        let result = await alquiler.aggregate([
            {
                $lookup:{
                    from:"automovil",
                    localField:"ID_Automovil",
                    foreignField:"ID_Automovil",
                    as:"FK_Automovil"
                }
            },
            {
                $unwind: "$FK_Automovil"
            },
            {
                $match: {ID_Alquiler:1}
            },
            {
                $project: {
                    _id: 1,
                    Costo_Total: 1,
                    Estado: 1,
                    Modelo:"$FK_Automovil.Modelo"
                }
            }
        ]).toArray();
        res.send(result);
    } catch (error) {
        res.status(404).send({error:error});
        
    }

});

// 12.Obtener los detalles del alquiler que tiene fecha de inicio en
// '2023-07-05'.
router.get('/fecha',limit(),verify,async(req,res)=>{
    try {
        let fecha = new Date("2023-07-05");
        console.log(fecha);
        let result = await alquiler.aggregate([
            {
                $lookup: {
                    from: "automovil",
                    localField: "ID_Automovil",
                    foreignField: "ID_Automovil",
                    as: "FK_Automovil"
                }
            },
            {
                $lookup: {
                    from: "cliente",
                    localField: "ID_Cliente",
                    foreignField: "ID_Cliente",
                    as: "FK_Cliente"
                }
            },
            {
                $unwind: "$FK_Automovil"
            },
            {
                $unwind: "$FK_Cliente"
            },
            {
                $match:{Fecha_Inicio:fecha}
            }
        ]).toArray();
        res.send(result);
    } catch (error) {
        res.status(404).send({error:error});
    }
});

// 18.Obtener la cantidad total de alquileres registrados en la base de
// datos.
router.get('/total', limit(), verify, async(req,res)=>{
    try {
        let result  = await alquiler.countDocuments();
        res.send({"Cantidad_Alquileres":result});
    } catch (error) {
        res.status(404).send({error:error});
    }
});

// 21.Listar los alquileres con fecha de inicio entre '2023-07-05' y
// '2023-07-10'.
router.get('/intervalo',limit(),verify, async( req,res)=>{
    try {
        let result = await alquiler.find({
            $and:[
                {Fecha_Inicio: {$gte:new Date('2023-07-05')}},
                {Fecha_Fin : {$lte:new Date('2023-07-10')}}
            ]
        }).toArray();
        res.send(result);
    } catch (error) {
        res.status(404).send({error:error});
    }
});

export default router;