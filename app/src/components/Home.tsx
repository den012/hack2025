import React, { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './GoogleAuth/Config';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';

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

const guestUser = {
    uid: 'guest',
    displayName: 'Guest',
    email: null,
    photoURL: 'https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg',
} as User;

// Helper function to calculate distance between two coordinates (Haversine formula)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};


const Home: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
    const [showAllShelters, setShowAllShelters] = useState(false); // State for showing all shelters

    const navigate = useNavigate();
    const location = useLocation();
    const API_URL = import.meta.env.VITE_API_URL;

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    // --- Authentication Effect ---
    useEffect(() => {
        const isGuest = location.state?.isGuest;
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) setUser(currentUser);
            else if (isGuest) setUser(guestUser);
            else navigate('/');
        });
        return () => unsubscribe();
    }, [navigate, location.state]);

    // --- Get User Location & Initialize Map ---
    useEffect(() => {
        if (!user || !mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
                setUserLocation(coords);
                map.setView([coords.lat, coords.lon], 15);
            },
            () => {
                const defaultLocation = { lat: 46.7712, lon: 23.6236 };
                setUserLocation(defaultLocation);
                map.setView([defaultLocation.lat, defaultLocation.lon], 13);
            }
        );

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [user]);

    // --- Fetch, Calculate Distance, and Sort Shelters ---
    useEffect(() => {
        if (!userLocation) return;

        const fetchShelters = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/getBunkers`, {
                    params: { lat: userLocation.lat, lon: userLocation.lon, range: 0.5 }
                });

                if (Array.isArray(response.data)) {
                    const sheltersWithDistance = response.data.map((shelter: Shelter) => ({
                        ...shelter,
                        distance: getDistance(userLocation.lat, userLocation.lon, shelter.lat, shelter.lon)
                    }));

                    sheltersWithDistance.sort((a: Shelter, b: Shelter) => a.distance! - b.distance!);

                    setShelters(sheltersWithDistance);
                } else {
                    console.warn("API did not return an array for shelters:", response.data);
                    setShelters([]); 
                }
            } catch (error) {
                console.error("Error fetching shelters:", error);
                setShelters([]); 
            }
        };

        fetchShelters();
    }, [userLocation, API_URL]);

    // --- Render Markers on Map ---
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (userLocation && !userMarkerRef.current) {
            const userIcon = L.divIcon({
                className: 'custom-user-marker',
                html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [24, 24], iconAnchor: [12, 12],
            });
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        }

        if (shelters.length > 0) {
            if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);

            clusterGroupRef.current = L.markerClusterGroup();
            const shelterIcon = L.divIcon({
                className: 'custom-bunker-marker',
                html: `<div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4v-4a8 8 0 0 1 16 0v4z"/><rect x="10" y="14" width="4" height="6" fill="#991b1b" stroke="none"/></svg></div>`,
                iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
            });

            shelters.forEach(shelter => {
                const marker = L.marker([shelter.lat, shelter.lon], { icon: shelterIcon });
                marker.bindPopup(`<b>${shelter.adresa}</b><br>${shelter.localitate}, ${shelter.judet}`);
                marker.on('click', () => setSelectedShelter(shelter));
                clusterGroupRef.current?.addLayer(marker);
            });

            map.addLayer(clusterGroupRef.current);
        }
    }, [userLocation, shelters]);

    // --- Handle Route Calculation ---
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        if (selectedShelter && userLocation) {
            routingControlRef.current = L.Routing.control({
                waypoints: [
                    L.latLng(userLocation.lat, userLocation.lon),
                    L.latLng(selectedShelter.lat, selectedShelter.lon)
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                show: false,
                // @ts-ignore - The type definition is missing this valid option
                createMarker: () => null,
                lineOptions: {
                    styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }],
                    extendToWaypoints: false,
                    missingRouteTolerance: 0
                }
            }).addTo(map);
        }
    }, [selectedShelter, userLocation]);

    const sheltersToShow = showAllShelters ? shelters : shelters.slice(0, 5);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="p-3 bg-gray-100 border-b border-gray-300 flex items-center z-10">
                {user.photoURL && (
                    <img
                        src={user.photoURL}
                        alt="Profile"
                        className="rounded-full w-10 h-10 mr-3"
                    />
                )}

                <div>
                    <strong>Welcome, {user.displayName}!</strong>
                    {user.email && (
                        <p className="m-0 text-xs text-gray-600">{user.email}</p>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-72 overflow-y-auto border-r border-gray-300 bg-white z-10">
                    <h2 className="px-4 py-3 m-0 border-b border-gray-300 text-lg font-semibold">
                        Nearby Shelters
                    </h2>

                    {shelters.length > 0 ? (
                        <ul className="list-none m-0 p-0">
                            {sheltersToShow.map((shelter, index) => (
                                <li
                                    key={index}
                                    onClick={() => setSelectedShelter(shelter)}
                                    className={`px-4 py-3 cursor-pointer border-b border-gray-200 ${selectedShelter === shelter ? 'bg-indigo-50' : 'bg-transparent'}`}
                                >
                                    <strong className="block text-sm">{shelter.adresa}</strong>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{shelter.localitate}, {shelter.judet}</span>
                                        {shelter.distance && <span>{shelter.distance.toFixed(2)} km</span>}
                                    </div>
                                </li>
                            ))}
                            {!showAllShelters && shelters.length > 5 && (
                                <li className="text-center p-3">
                                    <button onClick={() => setShowAllShelters(true)} className="text-sm text-indigo-600 hover:underline">
                                        Show More
                                    </button>
                                </li>
                            )}
                        </ul>
                    ) : (
                        <p className="p-4 text-gray-600">No shelters found nearby.</p>
                    )}
                </aside>

                <main className="flex-1 relative">
                    <div ref={mapContainerRef} className="w-full h-full z-5" />
                </main>
            </div>
        </div>

    );
}

export default Home;