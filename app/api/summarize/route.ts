// import { NextRequest } from "next/server";
// import { fetchTranscript } from "@/lib/youtube-transcript";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { generateText } from "ai";



// function transformData(data: any[]) {
//     let text = "";
  
//     data.forEach((item) => {
//       text += item.text + " ";
//     });
  
//     return {
//       data: data,
//       text: text.trim(),
//     };
//   }

// // Initialize the Google Generative AI provider with the API key
// const googleGenerativeAI = createGoogleGenerativeAI({
//     apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string, // Ensure this is a string
// });
// // export async function generateSummary(link: string) {
// //     try {
// //       console.log("Generating text...");
  
// //       // Fetch the transcript
// //       const transcript = await fetchTranscript(link);
// //       if (!transcript || transcript.length === 0) {
// //         throw new Error("No transcript available for this video.");
// //       }
  
// //       const transformedData = transformData(transcript);
  
// //       // Use Google Generative AI to generate the summary
// //       const response = await generateText({
// //         model: googleGenerativeAI("models/gemini-pro"), // Adjust according to your setup
// //         // prompt: `For the following text, complete the following steps:
// //         //   - Generate the title based on the content provided.
// //         //   - Summarize the content and include 5 key topics, writing in the first person using a normal tone of voice.
// //         //   - Write a YouTube video description:
// //         //     - Include heading and sections.
// //         //     - Incorporate keywords and key takeaways.
// //         //   - Generate a bulleted list of key points and benefits.
// //         //   - Return possible and best-recommended keywords.
  
// //         //   Text: ${transformedData.text}`,
// //         prompt:`🚀 **YouTube Video Summary** 🚀
        
// //         Follow these steps to create an engaging summary for the provided content and Also add appropriate emojis to make it more nice and readable make it easily understandable:
        
// //         1. **🎯 Title Creation:**
// //            - Craft a title that accurately reflects the video's content and captures viewers' attention.
        
// //         2. **📝 Detailed Summary:**
// //            - Provide a concise summary with 5 key points.
// //            - Use a friendly, conversational tone in the first person.
        
// //         3. **📹 Video Description:**
// //            - **Heading**: Write a catchy heading for the video.
// //            - **Sections**: Organize the description into clear, informative sections.
// //            - **SEO**: Integrate relevant keywords and highlight the key takeaways.
        
// //         4. **📋 Key Points & Benefits:**
// //            - List the main points and benefits in bullet form for quick reference.
        
// //         5. **🔍 Keyword Optimization:**
// //            - Recommend the most effective keywords for improving the video's discoverability.
        
// //         ---
        
// //         **Content to Analyze**:
// //         ${transformedData.text}
// //         `,
// //       });
  
// //       console.log("API Response:", response);
  
// //       if (response && typeof response === "object" && response.text) {
// //         return response.text;
// //       } else {
// //         throw new Error("Invalid response format from the AI API");
// //       }
// //     } catch (error) {
// //       console.error("Error generating text:", error);
// //       throw new Error(error instanceof Error ? error.message : "Unknown error");
// //     }
// //   }
// export async function generateSummary(link: string, customQuestion: string = "") {
//     try {
//         console.log("Generating text...");

//         // Fetch the transcript
//         const transcript = await fetchTranscript(link);
//         if (!transcript || transcript.length === 0) {
//             throw new Error("No transcript available for this video.");
//         }

//         const transformedData = transformData(transcript);
//         console.log(transformedData);
//         // Determine the prompt based on whether a custom question is provided
//         const prompt = customQuestion
//             ? `🚀 **Custom Question Answering** 🚀
//                 Based on the video content, please provide a detailed answer to the following question:
                
//                 **Question:** ${customQuestion}
                
//                 ---
                
//                 **Content to Analyze**:
//                 ${transformedData.text}`
//             : `🚀 **YouTube Video Summary** 🚀
                
//                 Follow these steps to create an engaging summary for the provided content and add appropriate emojis to make it more nice and readable:
                
//                 1. **🎯 Title Creation:**
//                    - Craft a title that accurately reflects the video's content and captures viewers' attention.
                
//                 2. **📝 Detailed Summary:**
//                    - Provide a concise summary with 5 key points.
//                    - Use a friendly, conversational tone in the first person.
                
//                 3. **📹 Video Description:**
//                    - **Heading**: Write a catchy heading for the video.
//                    - **Sections**: Organize the description into clear, informative sections.
//                    - **SEO**: Integrate relevant keywords and highlight the key takeaways.
                
//                 4. **📋 Key Points & Benefits:**
//                    - List the main points and benefits in bullet form for quick reference.
                
//                 5. **🔍 Keyword Optimization:**
//                    - Recommend the most effective keywords for improving the video's discoverability.
                
//                 ---
                
//                 **Content to Analyze**:
//                 ${transformedData.text}`;

//         // Use Google Generative AI to generate the response
//         const response = await generateText({
//             model: googleGenerativeAI("models/gemini-pro"),
//             prompt,
//         });

//         console.log("API Response:", response);

//         if (response && typeof response === "object" && response.text) {
//             return response.text;
//         } else {
//             throw new Error("Invalid response format from the AI API");
//         }
//     } catch (error) {
//         console.error("Error generating text:", error);
//         throw new Error(error instanceof Error ? error.message : "Unknown error");
//     }
// }

//   export async function POST(req: NextRequest) {
//     try {
//       const body = await req.json();
//       const { videoId } = body;
  
//       // Ensure the videoId is valid before fetching the transcript
//       if (!videoId || typeof videoId !== "string") {
//         return new Response(JSON.stringify({ error: "Invalid video ID" }), {
//           status: 400,
//         });
//       }
  
//       let summary: string;
//       try {
//         summary = await generateSummary(videoId);
//       } catch (error) {
//         console.error("Error processing request:", error);
//         return new Response(
//           JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
//           { status: 500 }
//         );
//       }
  
//       return new Response(
//         JSON.stringify({ data: summary, error: null }),
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Error parsing request:", error);
//       return new Response(
//         JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
//         { status: 400 }
//       );
//     }
//   }
  
import { NextRequest } from "next/server";
import { fetchTranscript } from "@/lib/youtube-transcript";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Transform transcript data
function transformData(data: any[]) {
    let text = "";
    data.forEach((item) => {
        text += item.text + " ";
    });
    return {
        data: data,
        text: text.trim(),
    };
}

// Initialize the Google Generative AI provider
const googleGenerativeAI = createGoogleGenerativeAI({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string, // Ensure this is a string
});

// Generate summary or answer based on custom question
export async function generateSummary(link: string, customQuestion: string = "") {
    try {
        console.log("Generating text...");

        // Fetch the transcript
        const transcript = await fetchTranscript(link);
        if (!transcript || transcript.length === 0) {
            throw new Error("No transcript available for this video.");
        }

        const transformedData = transformData(transcript);
        console.log(transformedData);

        // Create prompt based on custom question or summary
        const prompt = customQuestion
            ? `🚀 **Custom Question Answering** 🚀
                Based on the video content, please provide a detailed answer to the following question:
                
                **Question:** ${customQuestion}
                
                ---
                
                **Content to Analyze**:
                ${transformedData.text}`
            : `🚀 **YouTube Video Summary** 🚀
                
                Follow these steps to create an engaging summary for the provided content and add appropriate emojis to make it more nice and readable:
                
                1. **🎯 Title Creation:**
                   - Craft a title that accurately reflects the video's content and captures viewers' attention.
                
                2. **📝 Detailed Summary:**
                   - Provide a concise summary with 5 key points.
                   - Use a friendly, conversational tone in the first person.
                
                3. **📹 Video Description:**
                   - **Heading**: Write a catchy heading for the video.
                   - **Sections**: Organize the description into clear, informative sections.
                   - **SEO**: Integrate relevant keywords and highlight the key takeaways.
                
                4. **📋 Key Points & Benefits:**
                   - List the main points and benefits in bullet form for quick reference.
                
                5. **🔍 Keyword Optimization:**
                   - Recommend the most effective keywords for improving the video's discoverability.
                
                ---
                
                **Content to Analyze**:
                ${transformedData.text}`;

        // Generate response using Google Generative AI
        const response = await generateText({
            model: googleGenerativeAI("models/gemini-pro"),
            prompt,
        });

        console.log("API Response:", response);

        if (response && typeof response === "object" && response.text) {
            return response.text;
        } else {
            throw new Error("Invalid response format from the AI API");
        }
    } catch (error) {
        console.error("Error generating text:", error);
        throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
}

// Handle POST request for generating summary
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { videoId, customQuestion } = body;

        // Validate videoId
        if (!videoId || typeof videoId !== "string") {
            return new Response(JSON.stringify({ error: "Invalid video ID" }), {
                status: 400,
            });
        }

        // Generate summary
        let summary: string;
        try {
            summary = await generateSummary(videoId, customQuestion);
        } catch (error) {
            console.error("Error processing request:", error);
            return new Response(
                JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ data: summary, error: null }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error parsing request:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 400 }
        );
    }
}

// Service function to call API endpoint
export async function generateSummaryService(videoId: string, customQuestion: string = "") {
    const url = "/api/summarize";
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoId, customQuestion }), // Add customQuestion to the request body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }

        return data;
    } catch (error) {
        console.error("Failed to generate summary:", error);
        return { data: null, error: { message: error instanceof Error ? error.message : "Unknown error" } };
    }
}
