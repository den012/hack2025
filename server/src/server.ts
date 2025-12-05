import express, { Request, Response } from "express";
import cors from "cors";

import { config } from "./config/index";

const app = express();
app.use(cors());

const PORT = config.PORT

app.get("/greet", (req: Request, res: Response) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});