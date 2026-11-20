
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js";
import "dotenv/config";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
              const googleEmail = profile.emails?.[0]?.value;
        const isEmailVerified = profile._json?.email_verified === true;

        if (!profile.id || !googleEmail || !isEmailVerified) {
            return done(null, false);
        }

                let user = await prisma.user.findUnique({
    where: {
        googleId: profile.id
    }
});

if (user) {
    user = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            name: profile.displayName,
            email: googleEmail
        }
    });
} else {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: googleEmail
        }
    });

    if (existingUser) {
        if (existingUser.googleId) {
            return done(null, false);
        }

        user = await prisma.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                googleId: profile.id,
                name: profile.displayName
            }
        });
    } else {
        user = await prisma.user.create({
            data: {
                googleId: profile.id,
                name: profile.displayName,
                email: googleEmail
            }
        });
    }
}

                return done(null, user);

            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});



passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        if (!user) {
    return done(null, false);
}

return done(null, user);

    } catch (error) {
        done(error, null);
    }
});


export default passport;
