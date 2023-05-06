const express = require('express');
const puppeteer = require('puppeteer');
require("dotenv").config();


const app = express();
const port = 3000;

app.use(express.json());

app.get('/', async (req, res) => {
  res.json({meesage: "goto /get-recalls"})
});


app.post('/get-recalls', async (req, res) => {
  const pathToJson = req.body.pathToJson;
  try {
    const jsonResults = await getRecalls(pathToJson);
    res.json(jsonResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

async function getRecalls(pathToJson) {
  const url = 'https://cirr.cecs.anu.edu.au/test_process/'; // Replace with your website's URL

  // Configure Puppeteer
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote"
    ],
    executablePath:
      process.env.NODE_ENV === "production" 
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  })
  // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH});
  // headless: 'new' 
  const page = await browser.newPage();


  // Navigate to the URL
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Perform additional interactions before filling the form

  // Scroll the page
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  // Delay before filling the form
  await page.waitForTimeout(randomDelay(2000, 4000));

  // Find the form fields and fill them
  await page.type('#id_email_name', 'stadn@gmail.com');
  const fileInput = await page.$('#id_in_file');
  await fileInput.uploadFile(pathToJson);

  // Delay before submitting the form
  await page.waitForTimeout(randomDelay(2000, 4000));

  // Submit the form
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2000); // Additional delay
  const submitButton = await page.$('button[type="submit"]');
  await submitButton.click();

  // Wait for the table to load
  await page.waitForSelector('table[summary="Recall_scores"]');

  // Extract the data from the table
  const data = await page.$$eval('table[summary="Recall_scores"] tbody tr', (rows) => {
    const results = {};
    for (const row of rows) {
      const [recall, score] = row.querySelectorAll('td');
      results[recall.innerText] = parseFloat(score.innerText);
    }
    return results;
  });

  // Close the browser
  await browser.close();

  return data;
}

function randomDelay(min, max) {
  return Math.random() * (max - min) + min;
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
