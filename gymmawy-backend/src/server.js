import app from "./app.js";
import "./services/cronService.js"; // Start cron jobs

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Gymmawy API listening on :${port}`);
});


