import dotenv from 'dotenv';
import express from 'express';
import './db';
import './seedData';
import moviesRouter from './api/movies';
import genresRouter from './api/genres';
import usersRouter from './api/users';
import session from 'express-session';
// replace existing import with passport strategy​
import passport from './authenticate';

dotenv.config();

const errHandler = (err, req, res) => {
  /* if the error in development then send stack trace to display whole error,
  if it's in production then just send error message  */
  if(process.env.NODE_ENV === 'production') {
    return res.status(500).send(`Something went wrong!`);
  }
  res.status(500).send(`Hey!! You caught the error 👍👍. Here's the details: ${err.stack} `);
};

const app = express();

// replace app.use(session([... with the following:
app.use(passport.initialize());

const port = process.env.PORT;

app.use(express.json());
app.use('/api/genres', genresRouter);
app.use('/api/users', usersRouter);
// Add passport.authenticate(..)  to middleware stack for protected routes
app.use('/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);
app.use(errHandler);


app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});