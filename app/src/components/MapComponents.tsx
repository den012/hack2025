// import React, { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet.markercluster';
// import 'leaflet-routing-machine';

// // Define types
// interface Coordinate { lat: number; lon: number; }
// interface Shelter { judet: string; localitate: string; adresa: string; lat: number; lon: number; distance?: number; }

// interface MapComponentProps {
//     userLocation: Coordinate | null;
//     shelters: Shelter[];
//     selectedShelter: Shelter | null;
//     onShelterSelect: (shelter: Shelter) => void;
// }

// export const MapComponent: React.FC<MapComponentProps> = ({ userLocation, shelters, selectedShelter, onShelterSelect }) => {
//     const mapContainerRef = useRef<HTMLDivElement>(null);
//     const mapInstanceRef = useRef<L.Map | null>(null);
//     const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
//     const userMarkerRef = useRef<L.Marker | null>(null);
//     const routingControlRef = useRef<L.Routing.Control | null>(null);

//     const [isOnline, setIsOnline] = useState(navigator.onLine);
//     const cachedRoutesRef = useRef<Map<string, L.LatLng[]>>(new Map());

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


//     useEffect(() => {
//         if (!userLocation || !mapContainerRef.current) {
//             return;
//         }

//         // If the map hasn't been created yet, create it
//         if (!mapInstanceRef.current) {
//             const map = L.map(mapContainerRef.current);
//             mapInstanceRef.current = map;

//             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//                 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             }).addTo(map);
//         }

//         // Now, handle the view and marker (whether map is new or existing)
//         const map = mapInstanceRef.current;
//         map.setView([userLocation.lat, userLocation.lon], 15);

//         const userIcon = L.divIcon({
//             className: 'custom-user-marker',
//             html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0,0,0,0.3);"></div>`,
//             iconSize: [24, 24],
//             iconAnchor: [12, 12]
//         });

//         if (userMarkerRef.current) {
//             userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
//         } else {
//             userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
//         }

//     }, [userLocation]); // This effect now correctly handles both creation and updates

//     // Effect 2: Render shelter markers
//     useEffect(() => {
//         const map = mapInstanceRef.current;
//         if (!map) return; // Don't run if map isn't created yet

//         if (clusterGroupRef.current) {
//             map.removeLayer(clusterGroupRef.current);
//         }

//         clusterGroupRef.current = L.markerClusterGroup();
//         const shelterIcon = L.divIcon({
//             className: 'custom-bunker-marker',
//             html: `<div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4v-4a8 8 0 0 1 16 0v4z"/><rect x="10" y="14" width="4" height="6" fill="#991b1b" stroke="none"/></svg></div>`,
//             iconSize: [36, 36],
//             iconAnchor: [18, 36],
//             popupAnchor: [0, -36]
//         });

//         shelters.forEach(shelter => {
//             const marker = L.marker([shelter.lat, shelter.lon], { icon: shelterIcon });
//             marker.bindPopup(`<b>${shelter.adresa}</b><br>${shelter.localitate}, ${shelter.judet}`);
//             marker.on('click', () => onShelterSelect(shelter));
//             clusterGroupRef.current?.addLayer(marker);
//         });

//         map.addLayer(clusterGroupRef.current);

//     }, [shelters, onShelterSelect]);

//     // Effect 3: Handle route calculation
//     useEffect(() => {
//         const map = mapInstanceRef.current;
//         if (!map) return; // Don't run if map isn't created yet

//         if (routingControlRef.current) {
//             map.removeControl(routingControlRef.current);
//         }

//         if (selectedShelter && userLocation) {
//             routingControlRef.current = L.Routing.control({
//                 waypoints: [
//                     L.latLng(userLocation.lat, userLocation.lon),
//                     L.latLng(selectedShelter.lat, selectedShelter.lon)
//                 ],
//                 router: L.Routing.osrmv1({
//                     serviceUrl: `https://router.project-osrm.org/route/v1`,
//                     profile: 'foot'
//                 }),
//                 show: false,
//                 addWaypoints: false,
//                 // @ts-ignore
//                 createMarker: () => null,
//                 lineOptions: {
//                     styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }],
//                     extendToWaypoints: false,
//                     missingRouteTolerance: 0
//                 }
//             }).addTo(map);
//         }
//     }, [selectedShelter, userLocation]);

//     // Final cleanup effect to remove map on component unmount
//     useEffect(() => {
//         return () => {
//             if (mapInstanceRef.current) {
//                 mapInstanceRef.current.remove();
//                 mapInstanceRef.current = null;
//             }
//         };
//     }, []);

//     return <div ref={mapContainerRef} className="w-full h-full z-5" />;
// };


import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';
import {get, set} from 'idb-keyval';

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

export const MapComponent: React.FC<MapComponentProps> = ({ userLocation, shelters, selectedShelter, onShelterSelect }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const routingControlRef = useRef<L.Routing.Control | L.Polyline | null>(null);

    const [isOnline, setIsOnline] = useState(navigator.onLine);

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
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([46.7712, 23.6236], 7); // Default view
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
        // Cleanup function to remove the map on component unmount
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

        map.setView([userLocation.lat, userLocation.lon], 15);
        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24], iconAnchor: [12, 12]
        });

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
        } else {
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        }
    }, [userLocation]);

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
        const twoClosestShelters = shelters.slice(0, 2);
        const router = L.Routing.osrmv1({ serviceUrl: `https://router.project-osrm.org/route/v1`, profile: 'foot' });

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

        if (!selectedShelter || !userLocation) return;

        if (isOnline) {
            routingControlRef.current = L.Routing.control({
                waypoints: [L.latLng(userLocation.lat, userLocation.lon), L.latLng(selectedShelter.lat, selectedShelter.lon)],
                router: L.Routing.osrmv1({ serviceUrl: `https://router.project-osrm.org/route/v1`, profile: 'foot' }),
                show: false, addWaypoints: false,
                // @ts-ignore
                createMarker: () => null,
                lineOptions: {
                    styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }],
                    extendToWaypoints: false,
                    missingRouteTolerance: 0
                }
            }).addTo(map);
        } else {
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
    }, [selectedShelter, userLocation, isOnline]);

    return <div ref={mapContainerRef} className="w-full h-full z-5" />;
};