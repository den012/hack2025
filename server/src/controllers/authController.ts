import { Request, Response } from 'express';
import db  from '../database/database';

export const saveUser = async (req: Request, res: Response) => {
    const {uid, name, email, photo} = req.body;

    let userCount = 0;

    try {
        await db.query(
            'INSERT INTO users (id, name, email, photo) VALUES (?, ?, ?, ?)',
            [uid, name, email, photo]
        );
        userCount++;
        console.log('User saved successfully');
        console.log(`Total users saved: ${userCount}`);
        res.status(201).json({ message: 'User saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save user', error });
    }
}