import passport from 'passport';
import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt';
import {NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET!,
};

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    if (jwtPayload) {
        return done(null, jwtPayload);
    } else {
        return done(null, false);
    }
}));

export const authenticateJwt = passport.authenticate('jwt', {session: false});

// A middleware to check authentication before accessing a route
export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', {session: false}, (err: any, user: any) => {
        if (err || !user) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        req.authUser = user;
        next();
    })(req, res, next);
};

// Middleware to verify JWT token from cookies
export function verifyCookie(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({message: 'Unauthorized: No cookies provided'});
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET as string, (err: jwt.VerifyErrors | null, user: any) => {
        if (err || !user) {
            return res.status(403).json({message: 'Token is invalid or expired'});
        }

        req.authUser = user;
        next();
    });
}




