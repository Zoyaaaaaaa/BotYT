import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from "@/lib/youtube-transcript";
import { OpenAI } from "openai";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as string, 
});


async function generateAnswer(transcriptText: string, question: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that answers questions based on provided text.",
                },
                {
                    role: "user",
                    content: `Here is the transcript of a video:\n\n${transcriptText}\n\nQuestion: ${question}`,
                },
            ],
            max_tokens: 150, 
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error generating answer:", error);
        throw new Error("Failed to generate answer.");
    }
}

// Handle POST request to answer questions
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { videoId, question } = body;

        // Validate videoId and question
        if (!videoId || typeof videoId !== "string" || !question || typeof question !== "string") {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        // Fetch the transcript
        const transcript = await fetchTranscript(videoId);
        if (!transcript || transcript.length === 0) {
            return NextResponse.json({ error: "No transcript available for this video." }, { status: 404 });
        }

        const transcriptText = transcript.map((item) => item.text).join(" ");

        // Generate answer
        const answer = await generateAnswer(transcriptText, question);

        return NextResponse.json({ data: answer, error: null }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
