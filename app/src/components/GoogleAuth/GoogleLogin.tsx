import React from 'react';
import axios from 'axios';

//firebase
import { auth, provider } from './Config';
import { signInWithPopup } from 'firebase/auth';

import { useNavigate } from 'react-router-dom';



const Login: React.FC = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            navigate('/home');

            await axios.post(`${API_URL}/api/saveUser`, {
                withCredentials: true,
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                id: user.uid,
                name: user.displayName,
                email: user.email,
                photo: user.photoURL
            });

            console.log("User Info: ", user.displayName, user.email, user.photoURL);

        } catch (error) {
            console.error("Error during sign-in: ", error);
        }
    }

    return (
        <div>
            <button
                onClick={handleLogin}
            >
                Sign in with Google
            </button>
        </div>
    );
}

export default Login;