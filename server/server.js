// Import required modules
import express from 'express';
import bodyParser from 'body-parser';
import { ChatOpenAI } from "@langchain/openai";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Define __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI Chat model
const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

// Route to handle root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Definieer een variabele om de punten bij te houden
let userPoints = 0;

// Endpoint om een punt toe te voegen voor elk goed geraden land
app.post('/addPoint', (req, res) => {
    userPoints++; // Voeg één punt toe voor elk goed geraden land
    res.json({ points: userPoints }); // Stuur het aantal punten terug naar de client
});


// Endpoint to fetch regions
app.get('/regions', async (req, res) => {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Failed to fetch regions');
        }
        const countries = await response.json();
        const regions = [...new Set(countries.map(country => country.region))];
        res.json(regions.filter(region => region !== ''));
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to generate a random fact about a specific country
app.post('/randomFact', async (req, res) => {
    try {
        const countryName = req.body.country;
        const region = req.body.region;
        const personality = req.body.personality;

       const prompt = `Provide a fact about ${countryName} from ${region} as if you are a ${personality} so people can guess which country it is make the fact funny. (example, if you were a cave man: "Me tell you 'bout land with big drink called beer and flat food called waffles. 
            In big village, there be statue of little boy doing pee-pee. Where this land be? Me not know!") Remember, NEVER mention the name of the Country in your response!`;
        const response = await model.invoke(prompt);
        const content = response.content;

        res.json({ fact: content, country: countryName });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to evaluate the user's answer
app.post('/evaluateAnswer', async (req, res) => {
    try {
        const answer = req.body.answer;
        const fact = req.body.fact;

        // Call OpenAI model to evaluate the answer
        const response = await model.invoke(fact + ' Is this fact related to the answer provided by the user? ' + answer);
        const content = response.content;
        const correct = content.includes('Yes');

        res.json({ correct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
