// server.js
import app from "./index.js";

const PORT = process.env.PORT || 5000; // fallback to 5000 if no env variable is set

app.listen(PORT, () => {
  console.log(` Auth API running on http://localhost:${PORT}`);
});
