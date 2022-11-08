import "express-async-errors";
import express from "express";
const app = express();
const port = 5000;

// Prisma client
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// async function main() {
//   // ... you will write your Prisma Client queries here
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })

// Express server
app.get("/planets", async (req, res) => {
  res.json(await prisma.planet.findMany());
});

app.listen(port, () => {
  console.log(`Server su http://localhost:${port}`);
});
