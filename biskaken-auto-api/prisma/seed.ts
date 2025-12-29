import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@biskaken.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@biskaken.com',
      phone: '0244000000',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create mechanic users
  const mechanics = [
    {
      name: 'Kwame Asante',
      email: 'kwame@biskaken.com',
      phone: '0244111111',
      role: 'STAFF'
    },
    {
      name: 'Kofi Mensah',
      email: 'kofi@biskaken.com',
      phone: '0244222222',
      role: 'STAFF'
    },
    {
      name: 'Yaw Boateng',
      email: 'yaw@biskaken.com',
      phone: '0244333333',
      role: 'SUB_ADMIN'
    }
  ];

  for (const mechanic of mechanics) {
    const mechanicPassword = await bcrypt.hash('mechanic123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: mechanic.email },
      update: {},
      create: {
        ...mechanic,
        password: mechanicPassword,
        role: mechanic.role as any,
        status: 'ACTIVE'
      }
    });
    
    console.log(`✅ Mechanic created: ${user.name} (${user.role})`);
  }

  // Create sample customers
  const customers = [
    {
      name: 'John Mensah',
      phone: '0244123456',
      email: 'john.mensah@email.gh',
      address: '123 Liberation Road, Accra',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2015,
        plateNumber: 'GR-1234-15'
      }
    },
    {
      name: 'Sarah Osei',
      phone: '0558765432',
      email: 's.osei@business.gh',
      address: '456 Spintex Road, Accra',
      vehicle: {
        make: 'Hyundai',
        model: 'Elantra',
        year: 2018,
        plateNumber: 'GW-5521-20'
      }
    },
    {
      name: 'Kwame Boateng',
      phone: '0201239876',
      email: 'boateng.k@gmail.com',
      address: '789 East Legon, Accra',
      vehicle: {
        make: 'Nissan',
        model: 'Patrol',
        year: 2020,
        plateNumber: 'GE-9988-21'
      }
    }
  ];

  for (const customerData of customers) {
    const customer = await prisma.customer.upsert({
      where: { phone: customerData.phone },
      update: {},
      create: {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address
      }
    });

    // Create vehicle for customer
    await prisma.vehicle.upsert({
      where: { plateNumber: customerData.vehicle.plateNumber },
      update: {},
      create: {
        customerId: customer.id,
        ...customerData.vehicle
      }
    });

    console.log(`✅ Customer created: ${customer.name}`);
  }

  // Create sample inventory items
  const inventoryItems = [
    {
      partName: 'Engine Oil (Synthetic 5W-30)',
      category: 'Oils & Fluids',
      stockQty: 15,
      reorderLevel: 5,
      unitCost: 120,
      sellingPrice: 180,
      supplier: 'Total Ghana'
    },
    {
      partName: 'Brake Pads (Toyota Front)',
      category: 'Brake Parts',
      stockQty: 8,
      reorderLevel: 3,
      unitCost: 200,
      sellingPrice: 350,
      supplier: 'Genuine Parts Ltd'
    },
    {
      partName: 'Oil Filter (Universal)',
      category: 'Filters',
      stockQty: 25,
      reorderLevel: 10,
      unitCost: 45,
      sellingPrice: 85,
      supplier: 'Mann Filter Ghana'
    },
    {
      partName: 'Spark Plugs (Iridium Set)',
      category: 'Electrical',
      stockQty: 20,
      reorderLevel: 8,
      unitCost: 30,
      sellingPrice: 65,
      supplier: 'NGK Ghana'
    },
    {
      partName: 'Car Battery (12V 75Ah)',
      category: 'Electrical',
      stockQty: 6,
      reorderLevel: 3,
      unitCost: 550,
      sellingPrice: 850,
      supplier: 'Chloride Ghana'
    },
    {
      partName: 'Coolant (5 Litres)',
      category: 'Oils & Fluids',
      stockQty: 2,
      reorderLevel: 5,
      unitCost: 85,
      sellingPrice: 140,
      supplier: 'Total Ghana'
    },
    {
      partName: 'Wiper Blades (Universal)',
      category: 'Body Parts',
      stockQty: 12,
      reorderLevel: 6,
      unitCost: 25,
      sellingPrice: 50,
      supplier: 'Bosch Ghana'
    },
    {
      partName: 'Brake Fluid (DOT 4)',
      category: 'Oils & Fluids',
      stockQty: 8,
      reorderLevel: 4,
      unitCost: 40,
      sellingPrice: 75,
      supplier: 'Castrol Ghana'
    }
  ];

  for (const item of inventoryItems) {
    const inventoryItem = await prisma.inventory.upsert({
      where: { partName: item.partName },
      update: {},
      create: item
    });
    
    console.log(`✅ Inventory item created: ${inventoryItem.partName}`);
  }

  // Create shop settings
  const shopSettings = await prisma.shopSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      shopName: 'Biskaken Auto Services',
      address: 'Plot 123, Tema Industrial Area, Tema, Ghana',
      phone: '0302765432',
      email: 'info@biskaken.com',
      laborRate: 80,
      taxRate: 0,
      currency: 'GHS'
    }
  });

  console.log('✅ Shop settings created:', shopSettings.shopName);

  // Create sample jobs if customers exist
  const allCustomers = await prisma.customer.findMany({
    include: { vehicles: true }
  });

  const allMechanics = await prisma.user.findMany({
    where: { role: { in: ['STAFF', 'SUB_ADMIN'] } }
  });

  if (allCustomers.length > 0 && allMechanics.length > 0) {
    const sampleJobs = [
      {
        customer: allCustomers[0],
        complaint: 'Car making grinding noise when braking, especially when coming to a complete stop',
        status: 'COMPLETED',
        priority: 'HIGH',
        laborHours: 2,
        laborRate: 80,
        estimatedCost: 450
      },
      {
        customer: allCustomers[1],
        complaint: 'Engine overheating after 30 minutes of driving, coolant level appears normal',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        laborHours: 4,
        laborRate: 80,
        estimatedCost: 800
      },
      {
        customer: allCustomers[2],
        complaint: 'Routine 50,000km service - oil change, filter replacement, general inspection',
        status: 'PENDING',
        priority: 'LOW',
        laborHours: 2,
        laborRate: 80,
        estimatedCost: 350
      }
    ];

    let jobCount = await prisma.job.count();

    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];
      const mechanic = allMechanics[i % allMechanics.length];
      
      jobCount++;
      const jobNumber = `J${String(jobCount).padStart(4, '0')}`;

      const job = await prisma.job.create({
        data: {
          jobNumber,
          customerId: jobData.customer.id,
          vehicleId: jobData.customer.vehicles[0].id,
          complaint: jobData.complaint,
          status: jobData.status as any,
          priority: jobData.priority as any,
          assignedTo: mechanic.id,
          laborHours: jobData.laborHours,
          laborRate: jobData.laborRate,
          estimatedCost: jobData.estimatedCost,
          ...(jobData.status === 'COMPLETED' && {
            startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            actualCost: jobData.estimatedCost
          }),
          ...(jobData.status === 'IN_PROGRESS' && {
            startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          })
        }
      });

      console.log(`✅ Job created: ${job.jobNumber} for ${jobData.customer.name}`);
    }
  }

  console.log('\n🎉 Database seeding completed successfully!');
  
  console.log('\n📋 Summary:');
  console.log(`   - ${await prisma.user.count()} users created`);
  console.log(`   - ${await prisma.customer.count()} customers created`);
  console.log(`   - ${await prisma.vehicle.count()} vehicles created`);
  console.log(`   - ${await prisma.inventory.count()} inventory items created`);
  console.log(`   - ${await prisma.job.count()} jobs created`);
  
  console.log('\n🔐 Default Credentials:');
  console.log('   Admin: admin@biskaken.com / admin123');
  console.log('   Mechanics: mechanic123 (for all mechanics)');
  
  console.log('\n🚀 You can now start the server with: npm run dev');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });