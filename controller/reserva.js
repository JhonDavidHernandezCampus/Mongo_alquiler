import { Router } from "express";
import {conx} from './../db/db.js';
import {limit} from './../middleware/limit.js';
import { verify, DTOData } from "./../middleware/verifyData.js";
import { validateID } from "../middleware/validateID.js";

const router = Router();

const db = await conx();
const cliente = db.collection("cliente");
const reserva = db.collection("reserva");

// 5. Mostrar todas las reservas pendientes con los datos del cliente
// y el automóvil reservado.

router.get('/', limit(),async (req,res)=>{
    try {
        let result = await reserva.aggregate([
            {
                $lookup:{
                    from:'cliente',
                    localField:'ID_Cliente_id',
                    foreignField:'ID_Cliente',
                    as:'Cliente_FK'
                }
            },
            {
                $lookup:{
                    from:'automovil',
                    localField:'ID_Automovil_id',
                    foreignField:'ID_Automovil',
                    as:'Automovil_FK'
                }
            },
            {
                $unwind: "$Cliente_FK"
            },
            {
                $unwind: "$Automovil_FK"
            },
            {
                $match:{Estado:"Pendiente"}
            }
        ]).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({error:error});
    }
});

// 13.Listar las reservas pendientes realizadas por un cliente
// específico.
// http://127.121.12.10:9110/Reserva/pendientes/1

router.get('/pendientes/:id', limit(), verify, validateID,async(req,res)=>{
    try {
        let id = parseInt(req.params.id);
        let result = await reserva.aggregate([
            {
                $lookup: {
                    from: "cliente",
                    localField: "ID_Cliente",
                    foreignField: "ID_Cliente_id",
                    as: "FK_cliente"
                }
            },
            {
                $unwind: "$FK_cliente"
            },
            {
                $match:{
                    $and:[
                        {"FK_cliente.ID_Cliente":id},
                        {"Estado":"Pendiente"}
                    ]
                }
            },
            {
                $project: {
                    "FK_cliente._id":0
                }
            }
        ]).toArray();

        res.send(result);
    } catch (error) {
        res.status(500).send({error:error});
        
    }
});



export default router;
