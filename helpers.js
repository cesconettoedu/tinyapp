//generating string of 6 random alphanumeric characters:
let generateRandomString = () => {
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = "";
  let size = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * size));
  }
  return result;
};

const urlsForUser = (id, urlDatabase) => {
  let output = {};
  for (let y in urlDatabase) {
    if (urlDatabase[y].userID === id) {
      output[y] = urlDatabase[y];
    }
  }
  return output;
};


const getUserByEmail = function(email, database) {
  for (let userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  }
  return undefined;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString};