const User = require("../models/user.model");
const Configuration = require("../models/switchConfig.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

module.exports.create = (req, res, next) => {
  User.create(req.body)
    .then((user) => res.status(201).json(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).json(err.errors);
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        user
          .checkPassword(req.body.password)
          .then((match) => {
            if (match) {
              const accessToken = jwt.sign(
                {
                  sub: user.id,
                  exp: Date.now() / 1000 + 3600,
                },
                process.env.JWT_SECRET
              );

              res.json({ accessToken });
            } else {
              res.status(401).json({ message: "Invalid password" });
            }
          })
          .catch(next);
      } else {
        res.status(401).json({ message: "Invalid email" });
      }
    })
    .catch(next);
};

module.exports.profile = (req, res) => {
  res.json(req.user);
};

module.exports.update = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, req.body, {
    runValidators: true,
    new: true,
  })
    .then((user) => {
      if (user) res.json(user);
      else res.status(404).json({ message: "User not found" });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).json(err.errors);
      } else {
        next(err);
      }
    });
};

module.exports.delete = (req, res, next) => {
  User.findByIdAndDelete(req.user._id)
    .then((user) => {
      if (user) {
        // no funciona
        Configuration.deleteMany({ owner: user._id }).catch(next);
        res.status(204).send();
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch(next);
};