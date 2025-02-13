const axios = require("axios");
require("dotenv").config();

const LLM_API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.LLM_API_KEY; // Ensure this is set in .env

exports.processDoctorNotes = async (note) => {
  try {
    const response = await axios.post(
      LLM_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a medical assistant. Extract actionable steps from doctor's notes and return JSON inside a code block.",
          },
          {
            role: "user",
            content: `Extract actionable steps from the following medical note and format it in JSON:\n\n"${note}"\n\nReturn the output **inside a Markdown code block**, like this:\n\n\`\`\`json\n{\n  "checklist": ["Task 1", "Task 2"],\n  "plan": [\n    { "action": "Action 1", "schedule": "Schedule 1" },\n    { "action": "Action 2", "schedule": "Schedule 2" }\n  ]\n}\n\`\`\`\n\nDo not include any other text before or after the JSON block.`,
          },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      !response.data ||
      !response.data.choices ||
      response.data.choices.length === 0
    ) {
      throw new Error("Invalid API response format");
    }

    const completion = response.data.choices[0]?.message?.content?.trim();
    if (!completion) throw new Error("Empty response from LLM");

    console.log("Raw LLM Response:", completion); // Debugging output

    // ✅ Extract JSON from markdown block (removes ```json ... ```)
    const jsonMatch = completion.match(/```json\n([\s\S]+?)\n```/);
    if (!jsonMatch) throw new Error("Failed to extract JSON from response.");

    const parsedResponse = JSON.parse(jsonMatch[1]);

    return {
      checklist: parsedResponse.checklist || [],
      plan: parsedResponse.plan || [],
    };
  } catch (error) {
    console.error("LLM API Error:", error.response?.data || error.message);
    throw new Error("Failed to process doctor notes.");
  }
};
