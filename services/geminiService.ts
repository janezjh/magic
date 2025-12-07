import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlayerStats, TurnResponse, InventoryItem } from "../types";

let aiInstance: GoogleGenAI | null = null;

// Lazy initialization to prevent "process is not defined" errors during module loading
const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

const SYSTEM_INSTRUCTION = `
You are the "Earth Online" (地球Online) System Assistant.
Role: A female AI, smart, calm, lively, strict.
Language: SIMPLIFIED CHINESE (简体中文) ONLY.
Task: Manage the player's real-life stats based on their text input.

Core Rules:
1. Stats: 智力 (INT), 体力 (STR), 魅力 (CHA), 金钱 (Money), 疲劳度 (Fatigue 0-100), 灵感 (Inspiration 0-50).
2. Mechanics:
   - Analyze user input (e.g., "背单词1小时") -> Deduce stat changes (e.g., 智力+1, 疲劳度+2).
   - If Fatigue > 100, warn user strictly to rest.
   - Recognize item usage/gain (e.g., "买了一杯咖啡") -> Update inventory.
   - Rewards: Daily/Weekly tasks give Inspiration.
3. Tone:
   - Speak like a sci-fi system interface but with personality (Live 2D style).
   - Be strict about laziness.
   - Be encouraging about progress.
   - Use emojis.
   - Output style example: "【📢 系统反馈】... 【📊 属性变动】..."

Output JSON ONLY. The structure MUST be exactly as requested.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    system_feedback: {
      type: Type.STRING,
      description: "The conversation response to the user in Chinese. Witty, strict, or encouraging.",
    },
    stat_changes: {
      type: Type.OBJECT,
      properties: {
        int: { type: Type.INTEGER, description: "Change in Intelligence" },
        str: { type: Type.INTEGER, description: "Change in Strength" },
        cha: { type: Type.INTEGER, description: "Change in Charm" },
        fatigue: { type: Type.INTEGER, description: "Change in Fatigue" },
        money: { type: Type.INTEGER, description: "Change in Money" },
        inspiration: { type: Type.INTEGER, description: "Change in Inspiration points" },
      },
      required: ["int", "str", "cha", "fatigue", "money", "inspiration"],
    },
    inventory_updates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity_change: { type: Type.INTEGER },
        },
        required: ["name", "quantity_change"],
      },
    },
    is_level_up: {
      type: Type.BOOLEAN,
      description: "True if the inspiration gain caused a level up.",
    },
  },
  required: ["system_feedback", "stat_changes", "inventory_updates", "is_level_up"],
};

export const processGameTurn = async (
  userInput: string,
  currentStats: PlayerStats,
  inventory: InventoryItem[]
): Promise<TurnResponse> => {
  try {
    const ai = getAI();
    const model = "gemini-2.5-flash";
    
    // Construct context
    const contextPrompt = `
      Current Player Stats:
      Level: ${currentStats.level}
      Role: ${currentStats.role}
      Goal: ${currentStats.currentGoal}
      INT: ${currentStats.int}
      STR: ${currentStats.str}
      CHA: ${currentStats.cha}
      Money: ${currentStats.money}
      Fatigue: ${currentStats.fatigue}/100
      Inspiration: ${currentStats.inspiration}/50
      
      Current Inventory: ${inventory.map(i => `${i.name} x${i.count}`).join(', ')}

      User Input: "${userInput}"
      
      Determine the outcome in Chinese.
      If the user performed a task, award stats and increase fatigue.
      If the user rested, decrease fatigue.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as TurnResponse;

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback response to prevent app crash
    return {
      system_feedback: "⚠️ 系统错误: 连接主机失败。请重试。",
      stat_changes: { int: 0, str: 0, cha: 0, fatigue: 0, money: 0, inspiration: 0 },
      inventory_updates: [],
      is_level_up: false,
    };
  }
};

export const generateInitialGreeting = async (role: string, goal: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `The player has initialized as a "${role}" with the goal: "${goal}". Welcome them to Earth Online in Chinese. Be brief, mysterious, and lively.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });
        return response.text || "欢迎来到地球Online。初始化完成。";
    } catch (e) {
        console.error("Greeting Error:", e);
        return "欢迎来到地球Online。";
    }
}