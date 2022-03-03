const { md5 } = require("../utils/tools");

const sessionIdName = "SESSION_ID_NAME";
const ensureDelete = "确定删除账号";

module.exports = {
  sessionIdName: md5(sessionIdName),
  ensureDelete,
};
