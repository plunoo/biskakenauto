// Gemini AI Service for content generation
import { apiService } from './apiService';

interface AIGenerationResponse {
  success: boolean;
  data?: string;
  error?: string;
}

interface ImageGenerationResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    prompt: string;
  };
  error?: string;
}

// Fallback AI content generation using API
export const getAIInsights = async (prompt: string): Promise<string[]> => {
  try {
    // First try to use the API service for AI generation
    const response = await apiService.generateAIContent(prompt);
    if (response.success && response.data) {
      return [response.data];
    }
    
    // Fallback to local AI generation logic
    return generateFallbackContent(prompt);
  } catch (error) {
    console.error('AI Insights generation failed:', error);
    return generateFallbackContent(prompt);
  }
};

// Generate AI content using direct Gemini API call
export const generateAIContent = async (prompt: string, type: 'title' | 'excerpt' | 'content'): Promise<AIGenerationResponse> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('No Gemini API key found, using fallback content');
      return {
        success: true,
        data: generateFallbackContent(prompt)[0]
      };
    }

    const enhancedPrompt = enhancePromptForType(prompt, type);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: enhancedPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: type === 'title' ? 0.8 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: type === 'content' ? 1000 : type === 'excerpt' ? 200 : 50,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return {
        success: true,
        data: data.candidates[0].content.parts[0].text.trim()
      };
    } else {
      throw new Error('No content generated');
    }
  } catch (error) {
    console.error('Gemini AI generation failed:', error);
    return {
      success: true,
      data: generateFallbackContent(prompt)[0]
    };
  }
};

// Generate AI image using backend API
export const generateAIImage = async (prompt: string, style?: 'realistic' | 'illustration' | 'abstract'): Promise<ImageGenerationResponse> => {
  try {
    // Try to use the backend API for image generation
    const response = await apiService.generateAIImage({
      prompt: `Automotive ${style || 'realistic'}: ${prompt}`,
      style: style || 'realistic'
    });
    
    if (response.success) {
      return response;
    }
    
    // Fallback to external image generation service or placeholder
    return {
      success: true,
      data: {
        imageUrl: generatePlaceholderImage(prompt),
        prompt: prompt
      }
    };
  } catch (error) {
    console.error('AI Image generation failed:', error);
    return {
      success: false,
      error: 'Image generation failed. Please try again or upload an image manually.'
    };
  }
};

// Enhance prompts based on content type
function enhancePromptForType(prompt: string, type: 'title' | 'excerpt' | 'content'): string {
  const baseContext = "You are a professional automotive blog writer for a car repair shop in Ghana. ";
  
  switch (type) {
    case 'title':
      return `${baseContext}Create a compelling, SEO-friendly blog post title. Make it engaging and click-worthy while being informative. Keep it under 60 characters for better SEO. Context: ${prompt}`;
    
    case 'excerpt':
      return `${baseContext}Write a compelling 80-120 word excerpt that summarizes the blog post and encourages readers to continue reading. Make it engaging and informative. Context: ${prompt}`;
    
    case 'content':
      return `${baseContext}Write a comprehensive, informative blog post about automotive topics relevant to Ghana. Include practical tips, local context, and actionable advice. Use a friendly but professional tone. Aim for 500-800 words with clear sections. Context: ${prompt}`;
    
    default:
      return prompt;
  }
}

// Fallback content generation for when AI services are unavailable
function generateFallbackContent(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('title')) {
    return [
      "Essential Car Maintenance Tips for Ghana's Climate",
      "How to Choose the Right Auto Parts in Accra",
      "Preventive Care for Your Vehicle in Tropical Weather",
      "Top 5 Engine Problems and Solutions",
      "Brake System Maintenance: A Complete Guide"
    ][Math.floor(Math.random() * 5)];
  }
  
  if (lowerPrompt.includes('excerpt')) {
    return [
      "Learn essential car maintenance tips specifically designed for Ghana's tropical climate. Our expert mechanics share practical advice to keep your vehicle running smoothly year-round, from dealing with dust to managing humidity effects on your car's performance."
    ];
  }
  
  if (lowerPrompt.includes('content')) {
    return [
      `# Automotive Maintenance in Ghana

Living in Ghana presents unique challenges for vehicle maintenance. The tropical climate, dusty roads, and varying fuel quality all impact how we should care for our vehicles.

## Key Maintenance Areas

### 1. Engine Care
Regular oil changes are crucial in hot climates. We recommend checking your oil level monthly and changing it every 3,000-5,000 km depending on driving conditions.

### 2. Cooling System
Your radiator works overtime in Ghana's heat. Ensure coolant levels are maintained and have the system flushed annually.

### 3. Air Filter Maintenance
Dusty roads mean your air filter needs frequent attention. Check and clean it monthly, replace when necessary.

## Local Considerations

Understanding local driving conditions helps extend your vehicle's life. Whether navigating Accra traffic or traveling upcountry, proper maintenance keeps you safe and saves money.

## Professional Help

When in doubt, consult qualified mechanics who understand vehicles in tropical conditions. Regular professional inspections can prevent major issues.

Remember: Preventive maintenance is always cheaper than repairs.`
    ];
  }
  
  return ["AI content generation is temporarily unavailable. Please write your content manually or try again later."];
}

// Generate placeholder image URL
function generatePlaceholderImage(prompt: string): string {
  const width = 800;
  const height = 400;
  const encodedPrompt = encodeURIComponent(prompt.substring(0, 50));
  
  // Use a placeholder service that generates automotive-themed images
  return `https://picsum.photos/${width}/${height}?random&automotive`;
}

export default {
  getAIInsights,
  generateAIContent,
  generateAIImage
};