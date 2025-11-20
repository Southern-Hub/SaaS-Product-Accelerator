import { Pool, QueryResult } from 'pg';
import { ProductAnalysisComplete } from './schemas';

// ============================================================================
// Database Client Setup
// ============================================================================

let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        pool = new Pool({
            connectionString,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });
    }

    return pool;
}

// ============================================================================
// Product Functions
// ============================================================================

interface ProductBasic {
    id: string;
    productSlug: string;
    source: string;
    sourceUrl: string;
    name: string;
    tagline: string | null;
}

/**
 * Get or create a product record
 */
export async function upsertProduct(data: {
    productSlug: string;
    source: string;
    sourceUrl: string;
    name: string;
    tagline: string;
}): Promise<string> {
    const pool = getPool();

    const query = `
        INSERT INTO products (product_slug, source, source_url, name, tagline)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (product_slug)
        DO UPDATE SET
            source = EXCLUDED.source,
            source_url = EXCLUDED.source_url,
            name = EXCLUDED.name,
            tagline = EXCLUDED.tagline,
            updated_at = NOW()
        RETURNING id
    `;

    const result = await pool.query(query, [
        data.productSlug,
        data.source,
        data.sourceUrl,
        data.name,
        data.tagline,
    ]);

    return result.rows[0].id;
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductBasic | null> {
    const pool = getPool();

    const query = `
        SELECT id, product_slug, source, source_url, name, tagline
        FROM products
        WHERE product_slug = $1
    `;

    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id,
        productSlug: row.product_slug,
        source: row.source,
        sourceUrl: row.source_url,
        name: row.name,
        tagline: row.tagline,
    };
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Save a complete analysis to the database
 */
export async function saveAnalysis(analysis: ProductAnalysisComplete): Promise<void> {
    const pool = getPool();

    // First, ensure the product exists
    const productId = await upsertProduct({
        productSlug: analysis.productSlug,
        source: analysis.source,
        sourceUrl: analysis.sourceUrl,
        name: analysis.product.name,
        tagline: analysis.product.tagline,
    });

    // Then save the analysis
    const query = `
        INSERT INTO product_analyses (
            id,
            product_id,
            product_slug,
            analysis_data,
            score_overall,
            score_feasibility,
            score_desirability,
            score_viability,
            verdict,
            schema_version,
            model_used,
            status,
            error_message,
            processing_time_ms,
            analyzed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id)
        DO UPDATE SET
            analysis_data = EXCLUDED.analysis_data,
            score_overall = EXCLUDED.score_overall,
            score_feasibility = EXCLUDED.score_feasibility,
            score_desirability = EXCLUDED.score_desirability,
            score_viability = EXCLUDED.score_viability,
            verdict = EXCLUDED.verdict,
            status = EXCLUDED.status,
            error_message = EXCLUDED.error_message,
            processing_time_ms = EXCLUDED.processing_time_ms,
            analyzed_at = EXCLUDED.analyzed_at,
            updated_at = NOW()
    `;

    await pool.query(query, [
        analysis.id,
        productId,
        analysis.productSlug,
        JSON.stringify(analysis),
        analysis.scores.overall,
        analysis.scores.feasibility,
        analysis.scores.desirability,
        analysis.scores.viability,
        analysis.recommendation.verdict,
        analysis.metadata.schemaVersion,
        analysis.metadata.modelUsed,
        analysis.status,
        analysis.errorMessage || null,
        analysis.metadata.processingTimeMs,
        analysis.metadata.analyzedAt,
    ]);
}

/**
 * Get the most recent analysis for a product by slug
 */
export async function getAnalysisBySlug(slug: string): Promise<ProductAnalysisComplete | null> {
    const pool = getPool();

    const query = `
        SELECT analysis_data
        FROM product_analyses
        WHERE product_slug = $1
          AND status = 'completed'
        ORDER BY created_at DESC
        LIMIT 1
    `;

    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].analysis_data as ProductAnalysisComplete;
}

/**
 * Get analysis by ID
 */
export async function getAnalysisById(id: string): Promise<ProductAnalysisComplete | null> {
    const pool = getPool();

    const query = `
        SELECT analysis_data
        FROM product_analyses
        WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].analysis_data as ProductAnalysisComplete;
}

/**
 * List analyses with filters and pagination
 */
export interface ListAnalysesOptions {
    source?: string;
    verdict?: 'BUILD' | 'PIVOT' | 'PARK';
    minScore?: number;
    maxScore?: number;
    limit?: number;
    offset?: number;
}

export async function listAnalyses(options: ListAnalysesOptions = {}): Promise<ProductAnalysisComplete[]> {
    const pool = getPool();

    const conditions: string[] = ["status = 'completed'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (options.verdict) {
        conditions.push(`verdict = $${paramIndex}`);
        params.push(options.verdict);
        paramIndex++;
    }

    if (options.minScore !== undefined) {
        conditions.push(`score_overall >= $${paramIndex}`);
        params.push(options.minScore);
        paramIndex++;
    }

    if (options.maxScore !== undefined) {
        conditions.push(`score_overall <= $${paramIndex}`);
        params.push(options.maxScore);
        paramIndex++;
    }

    if (options.source) {
        conditions.push(`(analysis_data->>'source') = $${paramIndex}`);
        params.push(options.source);
        paramIndex++;
    }

    const limit = options.limit || 20;
    const offset = options.offset || 0;

    const query = `
        SELECT analysis_data
        FROM product_analyses
        WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    return result.rows.map(row => row.analysis_data as ProductAnalysisComplete);
}

/**
 * Delete analysis by slug (cache invalidation)
 */
export async function invalidateCache(slug: string): Promise<void> {
    const pool = getPool();

    const query = `
        DELETE FROM product_analyses
        WHERE product_slug = $1
    `;

    await pool.query(query, [slug]);
}

/**
 * Check if analysis is fresh (within TTL)
 */
export function isFresh(createdAt: string, ttlMs: number = 7 * 24 * 60 * 60 * 1000): boolean {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    return (now - created) < ttlMs;
}

/**
 * Get cache TTL from environment or use default (7 days)
 */
export function getCacheTTL(): number {
    const days = parseInt(process.env.CACHE_TTL_DAYS || '7', 10);
    return days * 24 * 60 * 60 * 1000; // Convert to milliseconds
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
    try {
        const pool = getPool();
        await pool.query('SELECT NOW()');
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
}

/**
 * Close database pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
