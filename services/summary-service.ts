export async function generateSummaryService(videoId: string, customQuestion: string = "") {
    const url = "/api/summarize";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ videoId: videoId ,answer: customQuestion}),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to generate summary:", error);
      if (error instanceof Error) return { error: { message: error.message } };
      return { data: null, error: { message: "Unknown error" } };
    }
  }


