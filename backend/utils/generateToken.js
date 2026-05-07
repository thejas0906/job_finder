const jwt = require("jsonwebtoken");

// Include role so middleware can do role-checks without a DB call
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;