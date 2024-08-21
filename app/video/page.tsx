'use client';
import { useState, FC } from "react";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import router from "next/router";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Initialize the Google Generative AI provider with the API key
const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string, // Ensure this is a string
});

const Home: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchYouTubeData = async (link: string) => {
    try {
      setLoading(true);
      console.log("Generating text...");

      // Use the Google Generative AI provider to generate text
      const response = await generateText({
        model: googleGenerativeAI("models/gemini-pro"), // Adjust according to your setup
        prompt: `For the this {text} complete the following steps.
  Generate the title for based on the content provided
  Summarize the following content and include 5 key topics, writing in first person using normal tone of voice.
  
  Write a youtube video description
    - Include heading and sections.  
    - Incorporate keywords and key takeaways

  Generate bulleted list of key points and benefits

  Return possible and best recommended key words`,
      });

      console.log("API Response:", response);

      if (response && typeof response === "object" && response.text) {
        const assistantMessage: Message = { role: "assistant", content: response.text };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating text:", error);
      setError((error as Error).message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input) {
      alert("Please enter a YouTube link");
      return;
    }
    const newMessage: Message = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    fetchYouTubeData(input);
    setInput("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const ChatMessage: FC<{ message: Message }> = ({ message }) => {
    return (
      <div className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
        <div
          className={`relative flex items-center ${message.role === "assistant" ? "bg-gray-200 text-gray-900" : "bg-blue-500 text-white"} rounded-2xl px-4 py-2 max-w-[67%] whitespace-pre-wrap`}
          style={{ overflowWrap: "anywhere" }}
        >
          {message.content}
        </div>
      </div>
    );
  };

  const ChatLoader: FC = () => {
    return (
      <div className="flex justify-start">
        <div
          className="flex items-center bg-gray-200 text-gray-900 rounded-2xl px-4 py-2"
          style={{ overflowWrap: "anywhere" }}
        >
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="home-container">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">YouTube Link Analyzer</h2>

        <div className="flex justify-center space-x-4 mb-6">
          <Button onClick={() => router.push('/')}>Logout</Button>
        </div>

        <div className="flex flex-col max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-4 h-[80vh] overflow-hidden mb-6">
          <div className="flex-1 overflow-auto space-y-4 p-4 bg-gray-50 rounded-lg">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {loading && <ChatLoader />}
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="flex flex-row items-center space-x-2 p-4 bg-gray-50 rounded-lg shadow-inner"
          >
            <input
              type="text"
              placeholder={loading ? "Generating . . ." : "Enter YouTube link..."}
              value={input}
              disabled={loading}
              onChange={handleInputChange}
              className="flex-1 border-2 border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100"
            />
            <button
              type="submit"
              className="rounded-full shadow-md border bg-blue-500 text-white p-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Send className="h-6 w-6" />
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-red-500">Error: {error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
