const express = require("express");
const { asyncMiddleware } = require("../utils/middleware");
const { responseClient } = require("../utils/server_response");
const { getRandomCode } = require("../utils/tools");
const connection = require("../database");
const {
  user,
  user_data,
  user_validation_code_map,
} = require("../constants/dbname");
// const { cancellation_ensure } = require("../constants/service.config");

const router = express.Router();

/* GET users listing. */
router.get(
  "/getvalidation",
  asyncMiddleware(async function (req, res) {
    const { username } = req.body;

    const client = await connection;
    const userValidationCode = await client
      .db(user)
      .collection(user_validation_code_map)
      .findOne({
        username,
      });

    // 存贮验证码到数据库并设置超时时间
    const now = Date.now();
    const timeout = now + 60 * 1000 * 10;
    const code = getRandomCode(); // 生成验证码

    if (!userValidationCode) {
      const result = await database
        .db(user)
        .collection(user_validation_code_map)
        .insertOne({
          username,
          code,
          timeout,
        });

      // 调用第三方API发送验证码
      if (result) {
        responseClient(res, 200, 0, "验证码发送成功");
        return;
      }
    } else {
      if (now - (userValidationCode.timeout - 60 * 1000 * 10) > 60) {
        const result = await database
          .db(user)
          .collection(user_validation_code_map)
          .updateOne(
            {
              username,
            },
            { $set: { code, timeout } }
          );
        // 调用第三方API发送验证码

        if (result) {
          responseClient(res, 200, 0, "验证码发送成功");
          return;
        }
      }
    }

    responseClient(res, 200, 1, "验证码发送失败");
  })
);

router.post(
  "/register",
  asyncMiddleware(async function (req, res) {
    const { code, username, password } = req.body;

    // 验证名（手机号）是否有效
    const regexp = /^1[3-9]\d{9}$/;
    if (!regexp.test(username)) {
      responseClient(res, 200, 1, "用户手机号格式有误");
      return;
    }

    const client = await connection;
    const result = await client
      .db(user)
      .collection(user_validation_code_map)
      .findOne({ username });

    // 验证验证码是否有效
    if (result && result.code === code) {
      if (result && result.timeout >= Date.now()) {
        const insertResult = await client
          .db(user)
          .collection(user_data)
          .insertOne({
            username,
            password,
          });

        if (insertResult) {
          responseClient(res, 200, 0, "注册成功");
          return;
        }
      }
    }

    responseClient(res, 200, 1, "注册失败");
  })
);

router.get(
  "/login",
  asyncMiddleware(async function (req, res) {
    const { username, password } = req.body;

    const client = await connection;
    const result = await client.db(user).collection(user_data).findOne({
      username,
      password,
    });

    if (result) {
      req.session.username = username;
      responseClient(res, 200, 0, "登录成功");
      return;
    }

    responseClient(res, 200, 1, result ? "账号不存在" : "密码错误");
  })
);

router.get(
  "/checkuser",
  asyncMiddleware(async function (req, res) {
    const { username } = req.body;

    const client = await connection;
    const result = await client
      .db(user)
      .collection(user_data)
      .findOne({ username });

    if (!result) {
      responseClient(res, 200, 0, "用户名可用");
      return;
    }
    responseClient(res, 200, 1, "用户名已经被注册");
  })
);

router.post(
  "/changeuserpassword",
  asyncMiddleware(async function (req, res) {
    const { code, username, password } = req.body;

    // 验证名（手机号）是否有效
    const regexp = /^1[3-9]\d{9}$/;
    if (!regexp.test(username)) {
      responseClient(res, 200, 1, "用户手机号格式有误");
      return;
    }

    const client = await connection;
    const result = await client
      .db(user)
      .collection(user_validation_code_map)
      .findOne({ username });

    // 验证验证码是否有效
    if (result && result.code === code) {
      if (result && result.timeout >= Date.now()) {
        const updateResult = await client
          .db(user)
          .collection(user_data)
          .updateOne(
            { username },
            {
              $set: password,
            }
          );

        if (updateResult) {
          responseClient(res, 200, 0, "密码修改成功");
          return;
        }
      }
    }

    responseClient(res, 200, 1, "密码修改失败");
  })
);

router.get("/logout", function (req, res) {
  req.session = null;
  res.clearCookie();
  responseClient(res, 200, 0, "登出成功", {});
});

// router.post("/cancellation", function (req, res, next) {
//   const { ensure } = req.body;
//   if (req.session.isLogin && cancellation_ensure === ensure) {
//   }
// });

module.exports = router;
