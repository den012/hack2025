// import { useState, useEffect, useRef } from 'react';

// interface Coordinate {
//     lat: number;
//     lon: number;
// }


// const DEMO_MODE = false; 
// const MOCK_START_LOCATION: Coordinate = { lat: 46.7703, lon: 23.5903 }; 
// const MOCK_SPEED = 0.002;

// export const useGeolocation = () => {
//     const [location, setLocation] = useState<Coordinate | null>(null);
//     const [error, setError] = useState<string | null>(null);

//     const lastUpdateTimeRef = useRef<number>(0);
//     const UPDATE_INTERVAL = 1000;

//     useEffect(() => {
//         if(DEMO_MODE) {
//             // Set the initial location for the demo
//             if (!location) {
//                 setLocation(MOCK_START_LOCATION);
//             }

//             // Start an interval to simulate movement
//             const intervalId = setInterval(() => {
//                 setLocation(prevLocation => {
//                     if (!prevLocation) return MOCK_START_LOCATION;
//                     // Simulate movement (e.g., moving northeast)
//                     return {
//                         lat: prevLocation.lat + MOCK_SPEED,
//                         lon: prevLocation.lon + MOCK_SPEED,
//                     };
//                 });
//             }, UPDATE_INTERVAL);

//             // Cleanup function to stop the timer when the component unmounts
//             return () => clearInterval(intervalId);
//         }
//         if (!navigator.geolocation) {
//             setError('Geolocation is not supported by your browser.');
//             return;
//         }

//         const watcherId = navigator.geolocation.watchPosition(
//             (position) => {
//                 const now = Date.now();
                
//                 //after 2 seconds update
//                 if (now - lastUpdateTimeRef.current > UPDATE_INTERVAL) {
//                     setLocation({
//                         lat: position.coords.latitude,
//                         lon: position.coords.longitude,
//                     });
//                     console.log('Updated location:', position.coords.latitude, position.coords.longitude);
//                     setError(null);
//                     // Update the ref with the current time
//                     lastUpdateTimeRef.current = now;
//                 }
//             },
//             (err) => {
//                 setError(err.message);
//             },
//             {
//                 enableHighAccuracy: true,
//                 timeout: 5000,
//                 maximumAge: 0,
//             }
//         );

//         return () => {
//             navigator.geolocation.clearWatch(watcherId);
//         };
//     }, []);

//     return location;
// };


import { useState, useEffect, useRef } from 'react';

interface Coordinate {
    lat: number;
    lon: number;
}


const MOCK_START_LOCATION: Coordinate = { lat: 46.7703, lon: 23.5903 }; 
const MOCK_SPEED = 0.00005; // Reduced speed for a more realistic simulation

export const useGeolocation = (isDemoMode: boolean) => {
    const [location, setLocation] = useState<Coordinate | null>(null);
    const [error, setError] = useState<string | null>(null);

    const lastUpdateTimeRef = useRef<number>(0);
    const UPDATE_INTERVAL = 1000;

    useEffect(() => {
        // Clear previous state when mode changes
        setLocation(null);
        setError(null);

        if(isDemoMode) {
            // Set the initial location for the demo
            setLocation(MOCK_START_LOCATION);

            // Start an interval to simulate movement
            const intervalId = setInterval(() => {
                setLocation(prevLocation => {
                    if (!prevLocation) return MOCK_START_LOCATION;
                    // Simulate movement (e.g., moving northeast)
                    return {
                        lat: prevLocation.lat + MOCK_SPEED,
                        lon: prevLocation.lon + MOCK_SPEED,
                    };
                });
            }, UPDATE_INTERVAL);

            // Cleanup function to stop the timer when the component unmounts or mode changes
            return () => clearInterval(intervalId);
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        const watcherId = navigator.geolocation.watchPosition(
            (position) => {
                const now = Date.now();
                
                //after 1 second update
                if (now - lastUpdateTimeRef.current > UPDATE_INTERVAL) {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                    console.log('Updated location:', position.coords.latitude, position.coords.longitude);
                    setError(null);
                    // Update the ref with the current time
                    lastUpdateTimeRef.current = now;
                }
            },
            (err) => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watcherId);
        };
    }, [isDemoMode]); // Re-run the effect when isDemoMode changes

    return { location, error };
};