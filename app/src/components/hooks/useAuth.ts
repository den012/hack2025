import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../../components/GoogleAuth/Config';
import { useNavigate, useLocation } from 'react-router-dom';

const guestUser = {
    uid: 'guest',
    displayName: 'Guest',
    email: null,
    photoURL: 'https://i.pinimg.com/474x/07/c4/72/07c4720d19a9e9edad9d0e939eca304a.jpg',
} as User;

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const isGuest = location.state?.isGuest;
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else if (isGuest) {
                setUser(guestUser);
            } else {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate, location.state]);

    return user;
};