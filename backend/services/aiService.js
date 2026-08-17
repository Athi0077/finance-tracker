const axios = require('axios');

/**
 * Generate a response using OpenRouter
 * @param {Array} messages - The messages array for OpenAI chat completions format
 * @returns {string} - AI response
 */
const generateResponse = async (messages) => {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-4o',
      messages: messages,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error.response?.data || error.message);
    throw new Error('Failed to generate AI response. Please try again later.');
  }
};

/**
 * Specialized prompt for chat completions
 */
const chatWithFinancialAdvisor = async (context, userMessage, conversationHistory = []) => {
    const systemInstruction = `
You are the AI Financial Advisor for FinanceFlow.
Your goal is to help the user understand their financial data, provide suggestions, and answer questions.
Use the provided JSON context describing their current financial situation to answer their questions.
The context contains their current and past month's income, expenses, category budgets, goals, and subscriptions.

Rules:
1. Base your answers ONLY on the provided financial context.
2. If the user asks something outside the scope of personal finance or their data, politely decline.
3. Be concise, friendly, and helpful. 
4. Format your responses with clear spacing. Use bullet points or short paragraphs.
5. NEVER provide guaranteed financial advice, frame suggestions as "Consider...", "You could...", or "A potential option is...".
6. Do NOT mention the JSON format or how the data is passed to you.

User's Financial Context (JSON):
${JSON.stringify(context, null, 2)}
`;

    // Construct history for OpenRouter API
    const messages = [{ role: 'system', content: systemInstruction }];
    
    // Convert conversationHistory to expected format
    conversationHistory.forEach(msg => {
        messages.push({
            role: msg.role === 'model' || msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
        });
    });

    // Add current message
    messages.push({
        role: 'user',
        content: userMessage
    });

    try {
        return await generateResponse(messages);
    } catch (error) {
        console.error('Error in chatWithFinancialAdvisor:', error);
        throw new Error('Failed to get response from AI Advisor.');
    }
};

/**
 * Generates an intelligent monthly summary
 */
const generateMonthlySummary = async (context) => {
    const systemInstruction = `You are an AI generating a structured financial summary. Keep it brief, professional, and easy to read.`;
    const prompt = `
Analyze the following financial context and generate a short, intelligent monthly summary.
Include:
- High level income, expense, and savings rate.
- Highlight the highest spending category.
- Mention any overspending compared to budget.
- Compare with last month if relevant.
- Provide one actionable positive note and one recommendation for improvement.

Context:
${JSON.stringify(context, null, 2)}
`;

    const messages = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
    ];
    
    return await generateResponse(messages);
};

module.exports = {
    generateResponse,
    chatWithFinancialAdvisor,
    generateMonthlySummary
};
