import 'dotenv/config';

// The @google/generative-ai SDK does not expose a direct `listModels` method.
// Probe a short list of known Gemini model names by attempting a tiny generateContent
// call for each and report which ones appear usable in the current environment.

async function run() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set');
      process.exit(2);
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey as string);

    const candidates = [
      'gemini-2.5-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-embed-1'
    ];

    const available: string[] = [];

    for (const m of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: m as string } as any);
        // quick probe
        const probe = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
          generationConfig: { maxOutputTokens: 4, temperature: 0 }
        } as any);
        // If the SDK returns without throwing, consider it available
        if (probe) {
          available.push(m);
          console.log(`Model probe succeeded: ${m}`);
        }
      } catch (err: any) {
        console.warn(`Model probe failed: ${m} -> ${err?.message || err}`);
      }
    }

    console.log('Available Gemini-like models (probe results):', available);
    if (available.length === 0) {
      console.log('No models responded to probes. If you expect models to be available, check GEMINI_API_KEY and IAM/service account permissions.');
    }
  } catch (err) {
    console.error('Error listing/probing models:', err);
    process.exit(2);
  }
}

run();
