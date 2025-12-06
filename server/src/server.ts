// import express, { Request, Response } from "express";
// import cors from "cors";

// import { config } from "./config/index";

// const app = express();
// app.use(cors());

// const PORT = config.PORT

// app.get("/greet", (req: Request, res: Response) => {
//   res.send("Hello");
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import chalk from 'chalk';

//database
import db from './database/database';

import userRoutes from './routes/authRoutes';

//routes

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.use(cors());

app.use(cookieParser());

app.use('/api', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(PORT, () => {
    console.log('Server is running on http://localhost:'+ chalk.green(`${PORT}`));
})
