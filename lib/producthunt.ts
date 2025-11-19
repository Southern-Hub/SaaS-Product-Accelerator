import * as cheerio from 'cheerio';

export interface StartupData {
  name: string;
  tagline: string;
  description: string;
  topics: string[];
  website: string;
  votesCount: number;
}

export async function scrapeProductHunt(url: string): Promise<StartupData | null> {
  try {
    // Basic validation to ensure it's a Product Hunt URL
    if (!url.includes('producthunt.com/posts/')) {
      throw new Error('Invalid Product Hunt URL');
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Selectors might need adjustment as Product Hunt's DOM changes
    // These are best-guess selectors based on common structures
    const name = $('h1').first().text().trim();
    const tagline = $('div[class*="styles_tagline"]').first().text().trim() || $('h2').first().text().trim();
    const description = $('div[class*="styles_description"]').first().text().trim() || $('meta[name="description"]').attr('content') || '';

    const topics: string[] = [];
    $('a[href*="/topics/"]').each((_, el) => {
      topics.push($(el).text().trim());
    });

    const website = $('a[data-test="topic-link"]').attr('href') || ''; // This might be wrong, usually there's a specific "Visit" button
    // Finding the external link is tricky without exact class names, often it's a redirect link

    // Fallback for votes
    const votesText = $('[data-test="vote-button"]').first().text();
    const votesCount = parseInt(votesText || '0', 10);

    if (!name) {
      console.warn('Could not extract startup name');
      return null;
    }

    return {
      name,
      tagline,
      description,
      topics,
      website,
      votesCount: isNaN(votesCount) ? 0 : votesCount,
    };

  } catch (error) {
    console.error('Error scraping Product Hunt:', error);
    return null;
  }
}

export function getMockStartupData(): StartupData {
  return {
    name: "Linear (Demo)",
    tagline: "The issue tracking tool you'll enjoy using",
    description: "Linear streamlines issues, sprints, and product roadmaps. It’s built for high-performance teams to streamline their software projects.",
    topics: ["Productivity", "SaaS", "Developer Tools", "Project Management"],
    website: "https://linear.app",
    votesCount: 4500,
  };
}
