import { getPrismaClient } from '../src/config/db.js';

const prisma = getPrismaClient();

async function populateProgrammeOrder() {
  try {
    console.log('Fetching all programmes...');
    
    // Get all programmes ordered by creation date
    const programmes = await prisma.programme.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${programmes.length} programmes to update`);

    // Update each programme with sequential order numbers
    for (let i = 0; i < programmes.length; i++) {
      const programme = programmes[i];
      const order = i + 1;
      
      await prisma.programme.update({
        where: { id: programme.id },
        data: { order: order }
      });
      
      console.log(`Updated ${programme.name?.en || 'Unnamed'} with order ${order}`);
    }

    console.log('✅ Successfully populated order field for all programmes');
  } catch (error) {
    console.error('❌ Error populating programme order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateProgrammeOrder();
