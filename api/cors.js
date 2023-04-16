const request = require("request");
const cors = require("cors");

const corsMiddleware = cors();

module.exports = (req, res) => {
  corsMiddleware(req, res, () => {
    let url = req.url.slice(1);
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    const proxyRequest = req.pipe(request(url));
    proxyRequest.on("error", (err) => {
      console.error(err);
      res.status(500).send("An error occurred while processing your request.");
    });
    proxyRequest.pipe(res);
  });
};
