import React from 'react';

interface Shelter { judet: string; localitate: string; adresa: string; lat: number; lon: number; distance?: number;  viewCount?: number; }

interface SidebarProps {
    shelters: Shelter[];
    selectedShelter: Shelter | null;
    onShelterSelect: (shelter: Shelter) => void;
    showAllShelters: boolean;
    onShowAll: () => void;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ shelters, selectedShelter, onShelterSelect, showAllShelters, onShowAll, onClose }) => {
    const sheltersToShow = showAllShelters ? shelters : shelters.slice(0, 5);

    const topTrendingShelters = [...shelters]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3)
        .filter(shelter => (shelter.viewCount || 0) > 0);

    return (
        <>
            <div className="flex justify-end md:hidden p-2">
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <h2 className="px-4 py-3 m-0 border-b border-gray-300 text-lg font-semibold">Most trending🔥</h2>
            {topTrendingShelters.length > 0 ? (
                <ul className="list-none m-0 p-0 border-b border-gray-200">
                    {topTrendingShelters.map((shelter, index) => (
                        <li key={`trending-${index}`} onClick={() => onShelterSelect(shelter)} className={`px-4 py-3 cursor-pointer border-t border-gray-200 first:border-t-0 ${selectedShelter === shelter ? 'bg-indigo-50' : 'bg-transparent'}`}>
                            <strong className="block text-sm">{shelter.adresa}</strong>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{shelter.localitate}, {shelter.judet}</span>
                                <span className="font-bold text-red-500">{shelter.viewCount} views</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="p-4 text-sm text-gray-500 border-b border-gray-200">No trending data available yet.</p>
            )}
            
            <h2 className="px-4 py-3 m-0 border-b border-gray-300 text-lg font-semibold">Nearby Shelters</h2>
            {shelters.length > 0 ? (
                <ul className="list-none m-0 p-0 overflow-y-auto h-full">
                    {sheltersToShow.map((shelter, index) => (
                        <li key={index} onClick={() => onShelterSelect(shelter)} className={`px-4 py-3 cursor-pointer border-b border-gray-200 ${selectedShelter === shelter ? 'bg-indigo-50' : 'bg-transparent'}`}>
                            <strong className="block text-sm">{shelter.adresa}</strong>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{shelter.localitate}, {shelter.judet}</span>
                                {shelter.distance && <span>{shelter.distance.toFixed(2)} km</span>}
                            </div>
                        </li>
                    ))}
                    {!showAllShelters && shelters.length > 5 && (
                        <li className="text-center p-3">
                            <button onClick={onShowAll} className="text-sm text-indigo-600 hover:underline">Show More</button>
                        </li>
                    )}
                </ul>
            ) : (
                <p className="p-4 text-gray-600">No shelters found nearby.</p>
            )}
        </>
    );
};