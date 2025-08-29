import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat } from '@google/genai';

// This is a placeholder for the environment variable
// In a real Applet environment, this would be provided.
declare const process: any;

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    // IMPORTANT: In a real environment, the API key would be securely managed.
    // For this applet, we are assuming `process.env.API_KEY` is available.
    if (typeof process === 'undefined' || !process.env?.API_KEY) {
        console.warn("API_KEY environment variable not found. Using a placeholder. The app will not function correctly without a valid API key.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env?.API_KEY ?? 'YOUR_API_KEY_HERE' });
  }

  private getSystemInstruction(): string {
    return `You are an expert Dungeon Master for a text-based adventure game.
The tone and style are inspired by the dark fantasy world of Baldur's Gate 3. Be descriptive, gritty, and engaging.
Your role is to describe the world, the challenges, and the non-player characters.
The player will provide you with their character's details (name, backstory, stats) at the beginning of the adventure. You should incorporate these details into the narrative.
When making checks (e.g., for strength, perception), implicitly use the character's stats to determine outcomes, but don't explicitly state dice rolls. For example, instead of "You rolled a 18", say "With your immense strength, you easily lift the gate."
Describe the scene and the situation to the player. End every response by asking 'What do you do?'.
Wait for the player's input. Based on their action, describe the outcome and the new situation.
Do not break character. You are the DM. You control the world, the NPCs, and the consequences of the player's actions.
Your first message should set the scene based on the adventure prompt and character provided, and present the player with their first choice or challenge.`;
  }

  public startChat(): void {
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: this.getSystemInstruction(),
      },
    });
  }

  public async sendMessageStream(prompt: string) {
    if (!this.chat) {
      this.startChat();
    }
    if (this.chat) {
        try {
            return this.chat.sendMessageStream({ message: prompt });
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            throw new Error("Failed to communicate with the Dungeon Master. Please check your API key and connection.");
        }
    }
    throw new Error('Chat not initialized');
  }
}
