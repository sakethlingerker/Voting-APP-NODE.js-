const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/voting')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

const User = require('./models/user');
const Candidate = require('./models/candidate');

const users = require('./dummy data/user.js');
const candidates = require('./dummy data/candidate.js');

async function seedData() {
    try {
        console.log('Seeding Database...');
        
        // Insert candidates
        for (const candidate of candidates) {
            const existing = await Candidate.findOne({ name: candidate.name });
            if (!existing) {
                const newCandidate = new Candidate(candidate);
                await newCandidate.save();
                console.log(`Inserted candidate: ${candidate.name}`);
            } else {
                console.log(`Candidate ${candidate.name} already exists.`);
            }
        }

        // Insert users
        for (const user of users) {
            const existing = await User.findOne({ aadharCardNumber: user.aadharCardNumber });
            if (!existing) {
                const newUser = new User(user);
                await newUser.save();
                console.log(`Inserted user: ${user.name}`);
            } else {
                console.log(`User ${user.name} already exists.`);
            }
        }

        console.log('Data seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seedData();
