import { Request, Response } from 'express';
import db  from '../database/database';
import { ResultSetHeader } from 'mysql2';

export const saveUser = async (req: Request, res: Response) => {
    const {uid, name, email, photo} = req.body;

    try {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT IGNORE INTO users (id, name, email, photo) VALUES (?, ?, ?, ?)',
            [uid, name, email, photo]
        );


        if (result.affectedRows > 0) {
            console.log('New user saved successfully:', name);
            res.status(201).json({ message: 'User created successfully' });
        } else {
            console.log('User already exists:', name);
            res.status(200).json({ message: 'User already exists' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to save user', error });
    }
}