const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Buscar todos os clientes
    const clientes = await prisma.clientes.findMany({
        include: {
            pets: true,            // incluir os pets de cada cliente
            agendamentos: true,    // incluir os agendamentos de cada cliente
        },
    });

    // Exibir os clientes no console
    clientes.forEach(cliente => {
        console.log("Cliente:", cliente.nome);
        console.log("Email:", cliente.email);
        console.log("Celular:", cliente.celular);

        if (cliente.pets.length > 0) {
            console.log("Pets:");
            cliente.pets.forEach(pet => {
                console.log(` - ${pet.nome} (${pet.especie})`);
            });
        }

        if (cliente.agendamentos.length > 0) {
            console.log("Agendamentos:");
            cliente.agendamentos.forEach(ag => {
                console.log(` - Pet ID: ${ag.pet_id}, Veterinário ID: ${ag.veterinario_id}, Data: ${ag.data_hora}`);
            });
        }

        console.log("---------------------------");
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
