const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate a bedtime story using OpenAI's GPT-4 model
const generateStoryWithOpenAI = async ({
  character,
  setting,
  theme,
  ageGroup = "3-5",
}) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a talented children's bedtime story writer. Create engaging, gentle, and age-appropriate stories that help children relax and fall asleep. Keep stories positive, educational, and calming.`,
        },
        {
          role: "user",
          content: `Write a bedtime story for children aged ${ageGroup} featuring:
- Main character: ${character}
- Setting: ${setting}
- Theme/lesson: ${theme}

Please respond in this exact JSON format:
{
  "title": "A catchy, child-friendly title",
  "story": "The complete bedtime story here...",
  "summary": "A brief 1-2 sentence summary of the story",
  "imageDescription": "A detailed description of an illustration for this story, suitable for an AI image generator. Include the main Character : ${character}, Setting: ${setting} , Theme/lesson: ${theme}, mood, colors, and style appropriate for children's book illustration."
}
Make it approximately 150-300 words, with simple language and a peaceful ending that encourages sleep.`,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    console.log("OpenAI story generation response:", completion.choices[0].message.content);
    // Parse the JSON response
    const parsedResponse = (completion.choices[0].message.content);
    return parsedResponse;
  } catch (error) {
    console.error("OpenAI story generation error:", error);
    throw new Error(`Story generation failed: ${error.message}`);
  }
};

// Generate an image using OpenAI's DALL-E model with the imageDescription
const generateImageWithOpenAI = async (imageDescription) => {
  try {
    // Add emphasis on no text to the existing image description
    const enhancedPrompt = `${imageDescription} Pure visual illustration only - no text, no words, no letters, no titles, no captions, no speech bubbles, no written elements of any kind.`;
    
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    return {
      imageUrl: result.data[0].url,
      revisedPrompt: result.data[0].revised_prompt,
    };
  } catch (error) {
    console.error("OpenAI image generation error:", error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
};


module.exports = {
  generateStoryWithOpenAI,
  generateImageWithOpenAI,
};
