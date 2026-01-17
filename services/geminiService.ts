
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getHeraldNarration(gameState: any) {
  try {
    const prompt = `
      You are the Herald of Camelot.
      Summarize the current state of political intrigue in the court of Avalon.
      Current Missions: ${JSON.stringify(gameState.missions)}
      Players: ${gameState.players.map((p: any) => p.name).join(', ')}
      Current Leader: ${gameState.players[gameState.leaderIndex]?.name}
      Current Vote Track: ${gameState.voteTrack}/5

      Write a dramatic, 2-sentence medieval herald summary of the situation. 
      Focus on the tension between the Loyal Servants of Arthur and the Minions of Mordred.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Herald failed to speak:", error);
    return "Whispers of treason echo through the halls, but the truth remains shrouded in shadow.";
  }
}
