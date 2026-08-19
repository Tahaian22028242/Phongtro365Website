import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }

        if (!user) {
            axios.get('/auth/profile')
                .then(({ data }) => {
                    setUser(data);
                    setReady(true);

                    // Check for account blacklist / violation
                    if (data && data.violationCount >= 4) {
                        axios.post('/auth/logout')
                            .then(() => {
                                localStorage.removeItem('auth_token');
                                delete axios.defaults.headers.common['Authorization'];
                                setUser(null);
                            })
                            .catch(err => {
                                console.error("Logout failed", err);
                            });
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch profile", err);
                    setReady(true);
                });
        } else {
            setReady(true);
        }
    }, [user]);

    const setAuthUser = (userData, token) => {
        if (token) {
            localStorage.setItem('auth_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else if (!userData) {
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
        }
        setUser(userData);
    };

    return (
        <UserContext.Provider value={{ user, setUser: setAuthUser, ready }}>
            {children}
        </UserContext.Provider>
    );
}
