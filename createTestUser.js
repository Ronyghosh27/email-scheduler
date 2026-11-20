
import prisma from "./config/prisma.js";

async function main() {
    const user = await prisma.user.upsert({
        where: {
            email: "testuser@example.com"
        },
        update: {},
        create: {
            name: "Test User",
            email: "testuser@example.com"
        }
    });

    console.log("Test user created or already exists:");
    console.log(user);
}

main()
    .catch((error) => {
        console.error(error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
