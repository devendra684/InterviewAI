import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool for the vector database
const vectorPool = new Pool({
  host: process.env.VECTOR_DB_HOST || 'localhost',
  port: parseInt(process.env.VECTOR_DB_PORT || '5436'),
  database: process.env.VECTOR_DB_NAME,
  user: process.env.VECTOR_DB_USER,
  password: process.env.VECTOR_DB_PASSWORD
});

// Initialize the vector database
export async function initializeVectorDb() {
  try {
    // Enable the vector extension
    await vectorPool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    // Create the code_embeddings table
    await vectorPool.query(`
      CREATE TABLE IF NOT EXISTS code_embeddings (
        id SERIAL PRIMARY KEY,
        code_snapshot_id TEXT NOT NULL,
        interview_id TEXT NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(code_snapshot_id)
      );
    `);
    
    // Create vector similarity index
    await vectorPool.query(`
      CREATE INDEX IF NOT EXISTS code_embeddings_vector_idx 
      ON code_embeddings 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);
    
    // Create snapshot index
    await vectorPool.query(`
      CREATE INDEX IF NOT EXISTS code_embeddings_snapshot_idx 
      ON code_embeddings (code_snapshot_id);
    `);
    
    console.log('Vector database initialized successfully');
  } catch (error) {
    console.error('Error initializing vector database:', error);
    throw error;
  }
}

// Test the connection
export async function testVectorDbConnection() {
  try {
    const result = await vectorPool.query('SELECT 1');
    console.log('Vector database connection test successful');
    return true;
  } catch (error) {
    console.error('Vector database connection test failed:', error);
    return false;
  }
}

// Export the pool for use in other files
export default vectorPool; 