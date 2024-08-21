import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from "@/lib/youtube-transcript";

function searchTranscript(transcript: any[], keyword: string) {
    const results = transcript.filter(item => item.text.toLowerCase().includes(keyword.toLowerCase()));
    return results.map(result => ({
        text: result.text,
        timestamp: result.offset / 1000, // Convert milliseconds to seconds
    }));
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { videoId, keyword } = body;

        // Validate videoId and keyword
        if (!videoId || typeof videoId !== "string" || !keyword || typeof keyword !== "string") {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        // Fetch and search transcript
        const transcript = await fetchTranscript(videoId);
        if (!transcript || transcript.length === 0) {
            return NextResponse.json({ error: "No transcript available for this video." }, { status: 404 });
        }

        const results = searchTranscript(transcript, keyword);
        return NextResponse.json({ data: results, error: null }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
