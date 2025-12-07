// import React, { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet.markercluster';
// import 'leaflet-routing-machine';
// import { get, set } from 'idb-keyval';


// // Define types
// interface Coordinate { lat: number; lon: number; }
// interface Shelter {
//     judet: string;
//     localitate: string;
//     adresa: string;
//     lat: number;
//     lon: number;
//     distance?: number;
//     viewCount?: number;
// }

// interface MapComponentProps {
//     userLocation: Coordinate | null;
//     shelters: Shelter[];
//     selectedShelter: Shelter | null;
//     onShelterSelect: (shelter: Shelter) => void;
// }

// const getDistance = (from: Coordinate, to: Coordinate) => {
//     const R = 6371e3; // Earth's radius in metres
//     const φ1 = from.lat * Math.PI / 180;
//     const φ2 = to.lat * Math.PI / 180;
//     const Δφ = (to.lat - from.lat) * Math.PI / 180;
//     const Δλ = (to.lon - from.lon) * Math.PI / 180;

//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c; // in metres
// };

// export const MapComponent: React.FC<MapComponentProps> = ({ userLocation, shelters, selectedShelter, onShelterSelect }) => {
//     const OSRM_URL = import.meta.env.VITE_OSRM_URL;


//     const mapContainerRef = useRef<HTMLDivElement>(null);
//     const mapInstanceRef = useRef<L.Map | null>(null);
//     const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
//     const userMarkerRef = useRef<L.Marker | null>(null);
//     const routingControlRef = useRef<L.Routing.Control | L.Polyline | null>(null);

//     const lastPrefetchLocationRef = useRef<Coordinate | null>(null);

//     const [isOnline, setIsOnline] = useState(navigator.onLine);

//     const [isFollowingUser, setIsFollowingUser] = useState(false);

//     // Listen for online/offline status changes
//     useEffect(() => {
//         const handleOnline = () => setIsOnline(true);
//         const handleOffline = () => setIsOnline(false);
//         window.addEventListener('online', handleOnline);
//         window.addEventListener('offline', handleOffline);
//         return () => {
//             window.removeEventListener('online', handleOnline);
//             window.removeEventListener('offline', handleOffline);
//         };
//     }, []);

//     // Effect 1: Initialize map instance (runs only once)
//     useEffect(() => {
//         if (!mapContainerRef.current || mapInstanceRef.current) {
//             return;
//         }

//         // Initialize the map.
//         const map = L.map(mapContainerRef.current, {
//             zoomControl: true
//         }).setView([46.7712, 23.6236], 13);

//         //Humanitarian (HOT) tile layer
//         L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">H.O.T.</a>',
//             maxZoom: 19
//         }).addTo(map);

//         map.on('dragstart', () => {
//             setIsFollowingUser(false);
//         });

//         mapInstanceRef.current = map;

//         return () => {
//             if (mapInstanceRef.current) {
//                 mapInstanceRef.current.remove();
//                 mapInstanceRef.current = null;
//             }
//         };
//     }, []);


//     // Effect 2: Update map view and user marker when location changes
//     useEffect(() => {
//         const map = mapInstanceRef.current;
//         if (!map || !userLocation) return;

//         // map.setView([userLocation.lat, userLocation.lon], 15);

//         const userIcon = L.divIcon({
//             className: 'custom-user-marker',
//             html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0,0,0,0.3);"></div>`,
//             iconSize: [24, 24], iconAnchor: [12, 12]
//         });

//         if (!userMarkerRef.current) {
//             //create marker
//             userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

//             //fly to user location
//             map.flyTo([userLocation.lat, userLocation.lon], 16, { animate: true });
//         } else {
//             const oldLatLng = userMarkerRef.current.getLatLng();
//             if (oldLatLng.lat !== userLocation.lat || oldLatLng.lng !== userLocation.lon) {
//                 userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);

//                 if (isFollowingUser) {
//                     map.panTo([userLocation.lat, userLocation.lon], { animate: true });
//                 }
//             }
//         }
//     }, [userLocation, isFollowingUser]);

//     // Effect 3: Render shelter markers
//     useEffect(() => {
//         const map = mapInstanceRef.current;
//         if (!map) return;
//         if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);

//         clusterGroupRef.current = L.markerClusterGroup();
//         const shelterIcon = L.divIcon({
//             className: 'custom-bunker-marker',
//             html: `<div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4v-4a8 8 0 0 1 16 0v4z"/><rect x="10" y="14" width="4" height="6" fill="#991b1b" stroke="none"/></svg></div>`,
//             iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
//         });

//         shelters.forEach(shelter => {
//             const marker = L.marker([shelter.lat, shelter.lon], { icon: shelterIcon });
//             marker.bindPopup(`<b>${shelter.adresa}</b><br>${shelter.localitate}, ${shelter.judet}${shelter.viewCount ? `<br>Views: ${shelter.viewCount}` : ''}`);
//             marker.on('click', () => onShelterSelect(shelter));
//             clusterGroupRef.current?.addLayer(marker);
//         });
//         map.addLayer(clusterGroupRef.current);
//     }, [shelters, onShelterSelect]);

//     // Effect 4: Pre-fetch and cache routes for the 2 closest shelters
//     useEffect(() => {
//         if (!isOnline || !userLocation || shelters.length < 1) return;

//         const PREFETCHED_DISTANCE_THRESHOLD = 200;

//         if(lastPrefetchLocationRef.current) {
//             const distanceMoved = getDistance(lastPrefetchLocationRef.current, userLocation);
//             if(distanceMoved < PREFETCHED_DISTANCE_THRESHOLD) {
//                 return; // Skip prefetching if user hasn't moved enough
//             }
//         }

//         lastPrefetchLocationRef.current = userLocation;
//         console.log("user moved prefetching routes...");

//         const twoClosestShelters = shelters.slice(0, 2);

//         const router = L.Routing.osrmv1({
//             serviceUrl: `${OSRM_URL}/route/v1`,
//             profile: 'foot'
//         });

//         twoClosestShelters.forEach(shelter => {
//             const waypoints = [{ latLng: L.latLng(userLocation.lat, userLocation.lon) }, { latLng: L.latLng(shelter.lat, shelter.lon) }];

//             // Check IndexedDB first
//             get(shelter.adresa).then(cachedRoute => {
//                 if (!cachedRoute) { // Only fetch if not already in DB
//                     router.route(waypoints, (routes: any) => {
//                         if (routes && routes.length > 0) {
//                             // Store the route coordinates in IndexedDB
//                             set(shelter.adresa, routes[0].coordinates);
//                             console.log(`Route saved to IndexedDB for: ${shelter.adresa}`);
//                         }
//                     });
//                 }
//             });
//         });
//     }, [isOnline, userLocation, shelters]);

//     // Effect 5: Handle route calculation and display (online vs. offline)
//     useEffect(() => {
//         const map = mapInstanceRef.current;
//         if (!map) return;

//         if (routingControlRef.current) {
//             if (routingControlRef.current instanceof L.Polyline) {
//                 map.removeLayer(routingControlRef.current);
//             } else {
//                 map.removeControl(routingControlRef.current);
//             }
//             routingControlRef.current = null;
//         }

//         if (!selectedShelter || !userLocation) {
//             setIsFollowingUser(false);
//             return;
//         }

//         setIsFollowingUser(true);
//         map.flyTo([userLocation.lat, userLocation.lon], 19, { animate: true });

//         // if (isOnline) {
//         //     routingControlRef.current = L.Routing.control({
//         //         waypoints: [L.latLng(userLocation.lat, userLocation.lon), L.latLng(selectedShelter.lat, selectedShelter.lon)],
//         //         router: new (CustomOSMRRouter as any)({ serviceUrl: `https://996a78555aed.ngrok-free.app/route/v1`, profile: 'foot' }),
//         //         show: false, addWaypoints: false,
//         //         // @ts-ignore
//         //         createMarker: () => null,
//         //         lineOptions: {
//         //             styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6, dashArray: '1, 10' }],
//         //             extendToWaypoints: true,
//         //             missingRouteTolerance: 0
//         //         }
//         //     }).addTo(map);
//         // } 
//         if (isOnline) {
//             routingControlRef.current = L.Routing.control({
//                 waypoints: [L.latLng(userLocation.lat, userLocation.lon), L.latLng(selectedShelter.lat, selectedShelter.lon)],
//                 router: L.Routing.osrmv1({
//                     serviceUrl: `${OSRM_URL}/route/v1`,
//                     profile: 'foot'
//                 }),
//                 show: false, addWaypoints: false,
//                 // @ts-ignore
//                 createMarker: () => null,
//                 lineOptions: {
//                     styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6, dashArray: '1, 10' }],
//                     extendToWaypoints: true,
//                     missingRouteTolerance: 0
//                 }
//                 // --- FIX: Add event listeners to log success and error ---
//             }).on('routesfound', function(e) {
//                 console.log('Route found:', e.routes[0]);
//             }).on('routingerror', function(e) {
//                 console.error('Routing control error:', e.error);
//             }).addTo(map);
//         }
//         else {
//             // OFFLINE
//             get(selectedShelter.adresa).then(cachedRoute => {
//                 if (cachedRoute) {
//                     console.log(`Using cached route from IndexedDB for: ${selectedShelter.adresa}`);
//                     const polyline = L.polyline(cachedRoute, { color: '#3b82f6', opacity: 0.8, weight: 6 });
//                     routingControlRef.current = polyline;
//                     map.addLayer(polyline);
//                 } else {
//                     console.warn("Offline: No cached route available for this shelter.");
//                 }
//             });
//         }
//     }, [selectedShelter, userLocation, isOnline]);

//     // return <div ref={mapContainerRef} className="w-full h-full z-5" />;

//     return (
//         <div style={{ position: 'relative', width: '100%', height: '100%' }}>
//             <div ref={mapContainerRef} className="w-full h-full z-5" />

//             {/* Recenter Button: Appears only when follow mode is off and a route is active */}
//             {!isFollowingUser && selectedShelter && (
//                 <button
//                     onClick={() => setIsFollowingUser(true)}
//                     className="absolute bottom-[30px] right-[15px] z-[1000] bg-white p-[10px] rounded-full border-2 border-[#ccc] shadow-md cursor-pointer"
//                     title="Recenter on me"
//                 >
//                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
//                 </button>
//             )}
//         </div>
//     );
// };




import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';
import { get, set } from 'idb-keyval';


// Define types
interface Coordinate { lat: number; lon: number; }
interface Shelter {
    judet: string;
    localitate: string;
    adresa: string;
    lat: number;
    lon: number;
    distance?: number;
    viewCount?: number;
}

interface MapComponentProps {
    userLocation: Coordinate | null;
    shelters: Shelter[];
    selectedShelter: Shelter | null;
    onShelterSelect: (shelter: Shelter) => void;
}

const getDistance = (from: Coordinate, to: Coordinate) => {
    const R = 6371e3; // Earth's radius in metres
    const φ1 = from.lat * Math.PI / 180;
    const φ2 = to.lat * Math.PI / 180;
    const Δφ = (to.lat - from.lat) * Math.PI / 180;
    const Δλ = (to.lon - from.lon) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

export const MapComponent: React.FC<MapComponentProps> = ({ userLocation, shelters, selectedShelter, onShelterSelect }) => {
    const OSRM_URL = import.meta.env.VITE_OSRM_URL;


    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const routingControlRef = useRef<L.Routing.Control | L.Polyline | null>(null);

    const lastPrefetchLocationRef = useRef<Coordinate | null>(null);

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const [isFollowingUser, setIsFollowingUser] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentInstruction, setCurrentInstruction] = useState<{ text: string; distance: number } | null>(null);

    // Listen for online/offline status changes
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Effect 1: Initialize map instance (runs only once)
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) {
            return;
        }

        // Initialize the map.
        const map = L.map(mapContainerRef.current, {
            zoomControl: true
        }).setView([46.7712, 23.6236], 13);

        //Humanitarian (HOT) tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">H.O.T.</a>',
            maxZoom: 19
        }).addTo(map);

        map.on('dragstart', () => {
            setIsFollowingUser(false);
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);


    // Effect 2: Update map view and user marker when location changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !userLocation) return;

        // map.setView([userLocation.lat, userLocation.lon], 15);

        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24], iconAnchor: [12, 12]
        });

        if (!userMarkerRef.current) {
            //create marker
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

            // Always fly to the user's location when the marker is first created.
            map.flyTo([userLocation.lat, userLocation.lon], 16, { animate: true });
        } else {
            const oldLatLng = userMarkerRef.current.getLatLng();
            if (oldLatLng.lat !== userLocation.lat || oldLatLng.lng !== userLocation.lon) {
                userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);

                if (isFollowingUser) {
                    map.panTo([userLocation.lat, userLocation.lon], { animate: true, duration: 1 });
                }
            }
        }
    }, [userLocation, isFollowingUser]);

    // Effect 3: Render shelter markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);

        clusterGroupRef.current = L.markerClusterGroup();
        const shelterIcon = L.divIcon({
            className: 'custom-bunker-marker',
            html: `<div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4v-4a8 8 0 0 1 16 0v4z"/><rect x="10" y="14" width="4" height="6" fill="#991b1b" stroke="none"/></svg></div>`,
            iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
        });

        shelters.forEach(shelter => {
            const marker = L.marker([shelter.lat, shelter.lon], { icon: shelterIcon });
            marker.bindPopup(`<b>${shelter.adresa}</b><br>${shelter.localitate}, ${shelter.judet}${shelter.viewCount ? `<br>Views: ${shelter.viewCount}` : ''}`);
            marker.on('click', () => onShelterSelect(shelter));
            clusterGroupRef.current?.addLayer(marker);
        });
        map.addLayer(clusterGroupRef.current);
    }, [shelters, onShelterSelect]);

    // Effect 4: Pre-fetch and cache routes for the 2 closest shelters
    useEffect(() => {
        if (!isOnline || !userLocation || shelters.length < 1) return;

        const PREFETCHED_DISTANCE_THRESHOLD = 200;

        if(lastPrefetchLocationRef.current) {
            const distanceMoved = getDistance(lastPrefetchLocationRef.current, userLocation);
            if(distanceMoved < PREFETCHED_DISTANCE_THRESHOLD) {
                return; // Skip prefetching if user hasn't moved enough
            }
        }

        lastPrefetchLocationRef.current = userLocation;
        console.log("user moved prefetching routes...");

        const twoClosestShelters = shelters.slice(0, 2);

        const router = L.Routing.osrmv1({
            serviceUrl: `${OSRM_URL}/route/v1`,
            profile: 'foot'
        });

        twoClosestShelters.forEach(shelter => {
            const waypoints = [{ latLng: L.latLng(userLocation.lat, userLocation.lon) }, { latLng: L.latLng(shelter.lat, shelter.lon) }];

            // Check IndexedDB first
            get(shelter.adresa).then(cachedRoute => {
                if (!cachedRoute) { // Only fetch if not already in DB
                    router.route(waypoints, (routes: any) => {
                        if (routes && routes.length > 0) {
                            // Store the route coordinates in IndexedDB
                            set(shelter.adresa, routes[0].coordinates);
                            console.log(`Route saved to IndexedDB for: ${shelter.adresa}`);
                        }
                    });
                }
            });
        });
    }, [isOnline, userLocation, shelters]);

    // Effect 5: Handle route calculation and display (online vs. offline)
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (routingControlRef.current) {
            if (routingControlRef.current instanceof L.Polyline) {
                map.removeLayer(routingControlRef.current);
            } else {
                map.removeControl(routingControlRef.current);
            }
            routingControlRef.current = null;
        }

        if(!selectedShelter) {
            setIsNavigating(false);
            setCurrentInstruction(null);
            return;
        }

        if (!selectedShelter || !userLocation) {
            setCurrentInstruction(null);
            setIsFollowingUser(false);
            return;
        }

        setIsFollowingUser(true);
        map.flyTo([userLocation.lat, userLocation.lon], 19, { animate: true });

        // if (isOnline) {
        //     routingControlRef.current = L.Routing.control({
        //         waypoints: [L.latLng(userLocation.lat, userLocation.lon), L.latLng(selectedShelter.lat, selectedShelter.lon)],
        //         router: new (CustomOSMRRouter as any)({ serviceUrl: `https://996a78555aed.ngrok-free.app/route/v1`, profile: 'foot' }),
        //         show: false, addWaypoints: false,
        //         // @ts-ignore
        //         createMarker: () => null,
        //         lineOptions: {
        //             styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6, dashArray: '1, 10' }],
        //             extendToWaypoints: true,
        //             missingRouteTolerance: 0
        //         }
        //     }).addTo(map);
        // } 
        if (isOnline) {
            routingControlRef.current = L.Routing.control({
                waypoints: [L.latLng(userLocation.lat, userLocation.lon), L.latLng(selectedShelter.lat, selectedShelter.lon)],
                router: L.Routing.osrmv1({
                    serviceUrl: `${OSRM_URL}/route/v1`,
                    profile: 'foot'
                }),
                show: false, addWaypoints: false,
                // @ts-ignore
                createMarker: () => null,
                lineOptions: {
                    styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6, dashArray: '1, 10' }],
                    extendToWaypoints: true,
                    missingRouteTolerance: 0
                }
            }).on('routesfound', function(e) {
                console.log('Route found:', e.routes[0]);
                const route = e.routes[0];

                if(route.instructions.length > 0) {
                    setCurrentInstruction({
                        text: route.instructions[0].text,
                        distance: route.instructions[0].distance
                    });
                }
            }).on('routingerror', function(e) {
                console.error('Routing control error:', e.error);
                setCurrentInstruction({ text: "Error finding route.", distance: 0 });
            }).addTo(map);
        }
        else {
            // OFFLINE
            get(selectedShelter.adresa).then(cachedRoute => {
                if (cachedRoute) {
                    console.log(`Using cached route from IndexedDB for: ${selectedShelter.adresa}`);
                    const polyline = L.polyline(cachedRoute, { color: '#3b82f6', opacity: 0.8, weight: 6 });
                    routingControlRef.current = polyline;
                    map.addLayer(polyline);
                } else {
                    console.warn("Offline: No cached route available for this shelter.");
                }
            });
        }
    }, [selectedShelter, userLocation, isOnline, isNavigating, OSRM_URL]);

    

    // return <div ref={mapContainerRef} className="w-full h-full z-5" />;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapContainerRef} className="w-full h-full z-5" />

            {/* Custom Navigation Instruction UI */}
            {isNavigating && currentInstruction && (
                <div className="absolute top-[15px] left-1/2 -translate-x-1/2 z-[1000] bg-white p-3 rounded-lg shadow-lg text-center max-w-[calc(100%-30px)]">
                    <p className="text-lg font-bold text-gray-800 m-0">{currentInstruction.text}</p>
                    {currentInstruction.distance > 0 && <p className="text-sm text-gray-600 m-0">in {Math.round(currentInstruction.distance)} meters</p>}
                </div>
            )}

            {/* Navigation Control Buttons */}
            {selectedShelter && !isNavigating && (
                <button
                    onClick={() => setIsNavigating(true)}
                    className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-[1000] bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg"
                >
                    Start Navigation
                </button>
            )}
            {isNavigating && (
                <button
                    onClick={() => setIsNavigating(false)}
                    className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-[1000] bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg"
                >
                    Stop Navigation
                </button>
            )}

            {/* Recenter Button: Appears only when follow mode is off */}
            {!isFollowingUser && (
                <button
                    onClick={() => {
                        setIsFollowingUser(true);
                        if (mapInstanceRef.current && userLocation) {
                            mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lon], 16);
                        }
                    }}
                    className="absolute bottom-[30px] right-[15px] z-[1000] bg-white p-[10px] rounded-full border-2 border-[#ccc] shadow-md cursor-pointer"
                    title="Recenter on me"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                </button>
            )}
        </div>
    );
};