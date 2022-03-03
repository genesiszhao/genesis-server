function responseClient(
  res,
  httpCode = 500,
  status = 3,
  message = "服务端异常",
  data = {}
) {
  let responseData = {};
  responseData.error = status;
  responseData.message = message;
  responseData.data = data;
  res.status(httpCode).json(responseData);
}

module.exports = {
  responseClient,
};
