import { Request, Response } from 'express';
// The path is relative to the controllers directory
import bunkersData from '../../bunkers.json';

interface Bunker {
    judet: string;
    localitate: string;
    adresa: string;
    lat: number;
    lon: number;
}

export const getBunkers = (req: Request, res: Response) => {
    const { lat, lon, range } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude (lat) and longitude (lon) query parameters are required.' });
    }

    try {
        const userLat = parseFloat(lat as string);
        const userLon = parseFloat(lon as string);
        //0.1 degrees = 11km.
        const searchRange = parseFloat(range as string) || 0.1;

        if (isNaN(userLat) || isNaN(userLon)) {
            return res.status(400).json({ message: 'Invalid latitude or longitude values.' });
        }

        const foundBunkers = (bunkersData as Bunker[]).filter(bunker => {
            const latInRange = bunker.lat >= (userLat - searchRange) && bunker.lat <= (userLat + searchRange);
            const lonInRange = bunker.lon >= (userLon - searchRange) && bunker.lon <= (userLon + searchRange);
            return latInRange && lonInRange;
        });

        res.status(200).json(foundBunkers);

    } catch (error) {
        console.error("Error getting bunkers:", error);
        res.status(500).json({ message: 'Server error while retrieving bunkers.' });
    }
};