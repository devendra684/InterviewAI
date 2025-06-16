import { generateCodeEmbedding } from '../lib/openai';
import vectorPool from '../lib/vectorDb';

interface CodeEmbeddingResult {
  success: boolean;
  error?: string;
  embeddingId?: number;
}

// Service for generating, storing, searching, and managing code embeddings using OpenAI and pgvector
export class CodeEmbeddingService {
  // Store a single code embedding for a code snapshot
  static async storeCodeEmbedding(
    codeSnapshotId: string,
    interviewId: string,
    code: string,
    language: string
  ): Promise<CodeEmbeddingResult> {
    try {
      console.log(`[Embedding] Generating embedding for snapshot: ${codeSnapshotId}, interview: ${interviewId}`);
      // Generate embedding using OpenAI
      const embedding = await generateCodeEmbedding(code, language);
      console.log(`[Embedding] Raw embedding received. Type: ${typeof embedding}, Length: ${embedding.length}`);
      // Validate embedding shape and values
      if (!Array.isArray(embedding) || embedding.length !== 1536 || embedding.some(e => typeof e !== 'number' || isNaN(e))) {
        console.error('[Embedding] Invalid embedding:', embedding);
        return { success: false, error: 'Invalid embedding values or length' };
      }
      // Convert embedding array to string for pgvector
      const embeddingStr = `[${embedding.join(',')}]`;
      // Log the embedding string (first 100 chars for brevity)
      console.log('[Embedding] Embedding length:', embedding.length, 'Sample:', embeddingStr.slice(0, 100));
      // Store embedding in vector database (pgvector)
      const result = await vectorPool.query(
        `INSERT INTO code_embeddings (code_snapshot_id, interview_id, embedding)
         VALUES ($1, $2, $3::vector)
         ON CONFLICT (code_snapshot_id) 
         DO UPDATE SET 
           embedding = $3::vector,
           created_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [codeSnapshotId, interviewId, embeddingStr]
      );
      console.log(`[Embedding] Successfully stored embedding for snapshot: ${codeSnapshotId}, DB id: ${result.rows[0].id}`);
      return {
        success: true,
        embeddingId: result.rows[0].id
      };
    } catch (error) {
      console.error('[Embedding] Error storing code embedding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Find similar code snippets using vector similarity search
  static async findSimilarCode(
    code: string,
    language: string,
    limit: number = 5,
    interviewId?: string
  ): Promise<{ codeSnapshotId: string; similarity: number }[]> {
    try {
      console.log(`[Embedding] Finding similar code for language: ${language}, limit: ${limit}`);
      
      // Generate embedding for the query code
      const queryEmbedding = await generateCodeEmbedding(code, language);
      console.log(`[Embedding] Generated query embedding, length: ${queryEmbedding.length}`);
      
      // Convert embedding array to string for pgvector
      const embeddingStr = `[${queryEmbedding.join(',')}]`;
      
      // Build and execute similarity search query
      const query = `
        SELECT 
          code_snapshot_id,
          1 - (embedding <=> $1::vector) as similarity
        FROM code_embeddings
        ${interviewId ? 'WHERE interview_id = $3' : ''}
        ORDER BY embedding <=> $1::vector
        LIMIT $2
      `;
      
      console.log(`[Embedding] Executing similarity search query with limit ${limit}`);
      const params = interviewId 
        ? [embeddingStr, limit, interviewId]
        : [embeddingStr, limit];
      
      const result = await vectorPool.query(query, params);
      console.log(`[Embedding] Found ${result.rows.length} similar code snippets`);
      
      // Log the top 3 similarities for debugging
      if (result.rows.length > 0) {
        console.log('[Embedding] Top similarities:', 
          result.rows.slice(0, 3).map(row => 
            `ID: ${row.code_snapshot_id}, Similarity: ${row.similarity}`
          )
        );
      }
      
      return result.rows.map(row => ({
        codeSnapshotId: row.code_snapshot_id,
        similarity: row.similarity
      }));
    } catch (error) {
      console.error('[Embedding] Error finding similar code:', error);
      throw error;
    }
  }

  // Delete a code embedding by snapshot ID
  static async deleteCodeEmbedding(codeSnapshotId: string): Promise<boolean> {
    try {
      await vectorPool.query(
        'DELETE FROM code_embeddings WHERE code_snapshot_id = $1',
        [codeSnapshotId]
      );
      return true;
    } catch (error) {
      console.error('Error deleting code embedding:', error);
      return false;
    }
  }

  // Get embedding vector by code snapshot ID
  static async getCodeEmbedding(codeSnapshotId: string): Promise<number[] | null> {
    try {
      const result = await vectorPool.query(
        'SELECT embedding FROM code_embeddings WHERE code_snapshot_id = $1',
        [codeSnapshotId]
      );
      // Parse the vector string back to array if needed
      if (result.rows[0]?.embedding) {
        return result.rows[0].embedding
          .trim()
          .slice(1, -1) // Remove [ and ]
          .split(',')
          .map(Number);
      }
      return null;
    } catch (error) {
      console.error('Error getting code embedding:', error);
      return null;
    }
  }

  // Update an existing code embedding
  static async updateCodeEmbedding(
    codeSnapshotId: string,
    code: string,
    language: string
  ): Promise<CodeEmbeddingResult> {
    try {
      console.log(`[Embedding] Updating embedding for snapshot: ${codeSnapshotId}`);
      // Generate new embedding
      const embedding = await generateCodeEmbedding(code, language);
      const embeddingStr = `[${embedding.join(',')}]`;
      // Update embedding in database
      const result = await vectorPool.query(
        `UPDATE code_embeddings 
         SET embedding = $2::vector, created_at = CURRENT_TIMESTAMP
         WHERE code_snapshot_id = $1
         RETURNING id`,
        [codeSnapshotId, embeddingStr]
      );
      return {
        success: true,
        embeddingId: result.rows[0]?.id
      };
    } catch (error) {
      console.error('Error updating code embedding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 