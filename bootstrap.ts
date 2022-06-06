import postgresql from "./database";
import app from "./app";

const bootstrap = async () => Promise.all([
  postgresql.initialize().then(() => console.log("Database has been connected.")),
  app.initialize().then((port) => console.log(`Server has started on port :${port}`)),
]).catch(err => {
  console.log(err.name + ": " + err.message)
  console.log("Server has been stopped.")
  process.exit(err.code || 1);
});

bootstrap();