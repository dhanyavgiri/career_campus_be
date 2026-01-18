const { GoogleGenerativeAI } = require("@google/generative-ai");
const JobAnalyse = require('./model/job-analyse.model');

// Environment variables are loaded in app.js. Read the API key from process.env here.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("Checking API Key availability:", GEMINI_API_KEY ? "Key Found" : "Key MISSING");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

exports.analyseJob = async (req, res) => {
    try {
        const { company, role, jobDescription } = req.body;

        const getCompanydata = await JobAnalyse.find({ company: company }).lean();
        console.log("Existing analyses for company:", getCompanydata);

        if (getCompanydata.length > 0) {
            return res.status(200).json({ message: 'Job analysis already exists for this company', ...getCompanydata[0] });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are a career assistant. Analyze the following job description and provide the required skills (both hard and soft), interview rounds with focus areas, and potential interview questions with answers categorized by topic.

        Job Description: ${jobDescription}
        

        Please respond in the following JSON format:
        {
            "requiredSkills": {
                "hardSkills": [/* list of hard skills */],
                "softSkills": [/* list of soft skills */]
            },
            "interviewRounds": [
                {
                    "roundName": "/* name of the round */",
                    "focusAreas": [/* list of focus areas */]
                }
            ],
            "interviewQA": [
                {
                    "question": "/* interview question */",
                    "answer": "/* suggested answer */",
                    "topic": "/* topic category */"
                }
            ]
        }

                ALSO, generate two networking drafts:
        1. 'linkedinMessage': A short, punchy connection request (max 300 chars) for a recruiter.
        2. 'coldEmail': A professional email to a hiring manager including a Subject Line, 
            mentioning specific skills from the JD and why I am a fit.

        Update the JSON structure to:
        {
            "requiredSkills": { ... },
            "interviewRounds": [ ... ],
            "interviewQA": [ ... ],
            "outreach": {
            "linkedin": "",
            "emailSubject": "",
            "emailBody": ""
            }
        }
        `;

        const result = await model.generateContent(prompt);
        const analysis = JSON.parse(result?.response?.text());
        console.log("Generative AI response:", result, result?.response?.text());

        const jobAnalyse = new JobAnalyse({
            company,
            role,
            jobDescription,
            analysis
        });

        await jobAnalyse.save();
        const getAnalyseData = await JobAnalyse.find({ company: company }).lean();

        res.status(200).json({ message: 'Job analysis completed', ...getAnalyseData[0] });
    }
    catch (error) {
        console.error('Error during job analysis:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}