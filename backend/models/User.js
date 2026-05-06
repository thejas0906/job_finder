const pool = require("../config/db");


// Create user
const createUser = async (user_id, email, password, role) => {

  const query = `
    INSERT INTO users (user_id, email, password, role)
    VALUES (UUID_TO_BIN(?), ?, ?, ?)
  `;

  const [result] = await pool.execute(query, [
    user_id,
    email,
    password,
    role
  ]);

  return result;
};



// Find user by email
const findUserByEmail = async (email) => {

  const query = `
    SELECT BIN_TO_UUID(user_id) AS user_id, email, password, role
    FROM users
    WHERE email = ?
  `;

  const [rows] = await pool.execute(query, [email]);

  return rows[0];
};



// Find user by id
const findUserById = async (user_id) => {

  const query = `
    SELECT BIN_TO_UUID(user_id) AS user_id, email, role
    FROM users
    WHERE user_id = UUID_TO_BIN(?)
  `;

  const [rows] = await pool.execute(query, [user_id]);

  return rows[0];
};


module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};