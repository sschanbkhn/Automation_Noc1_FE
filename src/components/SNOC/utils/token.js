import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const { exp } = jwtDecode(token);
        if (!exp) return true;

        const now = Date.now() / 1000;
        return exp < now;
    } catch (error) {
        console.error('Invalid token', error);
        return true;
    }
};