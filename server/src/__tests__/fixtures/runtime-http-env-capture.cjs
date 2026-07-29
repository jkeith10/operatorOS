const fs = require("node:fs");
const http = require("node:http");

const capturePath = process.env.PAPERCLIP_TEST_CAPTURE_PATH;
if (capturePath) {
  fs.writeFileSync(
    capturePath,
    JSON.stringify({
      paperclipConfig: process.env.PAPERCLIP_CONFIG ?? null,
      paperclipHome: process.env.PAPERCLIP_HOME ?? null,
      paperclipInstanceId: process.env.PAPERCLIP_INSTANCE_ID ?? null,
      databaseUrl: process.env.DATABASE_URL ?? null,
      customEnv: process.env.RUNTIME_CUSTOM_ENV ?? null,
      port: process.env.PORT ?? null,
    }),
    "utf8",
  );
}

http
  .createServer((_req, res) => {
    res.end("ok");
  })
  .listen(Number(process.env.PORT), "127.0.0.1");
