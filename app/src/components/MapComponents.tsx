import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-routing-machine';

// Define types
interface Coordinate { lat: number; lon: number; }
interface Shelter { judet: string; localitate: string; adresa: string; lat: number; lon: number; distance?: number; }

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
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    // Effect 1: Create map and handle user marker
    useEffect(() => {
        // Don't do anything until we have a location and a container
        if (!userLocation || !mapContainerRef.current) {
            return;
        }

        // If the map hasn't been created yet, create it
        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([userLocation.lat, userLocation.lon], 15);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const userIcon = L.divIcon({
                className: 'custom-user-marker',
                html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        } else {
            // If map already exists, just update view and marker position
            mapInstanceRef.current.setView([userLocation.lat, userLocation.lon], 15);
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
            }
        }

    }, [userLocation]); // This effect now correctly depends on userLocation

    // Effect 2: Render shelter markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return; // Don't run if map isn't created yet

        if (clusterGroupRef.current) {
            map.removeLayer(clusterGroupRef.current);
        }

        clusterGroupRef.current = L.markerClusterGroup();
        const shelterIcon = L.divIcon({
            className: 'custom-bunker-marker',
            html: `<div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4v-4a8 8 0 0 1 16 0v4z"/><rect x="10" y="14" width="4" height="6" fill="#991b1b" stroke="none"/></svg></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        });

        shelters.forEach(shelter => {
            const marker = L.marker([shelter.lat, shelter.lon], { icon: shelterIcon });
            marker.bindPopup(`<b>${shelter.adresa}</b><br>${shelter.localitate}, ${shelter.judet}`);
            marker.on('click', () => onShelterSelect(shelter));
            clusterGroupRef.current?.addLayer(marker);
        });

        map.addLayer(clusterGroupRef.current);

    }, [shelters, onShelterSelect]);

    // Effect 3: Handle route calculation
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return; // Don't run if map isn't created yet

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        if (selectedShelter && userLocation) {
            routingControlRef.current = L.Routing.control({
                waypoints: [
                    L.latLng(userLocation.lat, userLocation.lon),
                    L.latLng(selectedShelter.lat, selectedShelter.lon)
                ],
                router: L.Routing.osrmv1({
                    serviceUrl: `https://router.project-osrm.org/route/v1`,
                    profile: 'foot'
                }),
                show: false,
                addWaypoints: false,
                // @ts-ignore - Type definition is missing this valid option
                createMarker: () => null,
                lineOptions: {
                    styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }],
                    extendToWaypoints: false,
                    missingRouteTolerance: 0
                }
            }).addTo(map);
        }
    }, [selectedShelter, userLocation]);

    // Cleanup effect to remove map on component unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
        };
    }, []);

    return <div ref={mapContainerRef} className="w-full h-full z-5" />;
};