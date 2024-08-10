import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback'
},
async (accessToken, refreshToken, profile, done) => {    
    const allowedUsers = process.env.ALLOWED_USERS.split(',');
    if (allowedUsers.includes(profile.username)) {
      return done(null, profile);
    } else {
      return done(null, false, { message: 'You are not authorized to access this site.' });
    }
  }
));

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

export default router;
