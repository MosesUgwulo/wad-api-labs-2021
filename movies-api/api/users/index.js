import express from 'express';
import asyncHandler from 'express-async-handler';
import User from './userModel';
import jwt from 'jsonwebtoken';
import movieModel from '../movies/movieModel';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

// Register OR authenticate a user
router.post('/',asyncHandler( async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      res.status(401).json({success: false, msg: 'Please pass username and password.'});
      return next();
    }

    if (req.query.action === 'register') {
      //Check password against regex before registering
      const pword = req.body.password
      const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
      if (!regex.test(pword)) {
        res.status(401).json({success: false, msg: 'Password must be at least 5 characters long and contain at least one letter and one number.'});
        return next();
      }
      await User.create(req.body);
      res.status(201).json({code: 201, msg: 'Successful created new user.'});
    } else {
      const user = await User.findByUserName(req.body.username);
        if (!user) return res.status(401).json({ code: 401, msg: 'Authentication failed. User not found.' });
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (isMatch && !err) {
            // if user is found and password matches, create a token
            const token = jwt.sign(user.username, process.env.SECRET);
            // return the information including token as JSON
            res.status(200).json({success: true, token: 'BEARER ' + token});
          } else {
            res.status(401).json({code: 401,msg: 'Authentication failed. Wrong password.'});
          }
        });
      }
  }));

// Update a user
router.put('/:id', async (req, res) => {
    if (req.body._id) delete req.body._id;
    const result = await User.updateOne({
        _id: req.params.id,
    }, req.body);
    if (result.matchedCount) {
        res.status(200).json({ code:200, msg: 'User Updated Sucessfully' });
    } else {
        res.status(404).json({ code: 404, msg: 'Unable to Update User' });
    }
});

router.post('/:userName/favourites', asyncHandler(async (req, res) => {
  //Check if the favourite already exists
  const userName = req.params.userName;
  const user = await User.findByUserName(userName);
  const movie = await movieModel.findByMovieDBId(newFavourite);
  const movieId = movie.id;
  const newFavourite = req.body.id;

  if (user.favourites.includes(movieId)) {
    res.status(401).json({success: false, msg: 'Movie already in favourites.'});
  } else {
    user.favourites.push(movieId);
    await user.save();
    res.status(201).json(user); 
  }
}));


router.get('/:userName/favourites', asyncHandler( async (req, res) => {
  const userName = req.params.userName;
  const user = await User.findByUserName(userName).populate('favourites');
  res.status(200).json(user.favourites);
}));

export default router;