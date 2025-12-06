import { useState, useEffect } from 'react';
import axios from 'axios';

interface Coordinate {
    lat: number;
    lon: number;
}

interface Shelter {
    judet: string;
    localitate: string;
    adresa: string;
    lat: number;
    lon: number;
    distance?: number;
}


const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

export const useShelters = (userLocation: Coordinate | null) => {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!userLocation) return;

        const fetchShelters = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/getBunkers`, {
                    params: { lat: userLocation.lat, lon: userLocation.lon, range: 0.5 },
                    headers: { "ngrok-skip-browser-warning": "true" }
                });

                let sheltersData: Shelter[] = [];
                if (Array.isArray(response.data)) {
                    sheltersData = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    sheltersData = [response.data];
                }

                if (sheltersData.length > 0) {
                    const sheltersWithDistance = sheltersData.map((shelter) => ({
                        ...shelter,
                        distance: getDistance(userLocation.lat, userLocation.lon, shelter.lat, shelter.lon)
                    }));
                    sheltersWithDistance.sort((a, b) => a.distance! - b.distance!);
                    setShelters(sheltersWithDistance);
                } else {
                    setShelters([]);
                }
            } catch (error) {
                console.error("Error fetching shelters:", error);
                setShelters([]);
            }
        };

        fetchShelters();
    }, [userLocation, API_URL]);

    return shelters;
};