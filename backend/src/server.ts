import "dotenv/config";

import { createApp } from "./app.js";
import { getAppConfig } from "./config.js";

const config = getAppConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
