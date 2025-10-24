// scripts/seedRentalCompanies.js
const mongoose = require('mongoose');
require('dotenv').config();

const RentalCompany = require('../models/RentalCompany');
const Vehicle = require('../models/Vehicle');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const rentalCompanies = [
    {
        rental_id: "RENT001",
        rental_name: "Swift Wheels Rentals",
        location: "Kochi",
        region: "Ernakulam",
        address: {
            street: "MG Road, Near Marine Drive",
            city: "Kochi",
            pincode: "682011",
            state: "Kerala"
        },
        contact: {
            phone: "+919876543210",
            email: "swiftwheels@example.com"
        }
    },
    {
        rental_id: "RENT002",
        rental_name: "Royal Drive Rentals",
        location: "Bangalore",
        region: "Karnataka",
        address: {
            street: "Brigade Road, Near UB City",
            city: "Bangalore",
            pincode: "560001",
            state: "Karnataka"
        },
        contact: {
            phone: "+919876543211",
            email: "royaldrive@example.com"
        }
    },
    {
        rental_id: "RENT003",
        rental_name: "City Car Rentals",
        location: "Mumbai",
        region: "Maharashtra",
        address: {
            street: "Marine Drive, Near Gateway of India",
            city: "Mumbai",
            pincode: "400001",
            state: "Maharashtra"
        },
        contact: {
            phone: "+919876543212",
            email: "citycar@example.com"
        }
    },
    {
        rental_id: "RENT004",
        rental_name: "Delhi Drive Rentals",
        location: "Delhi",
        region: "Delhi",
        address: {
            street: "Connaught Place, Near Central Park",
            city: "Delhi",
            pincode: "110001",
            state: "Delhi"
        },
        contact: {
            phone: "+919876543213",
            email: "delhidrive@example.com"
        }
    }
];

const seedRentalCompanies = async () => {
    try {
        console.log('Starting rental companies seeding...');

        // Clear existing rental companies
        await RentalCompany.deleteMany({});
        console.log('Cleared existing rental companies');

        // Insert rental companies
        const createdCompanies = await RentalCompany.insertMany(rentalCompanies);
        console.log(`Created ${createdCompanies.length} rental companies`);

        // Update vehicles to associate them with rental companies
        const vehicles = await Vehicle.find({});
        console.log(`Found ${vehicles.length} vehicles to update`);

        let updatedCount = 0;
        for (let i = 0; i < vehicles.length; i++) {
            const vehicle = vehicles[i];
            
            // Check if vehicle has required fields before updating
            if (vehicle.make && vehicle.model && vehicle.year && vehicle.type && 
                vehicle.location && vehicle.description && vehicle.pricePerDay && vehicle.pricePerHour) {
                
                // Assign vehicles to rental companies in a round-robin fashion
                const companyIndex = i % createdCompanies.length;
                const rentalCompany = createdCompanies[companyIndex];

                vehicle.rentalCompany = rentalCompany._id;
                await vehicle.save();
                updatedCount++;

                console.log(`Updated vehicle ${vehicle.make} ${vehicle.model} to ${rentalCompany.rental_name}`);
            } else {
                console.log(`Skipped vehicle ${vehicle._id} - missing required fields`);
            }
        }

        console.log(`Successfully updated ${updatedCount} vehicles`);

        console.log('✅ Rental companies seeding completed successfully!');
        console.log('\n📋 Summary:');
        createdCompanies.forEach(company => {
            console.log(`- ${company.rental_name} (${company.rental_id}) - ${company.location}, ${company.region}`);
        });

    } catch (error) {
        console.error('❌ Error seeding rental companies:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the seeding
connectDB().then(() => {
    seedRentalCompanies();
});

module.exports = { seedRentalCompanies };
