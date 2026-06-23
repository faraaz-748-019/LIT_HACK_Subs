/**
 * DealDesk Parser Utility
 * Implements a dual-mode parser:
 * 1. Local rule-based regex parsing (no API key required)
 * 2. Real LLM parsing using Gemini API (if user supplies an API key)
 */

// Heuristic-based regex parser
export function parseMessageLocal(text) {
  if (!text || text.trim() === '') {
    return {
      brandName: '',
      deliverables: '',
      paymentAmount: '',
      deadlineDate: '',
      paymentDueDate: '',
      notes: '',
      missingFields: ['brandName', 'deliverables', 'paymentAmount', 'deadlineDate', 'paymentDueDate']
    };
  }

  const missingFields = [];
  
  // 1. Brand Name Extraction
  // Look for: "from [Brand]", "at [Brand]", "representing [Brand]", "partner with [Brand]", "brand: [Brand]"
  let brandName = '';
  const brandRegexes = [
    /brand\s*:\s*([A-Za-z0-9\s&]+)/i,
    /(?:from|at|representing|with)\s+([A-Z][A-Za-z0-9&]{1,20})(?:\s+(?:team|team|PR|marketing))?\b/i,
    /hi\s+(?:there|creator|influencer)?(?:,\s*)?i'm\s+[a-z]+\s+(?:from|with)\s+([A-Z][A-Za-z0-9&]{1,20})/i,
    /collaboration\s+(?:with|between)\s+([A-Z][A-Za-z0-9&]{1,20})/i
  ];

  for (const regex of brandRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Exclude common false positives
      if (!['us', 'you', 'the', 'our', 'my', 'your', 'we', 'instagram', 'youtube', 'tiktok'].includes(candidate.toLowerCase())) {
        brandName = candidate;
        break;
      }
    }
  }

  // Fallback: If no match, try to search for capitalized words that look like brands
  if (!brandName) {
    missingFields.push('brandName');
  }

  // 2. Deliverables Extraction
  // Look for: "1 reel", "2 stories", "dedicated video", "1 post", "tiktok video"
  let deliverables = '';
  const deliverableRegex = /\b(\d+\s*(?:reel|story|stories|post|video|short|tiktok|carousel|integration|ad|dedicated|shoutout)s?)\b/gi;
  const matches = text.match(deliverableRegex);
  if (matches && matches.length > 0) {
    deliverables = matches.map(m => m.trim()).join(' + ');
  } else {
    // Look for keywords
    const keywords = ['reel', 'story', 'stories', 'youtube video', 'dedicated video', 'integration', 'tiktok ad', 'carousel'];
    const foundKeywords = [];
    keywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) {
        foundKeywords.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });
    if (foundKeywords.length > 0) {
      deliverables = foundKeywords.join(' and ');
    } else {
      deliverables = '';
      missingFields.push('deliverables');
    }
  }

  // 3. Payment Amount Extraction
  // Look for: $500, 500 USD, 300 GBP, 10,000 INR
  let paymentAmount = '';
  const amountRegex = /(?:\$|£|€|USD|EUR|GBP|INR|CAD|AUD)\s*(\d+(?:,\d+)*(?:\.\d+)?)\b|(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:usd|eur|gbp|inr|cad|aud|dollars|bucks)\b/i;
  const amountMatch = text.match(amountRegex);
  if (amountMatch) {
    const num = amountMatch[1] || amountMatch[2];
    // Find which currency symbol was matched
    const matchedText = amountMatch[0];
    let currencySymbol = '$';
    if (matchedText.includes('£') || matchedText.toLowerCase().includes('gbp')) currencySymbol = '£';
    else if (matchedText.includes('€') || matchedText.toLowerCase().includes('eur')) currencySymbol = '€';
    else if (matchedText.includes('INR') || matchedText.includes('inr')) currencySymbol = '₹';
    else if (matchedText.toLowerCase().includes('inr')) currencySymbol = '₹';
    
    paymentAmount = `${currencySymbol}${num}`;
  } else {
    missingFields.push('paymentAmount');
  }

  // 4. Deadline Date Extraction
  // Look for: "by July 15", "before June 30th", "deadline is 10/24/2026"
  let deadlineDate = '';
  // Try matching standard YYYY-MM-DD
  const ymdMatch = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (ymdMatch) {
    deadlineDate = `${ymdMatch[1]}-${String(ymdMatch[2]).padStart(2, '0')}-${String(ymdMatch[3]).padStart(2, '0')}`;
  } else {
    // Look for Month Day patterns, e.g., "July 15", "15th of July", "June 30, 2026"
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
                    'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthRegex = new RegExp(`\\b(${months.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b|\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${months.join('|')})\\b`, 'i');
    const monthMatch = text.match(monthRegex);
    if (monthMatch) {
      const monthStr = monthMatch[1] || monthMatch[4];
      const dayStr = monthMatch[2] || monthMatch[3];
      
      // Map month name to index (0-11)
      const monthIndex = months.findIndex(m => m.startsWith(monthStr.toLowerCase())) % 12;
      const day = parseInt(dayStr, 10);
      
      // Default to the current year 2026 as per workspace local time context
      const year = 2026;
      deadlineDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else {
      missingFields.push('deadlineDate');
    }
  }

  // 5. Payment Due Date Extraction
  // Look for: "Net 30", "Net 45", "payment in 30 days", "within 15 days after posting"
  let paymentDueDate = '';
  const netRegex = /\b(?:net|payment within|payment in)\s*(\d+)\s*(?:days|days after posting|day)\b/i;
  const netMatch = text.match(netRegex);
  if (netMatch) {
    paymentDueDate = `Net ${netMatch[1]}`;
  } else if (text.toLowerCase().includes('on posting') || text.toLowerCase().includes('immediately')) {
    paymentDueDate = 'Upon posting';
  } else {
    missingFields.push('paymentDueDate');
  }

  // 6. Notes / Special terms
  // Highlight important sentences containing: shipping, draft, caption, exclusive, affiliate, contract
  let notes = '';
  const sentences = text.split(/[.!?]+/);
  const relevantSentences = sentences.filter(s => {
    const ls = s.toLowerCase();
    return ls.includes('shipping') || 
           ls.includes('draft') || 
           ls.includes('caption') || 
           ls.includes('exclusive') || 
           ls.includes('affiliate') || 
           ls.includes('contract') ||
           ls.includes('rights') ||
           ls.includes('payment method');
  });

  if (relevantSentences.length > 0) {
    notes = relevantSentences.map(s => s.trim()).join('. ') + '.';
  }

  return {
    brandName,
    deliverables,
    paymentAmount,
    deadlineDate,
    paymentDueDate,
    notes,
    missingFields
  };
}

// Gemini API parser
export async function parseMessageGemini(text, apiKey) {
  if (!apiKey) {
    throw new Error('API key is required for Gemini parsing.');
  }

  const prompt = `
You are an expert assistant for content creators. Analyze the following brand collaboration offer (which may be a DM, email, or WhatsApp message) and extract structured details.

Extract these exact fields in JSON format:
- brandName: The brand offering the collaboration (e.g. "Nike", "Glossier").
- deliverables: A summary of the expected deliverables (e.g., "1 Instagram Reel + 2 Stories", "1 Dedicated YouTube Video").
- paymentAmount: The monetary amount offered. Format with currency (e.g. "$500", "₹10,000", "£250"). If no budget is specified, leave empty.
- deadlineDate: The deadline date for posting or submitting content. Output in YYYY-MM-DD format. Assume the year is 2026 if not specified. If no date can be found, leave empty.
- paymentDueDate: The payment terms or due date (e.g., "Net 30", "Net 45", "Upon posting"). If not mentioned, leave empty.
- notes: Any key notes, special terms, contract details, content guidelines, or restrictions (e.g. "Usage rights for 30 days", "Must include link in bio").
- missingFields: An array of strings listing any of the following fields that were NOT found or confidently extracted in the message: "brandName", "deliverables", "paymentAmount", "deadlineDate", "paymentDueDate".

Return ONLY a valid JSON object. Do not include markdown formatting or backticks around the JSON.
Here is the text of the brand message:
"""
${text}
"""
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = JSON.parse(resultText.trim());
    
    // Ensure all keys exist
    return {
      brandName: parsed.brandName || '',
      deliverables: parsed.deliverables || '',
      paymentAmount: parsed.paymentAmount || '',
      deadlineDate: parsed.deadlineDate || '',
      paymentDueDate: parsed.paymentDueDate || '',
      notes: parsed.notes || '',
      missingFields: parsed.missingFields || []
    };
  } catch (error) {
    console.error('Error parsing with Gemini API, falling back to local parsing:', error);
    throw error;
  }
}
