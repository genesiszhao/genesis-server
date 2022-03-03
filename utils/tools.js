const { createHash } = require("crypto");

function md5(string) {
  const md5 = createHash("md5");
  return md5.update(string).digest("hex");
}

function getRandomCode() {
  return ("000000" + Math.floor(Math.random() * 999999)).slice(-6);
}

module.exports = {
  md5,
  getRandomCode,
};
