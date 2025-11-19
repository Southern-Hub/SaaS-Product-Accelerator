import { scrapeBetaList, scrapeRecentStartups, getMockStartupData } from './betalist';

// Mock fetch globally
global.fetch = jest.fn();

describe('BetaList Scraper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('scrapeBetaList', () => {
        it('should return null for invalid URL', async () => {
            const result = await scrapeBetaList('https://google.com');
            expect(result).toBeNull();
        });

        it('should scrape startup data correctly', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Test Startup</h1>
            <h2>The best startup ever</h2>
            <p>This is a detailed description of the startup.</p>
            <a href="/topics/saas">SaaS</a>
            <a href="/topics/ai">AI</a>
            <a href="https://example.com">Visit Site</a>
            <div>Featured on November 19, 2025</div>
          </body>
        </html>
      `;

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                text: () => Promise.resolve(mockHtml),
            });

            const result = await scrapeBetaList('https://betalist.com/startups/test-startup');

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Test Startup');
            expect(result?.tagline).toBe('The best startup ever');
            expect(result?.topics).toContain('SaaS');
            expect(result?.topics).toContain('AI');
            expect(result?.website).toBe('https://example.com');
        });
    });

    describe('scrapeRecentStartups', () => {
        it('should return a list of startups', async () => {
            const mockHtml = `
        <html>
          <body>
            <a href="/startups/startup1">Startup 1</a>
            <span>Tagline 1</span>
            <a href="/startups/startup2">Startup 2</a>
            <span>Tagline 2</span>
          </body>
        </html>
      `;

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                text: () => Promise.resolve(mockHtml),
            });

            const results = await scrapeRecentStartups(2);

            expect(results).toHaveLength(2);
            expect(results[0].name).toBe('Startup 1');
            expect(results[0].slug).toBe('startup1');
        });
    });
});
