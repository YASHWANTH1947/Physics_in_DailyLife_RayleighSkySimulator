import { GoogleGenAI } from "@google/genai";

export const explainSkyPhysics = async (sunAngle: number, pathLength: number): Promise<string> => {
  try {
    // Initialize the client inside the function to avoid top-level crashes
    // if the environment variable is missing during module import.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.warn("API_KEY is missing. AI explanation feature will be disabled.");
      return "Simulation is running in offline mode. AI explanations require a valid API_KEY in the environment variables.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const timeOfDay = sunAngle < 20 ? "Sunrise" : sunAngle > 160 ? "Sunset" : "Midday";
    
    const prompt = `
      You are a friendly physics professor explaining Rayleigh Scattering to a student.
      
      Current Simulation State:
      - Sun Angle: ${sunAngle.toFixed(1)} degrees (0° is sunrise, 90° is noon, 180° is sunset).
      - Time of Day: ${timeOfDay}.
      - Atmosphere Path Length Factor: ${pathLength.toFixed(2)}x (relative to vertical).
      
      Explain concisely (max 3 sentences) why the sky looks the way it does right now in the simulation. 
      Focus on the relationship between path length and blue/red light scattering.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "Unable to generate explanation at the moment.";
  } catch (error) {
    console.error("Error fetching explanation:", error);
    return "The AI physicist is currently offline. Please check your connection and API key.";
  }
};