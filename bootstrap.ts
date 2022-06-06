import app from "./app";
import database from "./database";

const bootstrap = async () => Promise.all([
  database.initialize().then(() => console.log("Database has been connected.")),
  app.initialize().then((port) => console.log(`Server has started on port :${port}`)),
]).catch(err => {
  console.log(err.name + ": " + err.message)
  console.log("Server has been stopped.")
  process.exit(err.code || 1);
});

bootstrap();