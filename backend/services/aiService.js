const axios = require('axios');
const Category = require('../models/Category');

/**
 * Generate a response using OpenRouter
 * @param {Array} messages - The messages array for OpenAI chat completions format
 * @param {Array} tools - Optional array of tools for function calling
 * @returns {Object} - AI message object
 */
const generateResponse = async (messages, tools = null) => {
  try {
    const payload = {
      model: 'openai/gpt-4o',
      messages: messages,
      max_tokens: 1000
    };
    if (tools) {
      payload.tools = tools;
    }
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    });
    return response.data.choices[0].message;
  } catch (error) {
    console.error('Error generating AI response:', error.response?.data || error.message);
    throw new Error('Failed to generate AI response. Please try again later.');
  }
};

/**
 * Specialized prompt for chat completions
 */
const chatWithFinancialAdvisor = async (context, userMessage, conversationHistory = [], userId = null) => {
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

    const tools = [
      {
        type: "function",
        function: {
          name: "create_category",
          description: "Create a new financial category for the user with an optional monthly budget. Call this when the user explicitly asks to create a category.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "The name of the category to create, e.g. Shopping, Groceries." },
              monthlyBudget: { type: "number", description: "The monthly budget limit for the category in the user's currency. Default is 0 if not specified." }
            },
            required: ["name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_goal",
          description: "Create a new financial savings goal.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the goal, e.g. New Car, Vacation." },
              targetAmount: { type: "number", description: "The target amount to save." },
              targetDate: { type: "string", description: "Target date to achieve the goal in YYYY-MM-DD format." }
            },
            required: ["name", "targetAmount", "targetDate"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_subscription",
          description: "Create a new recurring subscription.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the subscription, e.g. Netflix, Gym." },
              amount: { type: "number", description: "The recurring billing amount." },
              billingCycle: { type: "string", enum: ["Monthly", "Yearly", "Weekly"], description: "The billing cycle frequency." },
              categoryName: { type: "string", description: "The category name this subscription belongs to." }
            },
            required: ["name", "amount", "billingCycle"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_shared_wallet",
          description: "Create a new shared wallet.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the shared wallet, e.g. Family Trip, Couple Expenses." }
            },
            required: ["name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "add_shared_expense",
          description: "Add a new shared expense (split bill) to an existing shared wallet.",
          parameters: {
            type: "object",
            properties: {
              walletName: { type: "string", description: "The name of the shared wallet to add the expense to." },
              amount: { type: "number", description: "The total amount of the expense." },
              description: { type: "string", description: "Description of the expense, e.g. Dinner, Hotel." }
            },
            required: ["walletName", "amount", "description"]
          }
        }
      }
    ];

    try {
        let responseMsg = await generateResponse(messages, tools);

        // Check if the AI wants to call a tool
        if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0 && userId) {
            messages.push(responseMsg); // Append assistant's tool call message

            for (const toolCall of responseMsg.tool_calls) {
                try {
                    const args = JSON.parse(toolCall.function.arguments);
                    let successMsg = "";
                    
                    if (toolCall.function.name === 'create_category') {
                        let cat = await Category.findOne({ userId, name: { $regex: new RegExp(`^${args.name}$`, 'i') } });
                        if (!cat) {
                            cat = await Category.create({
                                userId, name: args.name, monthlyBudget: args.monthlyBudget || 0, icon: 'circle', color: '#6366f1'
                            });
                        }
                        successMsg = `Category '${args.name}' created successfully.`;
                    }
                    else if (toolCall.function.name === 'create_goal') {
                        const Goal = require('../models/Goal');
                        await Goal.create({
                            userId, name: args.name, targetAmount: args.targetAmount, targetDate: new Date(args.targetDate)
                        });
                        successMsg = `Goal '${args.name}' created successfully.`;
                    }
                    else if (toolCall.function.name === 'create_subscription') {
                        const Subscription = require('../models/Subscription');
                        let catId;
                        if (args.categoryName) {
                            let cat = await Category.findOne({ userId, name: { $regex: new RegExp(`^${args.categoryName}$`, 'i') } });
                            if (!cat) {
                                cat = await Category.create({ userId, name: args.categoryName, monthlyBudget: 0 });
                            }
                            catId = cat._id;
                        } else {
                            // Find or create 'Other'
                            let cat = await Category.findOne({ userId, name: 'Other' });
                            if (!cat) cat = await Category.create({ userId, name: 'Other', monthlyBudget: 0 });
                            catId = cat._id;
                        }
                        
                        // Default next billing date to next month
                        const nextDate = new Date();
                        nextDate.setMonth(nextDate.getMonth() + 1);

                        await Subscription.create({
                            userId, name: args.name, amount: args.amount, billingCycle: args.billingCycle,
                            categoryId: catId, nextBillingDate: nextDate
                        });
                        successMsg = `Subscription '${args.name}' created successfully.`;
                    }
                    else if (toolCall.function.name === 'create_shared_wallet') {
                        const SharedWallet = require('../models/SharedWallet');
                        await SharedWallet.create({
                            name: args.name, createdBy: userId, members: [userId]
                        });
                        successMsg = `Shared wallet '${args.name}' created successfully.`;
                    }
                    else if (toolCall.function.name === 'add_shared_expense') {
                        const SharedWallet = require('../models/SharedWallet');
                        const SplitBill = require('../models/SplitBill');
                        const Transaction = require('../models/Transaction');

                        const wallet = await SharedWallet.findOne({ name: { $regex: new RegExp(`^${args.walletName}$`, 'i') }, members: userId });
                        if (!wallet) {
                            throw new Error(`Wallet '${args.walletName}' not found or you are not a member.`);
                        }

                        // Equal split calculation
                        const splitAmount = args.amount / wallet.members.length;
                        const splits = wallet.members.map(memberId => ({
                            user: memberId,
                            amountOwed: splitAmount
                        }));

                        await SplitBill.create({
                            walletId: wallet._id,
                            paidBy: userId,
                            amount: args.amount,
                            description: args.description,
                            splits
                        });

                        // Create transaction for each member
                        const transactionsToCreate = wallet.members.map(memberId => ({
                            userId: memberId,
                            amount: splitAmount,
                            type: 'expense',
                            description: `Shared: ${args.description} (${wallet.name})`,
                            date: new Date(),
                            paymentMethod: 'Other'
                        }));
                        await Transaction.insertMany(transactionsToCreate);

                        successMsg = `Added expense of ${args.amount} to '${wallet.name}'. It was split equally, adding ${splitAmount} to members' expenses.`;
                    }

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ success: true, message: successMsg })
                    });
                } catch (err) {
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ success: false, message: `Failed to execute ${toolCall.function.name}: ${err.message}` })
                    });
                }
            }

            // Call AI again to get the final response based on tool execution
            responseMsg = await generateResponse(messages, tools);
        }

        return responseMsg.content;
    } catch (error) {
        console.error('Error in chatWithFinancialAdvisor:', error);
        throw new Error('Failed to get response from AI Advisor.');
    }
};

/**
 * Generates an intelligent monthly summary
 */
const generateMonthlySummary = async (context) => {
    const systemInstruction = `You are an AI generating a structured financial summary and prediction. Keep it brief, professional, and easy to read.`;
    const prompt = `
Analyze the following financial context and generate a short, intelligent monthly summary and prediction.
Include:
- High level income, expense, and savings rate.
- Highlight the highest spending category and any overspending compared to budget.
- Compare with last month if relevant.
- Predict their expense and spending pattern for the upcoming month based on this data.
- Provide one actionable positive note and one recommendation for improvement.

Context:
${JSON.stringify(context, null, 2)}
`;

    const messages = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
    ];
    
    const responseMsg = await generateResponse(messages);
    return responseMsg.content;
};

/**
 * Scans a receipt image and extracts transaction details
 * @param {string} base64Image - The image data url (e.g. data:image/jpeg;base64,...)
 */
const scanReceiptImage = async (base64Image) => {
    const prompt = `
You are a highly accurate receipt parsing AI. 
Extract the total amount, the date of the transaction, and a short description (like the merchant name).
Return ONLY a valid JSON object with the following keys and format, no markdown formatting or backticks:
{
  "amount": number (just the number, e.g. 15.99),
  "date": "YYYY-MM-DD",
  "description": "Short description or merchant name"
}
If you cannot find a value, use null.
`;

    const messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: base64Image } }
            ]
        }
    ];

    try {
        const responseMsg = await generateResponse(messages);
        const responseStr = responseMsg.content;
        // The AI might wrap it in ```json ... ```, so clean it
        const cleanStr = responseStr.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanStr);
    } catch (error) {
        console.error('Error parsing receipt:', error);
        throw new Error('Failed to extract data from receipt.');
    }
};

module.exports = {
    generateResponse,
    chatWithFinancialAdvisor,
    generateMonthlySummary,
    scanReceiptImage
};
