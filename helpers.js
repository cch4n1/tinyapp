/**
 * User Lookup Function:
 * Takes provided email and looks up user in users database.
 * Returns an object with user info.
 * @param {string} email - email of user to lookup
 * @returns {object|null} - user object if found, or null if not
 */
const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }

  return null;
};

module.exports = { getUserByEmail };