import express from "express";
import "express-async-errors";
import cors from "cors";
import prisma from "./lib/prisma/client";
import {
    validate,
    validationErrorMiddleware,
    planetSchema,
    PlanetData,
} from "./lib/validation";
import { initMulterMiddleware } from "./lib/middleware/multer";
const upload = initMulterMiddleware();
const corsOptions = { origin: "http://localhost:8080" };
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("This is the Space Facts API!");
});

app.get("/planets", async (req, res) => {
    const planets = await prisma.planet.findMany();

    res.json(planets);
});

app.get("/planets/:id(\\d+)", async (req, res, next) => {
    const planetId = Number(req.params.id);
    const planet = await prisma.planet.findUnique({
        where: { id: planetId },
    });

    if (!planet) {
        res.status(404);
        return next(`Cannot GET /planets/${planetId}`);
    }

    res.json(planet);
});

app.post("/planets", validate({ body: planetSchema }), async (req, res) => {
    const planetData: PlanetData = req.body;

    const planet = await prisma.planet.create({
        data: planetData,
    });

    res.status(201).json(planet);
});

app.put(
    "/planets/:id(\\d+)",
    validate({ body: planetSchema }),
    async (req, res, next) => {
        const planetId = Number(req.params.id);
        const planetData: PlanetData = req.body;

        try {
            const planet = await prisma.planet.update({
                where: { id: planetId },
                data: planetData,
            });
            res.status(200).json(planet);
        } catch (error) {
            res.status(404);
            next(`Cannot PUT /planets/${planetId}`);
        }
    }
);

app.delete("/planets/:id(\\d+)", async (req, res, next) => {
    const planetId = Number(req.params.id);

    try {
        await prisma.planet.delete({
            where: { id: planetId },
        });
        res.status(204).end();
    } catch (error) {
        res.status(404);
        next(`Cannot DELETE /planets/${planetId}`);
    }
});

app.post(
    "/planets/:id(\\d+)/photo",
    upload.single("photo"),
    async (req, res, next) => {
        if (!req.file) {
            res.status(400);
            return next("No photo file uploaded");
        }

        const planetId = Number(req.params.id);
        const photoFilename = req.file.filename;

        try {
            await prisma.planet.update({
                where: { id: planetId },
                data: { photoFilename },
            });

            res.status(201).json({ photoFilename });
        } catch (error) {
            res.status(404);
            next(`Cannot POST /planets/${planetId}/photo`);
        }
    }
);

app.use("/planets/photos", express.static("uploads"));

app.use(validationErrorMiddleware);

export default app;
