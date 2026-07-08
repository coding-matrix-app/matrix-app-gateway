import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';


/**
 * Servicio responsable de validar tokens JWT firmados con el SEED del
 * proyecto. Centraliza esta lógica para que los middlewares no dependan
 * directamente de la librería `jsonwebtoken`.
 */
export class JwtService {

    /**
     * Valida un token JWT y retorna su payload decodificado.
     * Si la firma o el formato no son válidos, retorna `null`.
     */
    static validateToken(token: string) : Promise<string | jwt.JwtPayload | undefined | null> {
        return new Promise((resolve) => {
            jwt.verify(token, env.SEED_JWT, (err, decoded) => {
                if(err) return resolve(null);
                resolve(decoded)
            })
        })
    }
}
