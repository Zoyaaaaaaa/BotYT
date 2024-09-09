'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Markdown from "./markdown";
import { extractYouTubeID, fetchTranscript } from "@/lib/youtube-transcript";
import { generateSummaryService } from "@/services/summary-service";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component
import { cn } from "@/lib/utils";

function searchTranscript(transcript: any[], keyword: string) {
    const results = transcript.filter(item => item.text.toLowerCase().includes(keyword.toLowerCase()));
    return results.map(result => ({
        text: result.text,
        timestamp: result.offset / 1000, // Convert milliseconds to seconds
    }));
}

const suggestedQuestions = [
    "What is the main idea of this video?",
    "What are the key points discussed?",
    "Can you summarize the video?",
];

export  default function YoutubeBot() {
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
            if (selectedAction === "summary") {
                const response = await generateSummaryService(value);
                if (!response || !response.data) {
                    throw new Error("Failed to generate summary. No data returned.");
                }
                setSummary(response.data);
                setAnswer(null);
                setVideoId(extractYouTubeID(value));
                
                // Fetch and display transcript search results
                const transcript = await fetchTranscript(value);
                if (transcript) {
                    const results = searchTranscript(transcript, searchKeyword);
                    setSearchResults(results);
                } else {
                    console.error('Error fetching transcript.');
                }
            } else if (selectedAction === "question") {
                const response = await fetch('/api/ask-question', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId: value, question: customQuestion }),
                });
              
                const result = await response.json();
                if (response.ok) {
                    setAnswer(result.data);
                    setSummary(null);
                } else {
                    throw new Error(result.error || "Failed to get answer to your question.");
                }
            } else if (selectedAction === "search") {
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
        } catch (error) {
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
                            <span className="absolute inset-0 bg-gradient-to-r from-[#1f73ff] to-[#3b82f6] rounded-lg filter blur-lg opacity-75"></span>
                            <span className="relative">Generate Summary</span>
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
                        Ask a Question
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
                        Search Transcript
                    </Button>
                </div>

                <div className="space-y-6">
                    <Input
                        type="text"
                        placeholder="Enter YouTube video URL or ID"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full p-4 rounded-lg bg-[#001f4d] border border-[#003580] text-gray-300 focus:ring-[#1f73ff]"
                        required
                    />

                    {selectedAction === "question" && (
                        <>
                            <Input
                                type="text"
                                placeholder="Enter your question"
                                value={customQuestion}
                                onChange={(e) => setCustomQuestion(e.target.value)}
                                className="w-full p-4 rounded-lg bg-[#001f4d] border border-[#003580] text-gray-300 focus:ring-[#1f73ff]"
                                required
                            />
                            
                            <div className="flex justify-between items-center space-x-4">
                                <Button
                                    type="submit"
                                    className="w-full py-3 px-6 rounded-lg bg-[#1f73ff] text-white hover:bg-[#1d4ed8]"
                                    disabled={loading}
                                >
                                    {loading ? <Skeleton className="w-24 h-6" /> : "Submit Question"}
                                </Button>
                            </div>
                        </>
                    )}

                    {selectedAction === "search" && (
                        <>
                            <Input
                                type="text"
                                placeholder="Enter keyword to search transcript"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full p-4 rounded-lg bg-[#001f4d] border border-[#003580] text-gray-300 focus:ring-[#1f73ff]"
                                required
                            />
                            
                            <div className="flex justify-between items-center space-x-4">
                                <Button
                                    type="submit"
                                    className="w-full py-3 px-6 rounded-lg bg-[#1f73ff] text-white hover:bg-[#1d4ed8]"
                                    disabled={loading}
                                >
                                    {loading ? <Skeleton className="w-24 h-6" /> : "Search Transcript"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </form>

        

            {summary && (
                <div className="mt-8 p-4 bg-gray-800 text-gray-300 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Summary</h2>
                    <Markdown text={summary}/>
                </div>
            )}

            {answer && (
                <div className="mt-8 p-4 bg-gray-800 text-gray-300 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Answer</h2>
                    <p>{answer}</p>
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="mt-8 p-4 bg-gray-800 text-gray-300 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
                    <ul className="space-y-4">
                        {searchResults.map((result, index) => (
                            <li key={index} className="border-b border-gray-700 pb-2">
                                <p className="text-lg font-semibold">{formatTimestamp(result.timestamp)}:</p>
                                <p>{result.text}</p>
                                <a href={generateYouTubeLink(videoId, result.timestamp)} className="text-blue-400 hover:underline">
                                    Watch on YouTube
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
