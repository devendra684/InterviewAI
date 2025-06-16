import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to preprocess code before generating embeddings
function preprocessCode(code: string, language: string): string {
  // Remove comments
  const withoutComments = code.replace(/\/\/.*$/gm, '')  // Single line comments
                            .replace(/\/\*[\s\S]*?\*\//g, '');  // Multi-line comments
  
  // Normalize whitespace while preserving structure
  const normalized = withoutComments
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  
  // Add language context
  return `Language: ${language}\nCode:\n${normalized}`;
}

// Function to generate embeddings for code
export async function generateCodeEmbedding(code: string, language: string): Promise<number[]> {
  try {
    // Preprocess the code
    const processedCode = preprocessCode(code, language);
    
    // Generate embedding using OpenAI
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: processedCode,
      encoding_format: "float"
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating code embedding:', error);
    throw error;
  }
}

// Function to generate embeddings for multiple code snippets
export async function generateCodeEmbeddings(
  codeSnippets: Array<{ code: string; language: string }>
): Promise<number[][]> {
  try {
    const processedSnippets = codeSnippets.map(({ code, language }) => 
      preprocessCode(code, language)
    );
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: processedSnippets,
      encoding_format: "float"
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating code embeddings:', error);
    throw error;
  }
}

// Function to test OpenAI connection
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "Test connection",
      encoding_format: "float"
    });
    console.log('OpenAI connection test successful');
    return true;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
} 