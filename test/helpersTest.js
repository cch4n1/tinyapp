const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID, 'Should be the same User ID');
  });

  it('should return null for a non-existing e-mail', function() {
    const user = getUserByEmail("user1@example.com", testUsers)
    // Write your assert statement here
    assert.isNull(user, 'Should be null');
  });

  it('should return null for an empty e-mail', function() {
    const user = getUserByEmail("", testUsers)
    // Write your assert statement here
    assert.isNull(user, 'Should be null');
  });

  it('should return null for empty database', function() {
    const user = getUserByEmail("user@example.com", {})
    // Write your assert statement here
    assert.isNull(user, 'Should be null');
  });
});