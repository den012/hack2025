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

    // return (
    //     <>
    //         <div className="flex justify-end md:hidden p-2">
    //             <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
    //         </div>
    //         <h2 className="px-4 py-3 m-0 border-b border-gray-300 text-lg font-semibold">Most trending🔥</h2>
    //         {topTrendingShelters.length > 0 ? (
    //             <ul className="list-none m-0 p-0 border-b border-gray-200">
    //                 {topTrendingShelters.map((shelter, index) => (
    //                     <li key={`trending-${index}`} onClick={() => onShelterSelect(shelter)} className={`px-4 py-3 cursor-pointer border-t border-gray-200 first:border-t-0 ${selectedShelter === shelter ? 'bg-indigo-50' : 'bg-transparent'}`}>
    //                         <strong className="block text-sm">{shelter.adresa}</strong>
    //                         <div className="flex justify-between text-xs text-gray-500">
    //                             <span>{shelter.localitate}, {shelter.judet}</span>
    //                             <span className="font-bold text-red-500">{shelter.viewCount} views</span>
    //                         </div>
    //                     </li>
    //                 ))}
    //             </ul>
    //         ) : (
    //             <p className="p-4 text-sm text-gray-500 border-b border-gray-200">No trending data available yet.</p>
    //         )}
            
    //         <h2 className="px-4 py-3 m-0 border-b border-gray-300 text-lg font-semibold">Nearby Shelters</h2>
    //         {shelters.length > 0 ? (
    //             <ul className="list-none m-0 p-0 overflow-y-auto h-full">
    //                 {sheltersToShow.map((shelter, index) => (
    //                     <li key={index} onClick={() => onShelterSelect(shelter)} className={`px-4 py-3 cursor-pointer border-b border-gray-200 ${selectedShelter === shelter ? 'bg-indigo-50' : 'bg-transparent'}`}>
    //                         <strong className="block text-sm">{shelter.adresa}</strong>
    //                         <div className="flex justify-between text-xs text-gray-500">
    //                             <span>{shelter.localitate}, {shelter.judet}</span>
    //                             {shelter.distance && <span>{shelter.distance.toFixed(2)} km</span>}
    //                         </div>
    //                     </li>
    //                 ))}
    //                 {!showAllShelters && shelters.length > 5 && (
    //                     <li className="text-center p-3">
    //                         <button onClick={onShowAll} className="text-sm text-indigo-600 hover:underline">Show More</button>
    //                     </li>
    //                 )}
    //             </ul>
    //         ) : (
    //             <p className="p-4 text-gray-600">No shelters found nearby.</p>
    //         )}
    //     </>
    // );


    return (
        <div className="flex flex-col h-full bg-white">
            {/* Close Button */}
            <div className="flex justify-between items-center md:hidden p-4 border-b border-gray-200">
                <h1 className="text-lg font-bold text-blue-600 m-0">Shelters</h1>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Trending Section */}
                {topTrendingShelters.length > 0 && (
                    <div className="border-b border-gray-200">
                        <div className="px-4 py-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl"></span>
                                <h2 className="text-sm font-bold text-gray-800 m-0 uppercase tracking-wide">Be aware! High demand</h2>
                            </div>
                            <div className="space-y-2">
                                {topTrendingShelters.map((shelter, index) => (
                                    <button
                                        key={`trending-${index}`}
                                        onClick={() => onShelterSelect(shelter)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                            selectedShelter === shelter
                                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 shadow-sm'
                                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 m-0 truncate">{shelter.adresa}</p>
                                                <p className="text-xs text-gray-600 m-0 mt-1">{shelter.localitate}, {shelter.judet}</p>
                                            </div>
                                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full whitespace-nowrap">{shelter.viewCount} views</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Nearby Shelters Section */}
                <div className="px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">📍</span>
                        <h2 className="text-sm font-bold text-gray-800 m-0 uppercase tracking-wide">Nearby Shelters</h2>
                    </div>

                    {shelters.length > 0 ? (
                        <div className="space-y-2">
                            {sheltersToShow.map((shelter, index) => (
                                <button
                                    key={index}
                                    onClick={() => onShelterSelect(shelter)}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                        selectedShelter === shelter
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 shadow-sm'
                                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 m-0 truncate">{shelter.adresa}</p>
                                            <p className="text-xs text-gray-600 m-0 mt-1">{shelter.localitate}, {shelter.judet}</p>
                                        </div>
                                        {shelter.distance && (
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                                                {shelter.distance.toFixed(1)} km
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}

                            {/* Show More Button */}
                            {!showAllShelters && shelters.length > 5 && (
                                <button
                                    onClick={onShowAll}
                                    className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Show More Shelters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500 m-0">No shelters found nearby</p>
                            <p className="text-xs text-gray-400 m-0 mt-1">Move closer or enable location</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};