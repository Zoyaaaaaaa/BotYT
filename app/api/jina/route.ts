import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { mode, input, language } = await req.json();
    let fullUrl = '';

    // Determine which route to use based on the mode ('r' or 's')
    if (mode === 'r') {
      fullUrl = `https://r.jina.ai/${input}`;
    } else if (mode === 's') {
      fullUrl = `https://s.jina.ai/${input}`;  // Using input instead of `question`
    } else {
      return NextResponse.json({ message: "Invalid mode. Please enter 'r' for URL reading or 's' for search." }, { status: 400 });
    }

    // Fetch the data based on the fullUrl
    const response = await fetch(fullUrl, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText} (${response.status})`);
    }

    const result = await response.text();

    // Use OpenAI to generate insights from the fetched data
    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Ensure using the correct model
      messages: [
        { role: "system", content: `You are a helpful assistant that provides brief insights and summaries.  .` },
        { role: "user", content: `Please provide a brief summary and key insights from the following content:Please respond in 2 lines summary of website\n${result}` }
      ],
      max_tokens: 300,
    });

    const insights = openAIResponse.choices?.[0]?.message?.content || "No insights available.";

    return NextResponse.json({ result, insights });
  } catch (error: any) {
    console.error('Error in API route:', error.message);
    return NextResponse.json({ message: 'Failed to process the request', error: error.message }, { status: 500 });
  }
}
