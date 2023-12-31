    import 'reflect-metadata';
import { plainToClass, classToPlain } from 'class-transformer';
import { validate } from 'class-validator';
import { DTO } from './../controller/jwt.js';   
import { Router } from 'express';

const verify = Router();
const DTOData = Router();

verify.use((req,res,next)=>{
    if(!req.rateLimit) return;
    let clase = (req.baseUrl).slice(1);
    let { payload } = req.data;
    const {iat,exp, ...newpayload} = payload;
    payload = newpayload;
    let clone = JSON.stringify(classToPlain(plainToClass(DTO(clase).class,{},{ignoreDecorators:true})));
    let verify = clone === JSON.stringify(payload);
    req.data = undefined;
    (!verify)? res.status(406).send({status:406, message: "No autorizado para hacer este tramite"}) : next();
});

DTOData.use(async (req,res,next)=>{
    try {
        let clase = (req.baseUrl).slice(1);
        let data = plainToClass(DTO(clase).class, req.body);
        await validate(data);
        req.body = JSON.parse(JSON.stringify(data));
        //console.log(req.body);
        req.data = undefined;
        next();
    } catch (error) {
        res.status(error.status).send(error);
    }
});


export {
    verify,
    DTOData,
};

