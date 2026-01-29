import { connectDB, disconnectDB } from '../config/database';
import { Deal } from '../models/Deal';
import { User } from '../models/User';

const sampleDeals = [
  {
    title: 'AWS Credits for Startups',
    slug: 'aws-credits-startups',
    description: 'Get $5,000 in AWS credits for your startup. Valid for 2 years.',
    shortDescription: '$5,000 AWS Credits',
    originalPrice: 5000,
    discountedPrice: 0,
    currency: 'USD',
    category: 'Cloud',
    saasTool: 'AWS',
    dealDuration: '2 Years',
    partnerName: 'Amazon Web Services',
    partnerLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    partnerWebsite: 'https://aws.amazon.com',
    partnerDescription: 'Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud platform.',
    dealImage: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    eligibilityConditions: {
      requiresEmailVerification: true,
      requiresKYCApproval: true,
      allowedFundingStages: ['Seed', 'Series A'],
    },
    highlights: ['No credit card required', 'Instant activation'],
    tags: ['cloud', 'hosting', 'infrastructure'],
  },
  {
    title: 'HubSpot for Startups',
    slug: 'hubspot-for-startups',
    description: 'Get 90% off HubSpot for the first year.',
    shortDescription: '90% off HubSpot',
    originalPrice: 10000,
    discountedPrice: 1000,
    currency: 'USD',
    category: 'Marketing',
    saasTool: 'HubSpot',
    dealDuration: '1 Year',
    partnerName: 'HubSpot',
    partnerLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/15/HubSpot_Logo.png',
    partnerWebsite: 'https://www.hubspot.com',
    partnerDescription: 'HubSpot is a leading CRM platform that provides software and support to help companies grow better.',
    dealImage: 'https://upload.wikimedia.org/wikipedia/commons/1/15/HubSpot_Logo.png',
    eligibilityConditions: {
      requiresEmailVerification: true,
      minEmployees: 2,
      maxEmployees: 50,
    },
    highlights: ['CRM included', 'Marketing automation'],
    tags: ['crm', 'marketing', 'sales'],
  }
];

const seedDeals = async () => {
  try {
    await connectDB();
    console.log('Connected to database for seeding...');

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Please seed users first or create an admin user.');
      // Alternatively, find ANY user
      const anyUser = await User.findOne({});
      if (!anyUser) {
        console.log('No users found in database. Cannot seed deals without a creator.');
        await disconnectDB();
        return;
      }
      console.log(`Using user ${anyUser.email} as creator for deals.`);
      
      await createDeals(anyUser._id);
    } else {
      console.log(`Using admin user ${adminUser.email} as creator for deals.`);
      await createDeals(adminUser._id);
    }

    console.log('Deals seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding deals:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

const createDeals = async (userId: any) => {
  // Clear existing deals
  await Deal.deleteMany({});
  console.log('Cleared existing deals.');

  const dealsWithCreator = sampleDeals.map(deal => ({
    ...deal,
    createdBy: userId,
  }));

  await Deal.insertMany(dealsWithCreator);
  console.log(`Created ${dealsWithCreator.length} sample deals.`);
};

seedDeals();
