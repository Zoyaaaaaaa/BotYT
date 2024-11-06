
'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Markdown from "react-markdown"
import { extractYouTubeID, fetchTranscript } from "@/lib/youtube-transcript"
import { generateSummaryService } from "@/services/summary-service"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { LoaderCircle, Youtube, Search, MessageSquare, FileText } from "lucide-react"

function searchTranscript(transcript: any[], keyword: string) {
  const results = transcript.filter(item => item.text.toLowerCase().includes(keyword.toLowerCase()))
  return results.map(result => ({
    text: result.text,
    timestamp: result.offset / 1000,
  }))
}

const suggestedQuestions = [
  "What is the main idea of this video?",
  "What are the key points discussed?",
  "Can you summarize the video?",
]

export default function YoutubeBot() {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState("")
  const [summary, setSummary] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const body = { videoId: value, keyword: searchKeyword }
    try {
      if (selectedAction === "summary") {
        const response = await generateSummaryService(value)
        if (!response || !response.data) {
          throw new Error("Failed to generate summary. No data returned.")
        }
        setSummary(response.data)
        setAnswer(null)
        const id = extractYouTubeID(value)
        setVideoId(id)

        const transcript = await fetchTranscript(value)
        if (transcript) {
          const results = searchTranscript(transcript, searchKeyword)
          setSearchResults(results)
        } else {
          console.error('Error fetching transcript.')
        }
      } else if (selectedAction === "question") {
        const response = await fetch('/api/ask-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: value, question: customQuestion }),
        })
      
        const result = await response.json()
        if (response.ok) {
          setAnswer(result.data)
          setSummary(null)
        } else {
          throw new Error(result.error || "Failed to get answer to your question.")
        }
      } else if (selectedAction === "search") {
        let response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        const result = await response.json()
        if (response.ok) {
          setSearchResults(result.data)
          setSummary(null)
          setAnswer(null)
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      console.error('Error during form submission:', error)
      setError(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }
  
  function generateYouTubeLink(videoId: string | null, timestamp: number): string {
    if (!videoId) {
      console.error("Video ID is missing.")
      return "#"
    }
    return `https://www.youtube.com/watch?v=${videoId}&t=${Math.round(timestamp)}`
  }

  function formatTimestamp(timestamp: number): string {
    const minutes = Math.floor(timestamp / 60)
    const seconds = Math.floor(timestamp % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-900 to-black text-red-50">
      <div className="text-center space-y-6 mb-12">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
          Video Insight Generator 🤖
        </h1>
        <p className="text-xl text-red-300">
          Unlock the power of video content with AI-driven analysis
        </p>
      </div>

      {videoId && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl mb-12">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute top-0 left-0 w-full h-full"
            title="YouTube Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-8">
        <div className="flex items-center space-x-4 bg-gray-800 rounded-lg p-2 shadow-lg">
          <Youtube className="text-red-500 ml-2" />
          <Input
            type="text"
            placeholder="Enter YouTube video URL or ID"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-grow bg-transparent border-none text-white placeholder-red-300 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => setSelectedAction("summary")} 
            className={cn(
              "flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-300 shadow-lg",
              selectedAction === "summary" 
                ? "bg-gradient-to-r from-red-600 to-red-800 text-white" 
                : "bg-gray-800 text-red-300 hover:bg-gray-700"
            )}
          >
            <FileText className="w-5 h-5" />
            <span>Generate Summary</span>
          </Button>
          <Button 
            onClick={() => setSelectedAction("question")} 
            className={cn(
              "flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-300 shadow-lg",
              selectedAction === "question" 
                ? "bg-gradient-to-r from-red-600 to-red-800 text-white" 
                : "bg-gray-800 text-red-300 hover:bg-gray-700"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Ask a Question</span>
          </Button>
          <Button 
            onClick={() => setSelectedAction("search")} 
            className={cn(
              "flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-300 shadow-lg",
              selectedAction === "search" 
                ? "bg-gradient-to-r from-red-600 to-red-800 text-white" 
                : "bg-gray-800 text-red-300 hover:bg-gray-700"
            )}
          >
            <Search className="w-5 h-5" />
            <span>Search Transcript</span>
          </Button>
        </div>
        
        {selectedAction === "question" && (
          <Input
            type="text"
            placeholder="Enter your question"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="w-full bg-gray-800 border-gray-700 text-white placeholder-red-300 focus:ring-red-500 focus:border-red-500 rounded-lg shadow-lg"
            required
          />
        )}
        
        {selectedAction === "search" && (
          <Input
            type="text"
            placeholder="Enter keyword to search transcript"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-gray-800 border-gray-700 text-white placeholder-red-300 focus:ring-red-500 focus:border-red-500 rounded-lg shadow-lg"
            required
          />
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold shadow-lg hover:from-red-700 hover:to-red-900 transition-all duration-300"
        >
          {loading ? <LoaderCircle className="animate-spin" /> : "Generate Insights"}
        </Button>
      </form>

      {loading && (
        <div className="space-y-4 mt-8">
          <Skeleton className="h-4 w-3/4 bg-gray-800" />
          <Skeleton className="h-4 w-1/2 bg-gray-800" />
          <Skeleton className="h-4 w-5/6 bg-gray-800" />
        </div>
      )}
      
      <div className="space-y-8 mt-12">
        {summary && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-red-800">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Video Summary</h2>
            <div className="prose prose-invert max-w-none text-red-100">
              <Markdown>{summary}</Markdown>
            </div>
          </div>
        )}
        
        {answer && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-red-800">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Answer</h2>
            <div className="prose prose-invert max-w-none text-red-100">
              <Markdown>{answer}</Markdown>
            </div>
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-red-800">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Transcript Search Results</h2>
            <ul className="space-y-4">
              {searchResults.map((result, index) => (
                <li key={index} className="border-b border-gray-700 pb-4">
                  <a
                    href={generateYouTubeLink(videoId, result.timestamp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:underline font-semibold"
                  >
                    {formatTimestamp(result.timestamp)}
                  </a>
                  <p className="text-red-100 mt-2">{result.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}