import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, type IdTokenResult, type User } from 'firebase/auth';
import { auth } from './GoogleAuth/Config';
import { useLocation, useNavigate } from 'react-router-dom';

import L from 'leaflet';

const guestUser = {
    uid: 'guest',
    displayName: 'Guest',
    email: null,
    photoURL: 'https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg', 
} as User;

const Home: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const mapContainer = React.useRef<HTMLDivElement | null>(null);
    const mapInstance = React.useRef<L.Map | null>(null);

    useEffect(() => {
        const isGuest = location.state?.isGuest;
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else if(isGuest) {
                setUser(guestUser);
            }
            else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        // Initialize map only when the container is available and the map isn't already initialized
        if (mapContainer.current && !mapInstance.current) {
            mapInstance.current = L.map(mapContainer.current).setView([51.505, -0.09], 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            L.marker([51.5, -0.09]).addTo(mapInstance.current)
                .bindPopup('A pretty CSS popup.<br> Easily customizable.')
                .openPopup();
        }

        // Cleanup function to remove map on component unmount
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [user]);

    if (!user) {
        return <div>Loading...</div>;
    }



    return (
        <div>
            <h2>Home Page!</h2>
            <p>Welcome, {user.displayName}!</p>
            <p>Email: {user.email}</p>
            {user.photoURL && (
                <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    style={{ borderRadius: '50%', width: '50px', height: '50px' }} 
                />
            )}

            <div ref={mapContainer} style={{ height: "400px", width: "100%" }} />
        </div>
    );
}



export default Home;