import { Request, Response } from 'express';
// The path is relative to the controllers directory
import fs from 'fs/promises';
import path from 'path';
import bunkersData from '../../bunkers.json';


const countsFilePath = path.join(__dirname, '../../bunkersCount.json');
interface Bunker {
    judet: string;
    localitate: string;
    adresa: string;
    lat: number;
    lon: number;
    viewCount?: number;
}

interface ViewCounts {
    [address: string]: number;
}

const readCounts = async (): Promise<ViewCounts> => {
    try {
        await fs.access(countsFilePath); // Check if file exists
        const data = await fs.readFile(countsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is corrupt, return empty object
        return {};
    }
};

const writeCounts = async (counts: ViewCounts): Promise<void> => {
    try {
        await fs.writeFile(countsFilePath, JSON.stringify(counts, null, 2));
    } catch (error) {
        console.error('Error writing to counts file:', error);
    }
};


export const getBunkers = async (req: Request, res: Response) => {
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

        const bunkerViewCounts = await readCounts();

        const foundBunkers = (bunkersData as Bunker[]).filter(bunker => {
            const latInRange = bunker.lat >= (userLat - searchRange) && bunker.lat <= (userLat + searchRange);
            const lonInRange = bunker.lon >= (userLon - searchRange) && bunker.lon <= (userLon + searchRange);
            return latInRange && lonInRange;
        });

        const bunkersWithCounts = foundBunkers.map(bunker => ({
            ...bunker,
            viewCount: bunkerViewCounts[bunker.adresa] || 0
        }));

        res.status(200).json(bunkersWithCounts);

    } catch (error) {
        console.error("Error getting bunkers:", error);
        res.status(500).json({ message: 'Server error while retrieving bunkers.' });
    }
};


export const trackBunkerView = async (req: Request, res: Response) => {
    const { adresa } = req.body;

    if(!adresa) {
        return res.status(400).json({ message : 'Bunker adresa is required in the req body'});
    }

    //fire and forget
    (async () => {
        const counts = await readCounts();
        counts[adresa] = (counts[adresa] || 0) + 1;
        await writeCounts(counts);
    })();

    res.status(200).json({ message : 'View tracked successfully'});
}