import { useState, useEffect } from 'react';

interface Coordinate {
    lat: number;
    lon: number;
}

export const useGeolocation = () => {
    const [location, setLocation] = useState<Coordinate | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
            },
            () => {
                // default location if user declines permision
                setLocation({ lat: 46.7712, lon: 23.6236 });
            }
        );
    }, []);

    return location;
};