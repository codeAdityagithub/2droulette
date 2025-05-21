import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "dotenv";
config();

const app = express();

// Use Helmet!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(helmet());
app.use(morgan("short"));
app.use(cookieParser());

app.use("/static", express.static(path.join(__dirname, "../public")));

app.post("/test", (req, res) => {
    console.log(req.cookies);
    res.json({ message: "test" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`app running on http://127.0.0.1:${PORT}`);
});
