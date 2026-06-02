import { createContext, useState } from 'react';

// Authentication context shared across the application.
export const AuthContext = createContext();

// Provider component responsible for managing and exposing authentication state.
export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        // Simulate a network request delay.
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock authentication logic for development/testing purposes.
                if (email === "test@breezy.com" && password === "123456") {

                    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakeToken";
                    const fakeUser = { id: 1, username: "Baptiste_Test", role: "user" };

                    // Persist authentication token in local storage.
                    localStorage.setItem('breezy_token', fakeToken);

                    setUser(fakeUser);
                    resolve(true);
                } else {
                    reject("Email or password is incorrect");
                }
            }, 1000);
        });
    };

    const logout = () => {
        // Remove authentication data and reset user state.
        localStorage.removeItem('breezy_token');
        setUser(null);
    };

    // Expose authentication state and actions to all descendant components.
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}