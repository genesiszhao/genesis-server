const createError = require("http-errors");
const express = require("express");
var session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const responseTime = require("response-time");
const { sessionIdName } = require("./constants");

const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

const app = express();

app.use(logger("dev"));
app.use(responseTime());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    name: sessionIdName,
    secret: "This is secret",
    resave: true,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 60 * 1000 * 60 },
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// UnauthorizedError
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    // 跳转到登录或者打开登录组件
    res.status(401).send("invalid token");
  }
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
