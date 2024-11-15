import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function POST(req: NextRequest) {
    try {
      const { summary, question, storedSummary } = await req.json();
  
      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: `You are a helpful assistant that provides detailed answers and insights based on provided summaries. in maximum 3 lines not more than that` },
      ];
  
      if (summary) {
        // Initial request with summary
        messages.push({ role: "user", content: `This is the summary: "${summary}". Please use this summary to provide answers related to the website.` });
      } else if (storedSummary && question) {
        // Follow-up question using stored summary
        messages.push({ role: "assistant", content: `The context is: "${storedSummary}"` });
        messages.push({ role: "user", content: question });
      } else {
        return NextResponse.json({ message: 'Invalid request format. Provide either summary or storedSummary and question.' }, { status: 400 });
      }
  
      // Generate a response using OpenAI
      const openAIResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages, 
        max_tokens: 300,
      });
  
      const answer = openAIResponse.choices?.[0]?.message?.content || "No response available.";
  
      return NextResponse.json({ answer, storedSummary: summary || storedSummary }); 
    } catch (error: any) {
      console.error('Error in OpenAI API route:', error.message);
      return NextResponse.json({ message: 'Failed to generate response', error: error.message }, { status: 500 });
    }
  }
  