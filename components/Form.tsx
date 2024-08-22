"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Markdown from "./markdown";
import { extractYouTubeID, fetchTranscript } from "@/lib/youtube-transcript";
import { generateSummaryService } from "@/services/summary-service";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component

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

export function SummaryForm() {
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

        try {
            let response;
            const body = { videoId: value, keyword: searchKeyword };

            if (selectedAction === "summary") {
                response = await generateSummaryService(value);
                setSummary(response.data);
                setAnswer(null);
                setVideoId(extractYouTubeID(value)); // Extract video ID from URL
                
                // Fetch the transcript for searching
                const transcript = await fetchTranscript(value);
                if (transcript) {
                    const results = searchTranscript(transcript, searchKeyword);
                    setSearchResults(results);
                }
            } else if (selectedAction === "question") {
                response = await fetch('/api/ask-question', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ videoId: value, question: customQuestion }),
                });

                const result = await response.json();
                if (response.ok) {
                    setAnswer(result.data); 
                    setSummary(null); 
                } else {
                    throw new Error(result.error || "Unknown error occurred");
                }
            } else if (selectedAction === "search") {
                response = await fetch('/api/search', {
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
            setError('An error occurred');
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
                    "flex-1 py-3 px-6 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105",
                    selectedAction === "summary"
                        ? "bg-[#1f73ff] text-white shadow-md"
                        : "bg-[#002d72] text-gray-300 hover:bg-[#1f73ff] hover:text-white"
                    )}
                >
                    Get Summary
                </Button>
                <Button
                    onClick={() => setSelectedAction("question")}
                    className={cn(
                    "flex-1 py-3 px-6 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105",
                    selectedAction === "question"
                        ? "bg-[#1f73ff] text-white shadow-md"
                        : "bg-[#002d72] text-gray-300 hover:bg-[#1f73ff] hover:text-white"
                    )}
                >
                    Ask a Question
                </Button>
                <Button
                    onClick={() => setSelectedAction("search")}
                    className={cn(
                    "flex-1 py-3 px-6 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105",
                    selectedAction === "search"
                    ? "bg-[#1f73ff] text-white shadow-md"
                        : "bg-[#002d72] text-gray-300 hover:bg-[#1f73ff] hover:text-white"
                    )}
                >
                    Search Transcript
                </Button>
                </div>

                <Input
                    name="videoId"
                    placeholder="YouTube Video ID or URL"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-[#001d3d] text-white placeholder-gray-500 focus:ring-[#1f73ff] border-transparent rounded-lg"
                    required
                />

            {selectedAction === "question" && (
            <div className="mt-6 p-6 bg-gradient-to-br from-[#001d3d] to-[#003366] rounded-xl shadow-lg">
                <label className="block text-white font-semibold text-xl mb-3">
                Ask a question about the video:
                </label>
                <Input
                name="customQuestion"
                placeholder="e.g., What is the key message?"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full p-4 bg-[#0a2a52] text-white placeholder-gray-400 border-2 border-transparent focus:border-[#1f73ff] focus:ring-2 focus:ring-[#1f73ff] rounded-lg transition-all duration-300 ease-in-out"
                />
                <div className="mt-6">
                <label className="block text-white font-semibold text-xl mb-3">
                    Suggested Questions:
                </label>
                <ul className="list-disc list-inside mt-4 space-y-4 text-gray-300">
                    {suggestedQuestions.map((question, index) => (
                    <li
                        key={index}
                        className="cursor-pointer hover:text-[#1f73ff] hover:underline transition-all duration-200 transform hover:scale-100"
                        onClick={() => setCustomQuestion(question)}
                    >
                        {question}
                    </li>
                    ))}
                </ul>
                </div>
            </div>
            )}

                {selectedAction === "search" && (
                    <div className="mt-4">
                        <label className="block text-gray-300">Search Transcript:</label>
                        <Input
                            name="searchKeyword"
                            placeholder="Enter keyword to search in transcript"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="w-full mt-2 bg-[#001d3d] text-white placeholder-gray-500 border-transparent rounded-lg"
                        />
                    </div>
                )}

                <Button
                    disabled={loading}
                    className="w-full py-3 bg-[#1f73ff] text-white hover:bg-[#0056b3] transition-colors duration-300 rounded-lg"
                >
                    {loading ? "Searching..." : "Submit"}
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
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Video Summary:</h2>
                    <Markdown text={summary} />
                </div>
            )}

            {answer && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Answer to Your Question:</h2>
                    <p><Markdown text={answer}/></p>
                </div>
            )}
            {searchResults.length > 0 && (
    <div className="mt-8 p-4 md:p-6 lg:p-8 bg-[#0a192f] rounded-lg shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-[#1f73ff]">
            Search Results:
        </h2>
        <ul className="space-y-4">
            {searchResults.map((result, index) => (
                <li key={index} className="p-3 md:p-4 lg:p-6 bg-[#1c2a48] rounded-lg border border-[#1f73ff] transition-transform transform hover:scale-105 hover:bg-[#1e293b] shadow-md">
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
        </ul>
    </div>
)}

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}



