'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Markdown from "./markdown";
import { extractYouTubeID, fetchTranscript } from "@/lib/youtube-transcript";
import { generateSummaryService } from "@/services/summary-service";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component
import { supabase } from "@/utils/supabase/supaBaseclient";

function searchTranscript(transcript: any[], keyword: string) {
    const results = transcript.filter(item => item.text.toLowerCase().includes(keyword.toLowerCase()));
    return results.map(result => ({
        text: result.text,
        timestamp: result.offset / 1000, // Convert milliseconds to seconds
    }));
}

interface SummaryFormProps {
    userId: string; // Add userId as a prop
}

const suggestedQuestions = [
    "What is the main idea of this video?",
    "What are the key points discussed?",
    "Can you summarize the video?",
];

export function SummaryForm({ userId }: SummaryFormProps) {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState("");
    const [summary, setSummary] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [customQuestion, setCustomQuestion] = useState("");
    const [answer, setAnswer] = useState<string | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const body = { videoId: value, keyword: searchKeyword };
        try {
            
    
            // Insert user request into Supabase
            const { data: userRequestData, error: userRequestError } = await supabase
                .from('user_request')
                .insert([{ user_id: userId, video_id: value, action: selectedAction, keyword: searchKeyword }])
                .single(); // Ensures we get a single object
    
            if (userRequestError) {
                console.error('Error inserting user request:', userRequestError);
                setError('Failed to record your request. Please try again later.');
                return;
            }
    
           
    
            // Handle actions based on selectedAction
            if (selectedAction === "summary") {
                const response = await generateSummaryService(value);
                if (!response || !response.data) {
                    throw new Error("Failed to generate summary. No data returned.");
                }
                setSummary(response.data);
                setAnswer(null);
                setVideoId(extractYouTubeID(value));
    
                // Save summary to Supabase
                const { data: summaryData, error: summaryError } = await supabase
                    .from('summaries')
                    .insert([{ user_id: userId, video_id: value, summary: response.data }]);
                
                if (summaryError) {
                    console.error('Error inserting summary:', summaryError);
                    setError('Failed to record summary. Please try again later.');
                } else {
                    console.log('Summary inserted:', summaryData);
                }
    
                // Fetch and save transcript search results
                const transcript = await fetchTranscript(value);
                if (transcript) {
                    const results = searchTranscript(transcript, searchKeyword);
                    setSearchResults(results);
    
                    const { error: searchResultsError } = await supabase
                        .from('search_results')
                        .upsert(
                            results.map(result => ({
                                user_id: userId,
                                video_id: value,
                                timestamp: result.timestamp,
                                text: result.text
                            }))
                        ); // Use upsert to avoid duplicates
    
                    if (searchResultsError) {
                        console.error('Error inserting search results:', searchResultsError);
                        setError('Failed to record search results. Please try again later.');
                    }
                } else {
                    console.error('Error fetching transcript.');
                }
            } else if (selectedAction === "question") {
                const response = await fetch('/api/ask-question', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, videoId: value, question: customQuestion }),
                });
    
                const result = await response.json();
                if (response.ok) {
                    setAnswer(result.data);
                    setSummary(null);
    
                    // Save answer to Supabase
                    const { data: answerData, error: answerError } = await supabase
                        .from('answers')
                        .insert([{ user_id: userId, video_id: value, question: customQuestion, answer: result.data }]);
                    
                    if (answerError) {
                        console.error('Error inserting answer:', answerError);
                        setError('Failed to record answer. Please try again later.');
                    } else {
                        console.log('Answer inserted:', answer);
                    }
                } else {
                    throw new Error(result.error || "Failed to get answer to your question.");
                }
            }  else if (selectedAction === "search") {
                let response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                const result = await response.json();
                if (response.ok) {
                    setSearchResults(result.data);
                    setSummary(null);
                    setAnswer(null);
                } else {
                    throw new Error(result.error);
                }
            }
        }catch (error) {
            console.error('Error during form submission:', error);
            setError(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }
    

    function generateYouTubeLink(videoId: string | null, timestamp: number): string {
        if (!videoId) {
            console.error("Video ID is missing.");
            return "#";
        }
        return `https://www.youtube.com/watch?v=${videoId}&t=${Math.round(timestamp)}`;
    }

    function formatTimestamp(timestamp: number): string {
        const minutes = Math.floor(timestamp / 60);
        const seconds = Math.floor(timestamp % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] mx-auto">
            <div className="text-center p-4 md:p-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#1f73ff] mb-6 md:mb-12 leading-tight">
                    Video Insight Generator 🤖
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-12">
                    Welcome to the Video Insight Generator! This tool allows you to:
                </p>
                <ul className="list-disc list-inside space-y-4 text-left max-w-3xl mx-auto mb-8">
                    <li className="text-lg md:text-xl">
                        <strong className="text-[#1f73ff] font-semibold">Get a summary</strong> of any YouTube video by providing its URL or ID.
                    </li>
                    <li className="text-lg md:text-xl">
                        <strong className="text-[#1f73ff] font-semibold">Ask specific questions</strong> about the video's content to get detailed answers.
                    </li>
                    <li className="text-lg md:text-xl">
                        <strong className="text-[#1f73ff] font-semibold">Search within the transcript</strong> of the video for specific keywords.
                    </li>
                </ul>
                <p className="text-lg text-gray-300">
                    Just input the video URL or ID, select an action, and let us handle the rest!
                </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
                <Button
    onClick={() => setSelectedAction("summary")}
    className={cn(
        "flex-1 py-3 px-6 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl",
        selectedAction === "summary"
            ? "bg-gradient-to-r from-[#1f73ff] to-[#3b82f6] text-white shadow-md"
            : "bg-gradient-to-r from-[#001f4d] to-[#002d72] text-gray-300 hover:from-[#1f73ff] hover:to-[#3b82f6] hover:text-white"
    )}
>
    <span className="relative">
        <span className="absolute inset-0 bg-gradient-to-r from-[#1f73ff] to-[#3b82f6] blur-lg opacity-75 transition-opacity duration-300"></span>
        <span className="relative z-10">Get Summary</span>
    </span>
</Button>

<Button
    onClick={() => setSelectedAction("question")}
    className={cn(
        "flex-1 py-3 px-6 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl",
        selectedAction === "question"
            ? "bg-gradient-to-r from-[#1f73ff] to-[#3b82f6] text-white shadow-md"
            : "bg-gradient-to-r from-[#001f4d] to-[#002d72] text-gray-300 hover:from-[#1f73ff] hover:to-[#3b82f6] hover:text-white"
    )}
>
    <span className="relative">
        <span className="absolute inset-0 bg-gradient-to-r from-[#1f73ff] to-[#3b82f6] blur-lg opacity-75 transition-opacity duration-300"></span>
        <span className="relative z-10">Ask a Question</span>
    </span>
</Button>
                    <Button
                    onClick={() => setSelectedAction("search")}
                    className={cn(
                        "flex-1 py-3 px-6 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl",
                        selectedAction === "search"
                            ? "bg-gradient-to-r from-[#1f73ff] to-[#3b82f6] text-white shadow-md"
                            : "bg-gradient-to-r from-[#001f4d] to-[#002d72] text-gray-300 hover:from-[#1f73ff] hover:to-[#3b82f6] hover:text-white"
                    )}
                >
                    <span className="relative">
                        <span className="absolute inset-0 bg-gradient-to-r from-[#1f73ff] to-[#3b82f6] blur-lg opacity-75 transition-opacity duration-300"></span>
                        <span className="relative z-10">Search Transcript</span>
                    </span>
                </Button>

                </div>

                <Input
                    name="videoId"
                    placeholder="Enter YouTube Video URL or ID"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full"
                    required
                />
                


                {selectedAction === "question" && (
                    <Input
                        name="customQuestion"
                        placeholder="Enter your custom question"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        className="w-full"
                        required
                    />
                )}

                {selectedAction === "search" && (
                    <Input
                        name="searchKeyword"
                        placeholder="Enter keyword to search in transcript"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full"
                        required
                    />
                )}

                <Button
                    type="submit"
                    className="w-full py-3 px-6 rounded-lg bg-[#1f73ff] text-white shadow-md hover:bg-[#002d72] transition-transform duration-300 transform hover:scale-105"
                    disabled={loading}
                >
                    {loading ? <Skeleton className="h-4 w-32" /> : "Submit"}
                </Button>
            </form>
            {videoId && (
    <div className="mt-6">
        <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-72 mt-4 rounded-lg shadow-lg"
        ></iframe>
    </div>
)}
{loading && (
    <div className="mt-8">
        <Skeleton className="h-48 w-full bg-gray-700 rounded-lg" />
    </div>
)}

            

            {summary && (
    <div className="mt-8 p-6 bg-[#f5f7fa] rounded-lg shadow-lg border border-[#d1d5db]">
        <h2 className="text-3xl font-bold mb-5 text-[#1f2937]">Summary:</h2>
        <div className="prose prose-lg leading-relaxed text-[#374151]">
            <Markdown text={summary} />
        </div>
    </div>
)}

            {answer && (
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold mb-4">Answer:</h2>
                    <p><Markdown text={answer}/></p>
                </div>
            )}

{searchResults.map((result, index) => (
               <li
               key={index}
               className="p-2 md:p-3 lg:p-4 m-2 bg-[#1c2a48] rounded-lg border border-[#1f73ff] transition-transform transform hover:scale-105 hover:bg-[#1e293b] shadow-md"
           >
                    <a
                        href={generateYouTubeLink(videoId, result.timestamp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col md:flex-row justify-between items-start md:items-center text-[#1f73ff] hover:text-[#60a5fa] font-medium"
                    >
                        <span className="text-white text-sm md:text-base font-bold ml-0 md:ml-4">
                            {formatTimestamp(result.timestamp)} :
                        </span>
                        <span className="text-white text-sm md:text-base">
                            {result.text}
                        </span>
                        
                        <span className="text-[#1f73ff] font-semibold mt-2 md:mt-0 md:ml-4">
                            Watch
                        </span>
                    </a>
                </li>
            ))}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
    );
}
