const mongoose = require('mongoose');

const JobAnalyseSchema = new mongoose.Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    jobDescription: { type: String, required: true },
    analysis: {
        requiredSkills: {
            hardSkills: [String],
            softSkills: [String]
        },
        interviewRounds: [{
            roundName: String,
            focusAreas: [String],
        }],
        interviewQA: [{
            question: String,
            answer: String,
            topic: String
        }],
        outreach: {
            linkedin: String,
            emailSubject: String,
            emailBody: String
        }
    },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Wishlist', 'Applied', 'Interviewing'], default: 'Wishlist' }
});

module.exports = mongoose.model('JobAnalyse', JobAnalyseSchema);