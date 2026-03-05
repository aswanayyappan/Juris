/**
 * POST /api/chat
 * AI-powered court case Q&A using Gemini + SQLite.
 * Extracts keywords from user query, searches cases.db, and returns
 * a refined legal response.
 */

const express = require('express');
const router  = express.Router();
const Groq = require('groq-sdk');
const db = require('../lib/sqliteDb');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Helper: search court_cases table ──────────────────────────────────────────
async function fetchCaseDetails(searchTerm) {
  if (!searchTerm || searchTerm.toLowerCase() === 'none' || searchTerm.toLowerCase() === 'conversation') return null;
  
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT case_number, court_name, case_type, petitioner_name, petitioner_name as respondent_name,
             prosecutor_name, crime_number, police_station, case_details,
             status, judgment_date, acquitted, additional_info
      FROM court_cases
      WHERE LOWER(petitioner_name) LIKE LOWER(?)
         OR LOWER(respondent_name) LIKE LOWER(?)
         OR LOWER(prosecutor_name) LIKE LOWER(?)
         OR LOWER(case_number) LIKE LOWER(?)
         OR LOWER(crime_number) LIKE LOWER(?)
         OR LOWER(case_details) LIKE LOWER(?)
      LIMIT 2
    `;

    const like = `%${searchTerm}%`;
    const params = [like, like, like, like, like, like];

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('[Chat] ❌ Database error:', err);
        resolve(null);
      } else {
        resolve(rows && rows.length > 0 ? rows : null);
      }
    });
  });
}

// ── Route ─────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.json({ reply: '📢 Please enter a valid query.' });
  }

  try {
    const systemPrompt = `You are the JURIS Legal Assistant, a premium and authoritative AI specialized in Indian Law. 
    Your tone must be professional, direct, and empathetic. 
    CRITICAL: Go straight to the answer without meta-filler. 
    Use RICH MARKDOWN: Enforce the use of headers (###), bolding (**), bullet points, and tables (|) for structured comparisons. 
    Your goal is to provide beautiful, clean, and highly professional legal documentation in the chat.`;

    // 1. Determine if we should search or just respond
    const analysisPrompt = `Analyze this user message: "${userMessage}". 
    Is the user looking for a specific court case, FIR, or person in legal records? 
    If YES, output ONLY the search term (name or number). 
    If NO, output ONLY the word "CONVERSATION".`;

    const analysisCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_completion_tokens: 50,
    });

    const analysis = analysisCompletion.choices[0]?.message?.content?.trim() || 'CONVERSATION';

    let caseData = null;
    if (analysis && analysis !== 'CONVERSATION') {
      caseData = await fetchCaseDetails(analysis);
    }

    // 2. Build the final response
    let finalPrompt = "";
    if (caseData) {
      const caseText = caseData.map(c => JSON.stringify(c)).join('\n');
      finalPrompt = `User Query: "${userMessage}"
      Database Context:
      ${caseText}

      Task: Provide a structured, professional summary of these findings. 
      - Use **Bold Headers** for sections.
      - Use Bullet points for case details.
      - Be direct - no intro filler.`;
    } else {
      finalPrompt = `User Query: "${userMessage}"
      
      Task: Provide a helpful, professional legal response based on Indian Law. 
      - If they were looking for a specific case (Analysis: ${analysis}) and no data was found, start by stating: "I could not find an exact match in our current case database, but here is general legal guidance on this topic."
      - Use **Bold Headers** for the process steps.
      - Use Bullet points for requirements.
      - DO NOT explain why you are providing the response. Just provide it.`;
    }

    const finalCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: finalPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_completion_tokens: 1024,
    });

    const responseText = finalCompletion.choices[0]?.message?.content;

    res.json({ reply: responseText || '🤖 I am here to help, but I encountered a slight issue. Could you please rephrase?' });
  } catch (error) {
    console.error('[Chat] ❌ Error:', error);
    res.json({ reply: '❌ An error occurred while processing your legal query via Groq. Please try again.' });
  }
});

module.exports = router;
