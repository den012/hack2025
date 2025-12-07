// import React, { useState } from 'react';
// import { useAuth } from './hooks/useAuth'
// import { useGeolocation } from './hooks/useGeolocation';
// import { useShelters } from './hooks/useShelters';
// import { MapComponent } from './MapComponents';
// import { Sidebar } from './Sidebar';
// import axios from 'axios';

// interface Shelter {
//     judet: string;
//     localitate: string;
//     adresa: string;
//     lat: number;
//     lon: number;
//     distance?: number;
// }

// const Home: React.FC = () => {
//     const API_URL = import.meta.env.VITE_API_URL;
//     const user = useAuth();
//     const userLocation = useGeolocation();
//     const shelters = useShelters(userLocation);

//     const [selectedShelter, setSelectedShelter] = useState<any | null>(null);
//     const [showAllShelters, setShowAllShelters] = useState(false);
//     const [showSidebar, setShowSidebar] = useState(false);

//     const handleShelterSelect = (shelter : Shelter) => {
//         setSelectedShelter(shelter);
//         setShowSidebar(false);

//         console.log(shelter.adresa);

//         const postData = {
//             adresa : shelter.adresa
//         };

//         const config = {
//             headers: {
//                 "ngrok-skip-browser-warning": "true"
//             }
//         }

//         axios.post(`${API_URL}/api/trackBunkerView`, postData, config).catch(error => console.error('failed to track bunker view', error))
//     };

//     if (!user) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <div className="flex flex-col h-screen">
//             {/* Header */}
//             <header className="p-3 bg-gray-100 border-b border-gray-300 flex items-center z-10">
//                 {user.photoURL && <img src={user.photoURL} alt="Profile" className="rounded-full w-10 h-10 mr-3" />}
//                 <div>
//                     <strong>Welcome, {user.displayName}!</strong>
//                     {user.email && <p className="m-0 text-xs text-gray-600">{user.email}</p>}
//                 </div>
//             </header>

//             <div className="flex flex-1 overflow-hidden">
//                 {/* Sidebar */}
//                 <aside className={`bg-white border-r border-gray-300 z-20 transition-transform transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:block w-72 md:w-72 absolute md:relative h-full md:h-auto`}>
//                     <Sidebar
//                         shelters={shelters}
//                         selectedShelter={selectedShelter}
//                         onShelterSelect={handleShelterSelect}
//                         showAllShelters={showAllShelters}
//                         onShowAll={() => setShowAllShelters(true)}
//                         onClose={() => setShowSidebar(false)}
//                     />
//                 </aside>

//                 {/* Map */}
//                 <main className="flex-1 relative">
//                     {!showSidebar && (
//                         <button onClick={() => setShowSidebar(true)} className="md:hidden absolute top-20 left-3 z-10 p-2 bg-white rounded-md shadow-lg">
//                             ☰
//                         </button>
//                     )}
//                     <MapComponent
//                         userLocation={userLocation}
//                         shelters={shelters}
//                         selectedShelter={selectedShelter}
//                         onShelterSelect={handleShelterSelect}
//                     />
//                 </main>
//             </div>
//         </div>
//     );
// }

// export default Home;


import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth'
import { useGeolocation } from './hooks/useGeolocation';
import { useShelters } from './hooks/useShelters';
import { MapComponent } from './MapComponents';
import { Sidebar } from './Sidebar';
import axios from 'axios';

interface Shelter {
    judet: string;
    localitate: string;
    adresa: string;
    lat: number;
    lon: number;
    distance?: number;
}

const Home: React.FC = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const user = useAuth();
    // const [isDemoMode, setIsDemoMode] = useState(true); // State to control demo mode
    const { location: userLocation } = useGeolocation(false);
    const shelters = useShelters(userLocation);

    const [selectedShelter, setSelectedShelter] = useState<any | null>(null);
    const [showAllShelters, setShowAllShelters] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    const handleShelterSelect = (shelter : Shelter) => {
        setSelectedShelter(shelter);
        setShowSidebar(false);

        console.log(shelter.adresa);

        const postData = {
            adresa : shelter.adresa
        };

        const config = {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        }

        axios.post(`${API_URL}/api/trackBunkerView`, postData, config).catch(error => console.error('failed to track bunker view', error))
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="p-3 bg-gray-100 border-b border-gray-300 flex items-center justify-between z-10">
                <div className="flex items-center">
                    <div className="flex items-center">
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
                    </div>

                    <a
                        href="https://buymeacoffee.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="items-center gap-2 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg text-sm ml-10"
                        title="Support this project"
                    >
                        <span>☕</span>
                        <span>Buy me coffee</span>
                    </a>
                </div>
                {/* <button
                    onClick={() => setIsDemoMode(isDemoMode)}
                    className={`px-3 py-2 rounded-md text-xs font-bold transition-colors ${
                        isDemoMode
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            :'bg-gray-300 hover:bg-gray-400 text-black'
                    }`}
                >
                    {isDemoMode ? 'DEMO ON' : 'DEMO OFF'}
                </button> */}
            </header>


            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`bg-white border-r border-gray-300 z-20 transition-transform transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:block w-72 md:w-72 absolute md:relative h-full md:h-auto`}>
                    <Sidebar
                        shelters={shelters}
                        selectedShelter={selectedShelter}
                        onShelterSelect={handleShelterSelect}
                        showAllShelters={showAllShelters}
                        onShowAll={() => setShowAllShelters(true)}
                        onClose={() => setShowSidebar(false)}
                    />
                </aside>

                {/* Map */}
                <main className="flex-1 relative">
                    {!showSidebar && (
                        <button onClick={() => setShowSidebar(true)} className="md:hidden absolute top-20 left-3 z-10 p-2 bg-white rounded-md shadow-lg">
                            ☰
                        </button>
                    )}
                    <MapComponent
                        userLocation={userLocation}
                        shelters={shelters}
                        selectedShelter={selectedShelter}
                        onShelterSelect={handleShelterSelect}
                        showSidebar={showSidebar}
                    />
                </main>
            </div>
        </div>
    );
}

export default Home;

