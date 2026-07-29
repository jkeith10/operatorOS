require("node:http")
  .createServer((_req, res) => {
    res.end(process.env.PAPERCLIP_HOME ?? "");
  })
  .listen(Number(process.env.PORT), "127.0.0.1");
