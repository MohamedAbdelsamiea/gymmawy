import app from "./app.js";
import "./services/cronService.js"; // Start cron jobs

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0'; // Allow external connections

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Gymmawy API listening on ${host}:${port}`);
});


