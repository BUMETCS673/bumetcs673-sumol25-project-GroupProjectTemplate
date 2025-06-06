import { useState } from "react";
import { useStoryContext } from "../../hooks/Story/useStoryContext";
// import { useAuthContext } from "../../hooks/Auth/AuthContext";
import { useAuthContext } from "../../hooks/Auth/useAuthContext";

export const useGenerateStory = () => {
  const { dispatch } = useStoryContext();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { user } = useAuthContext();

  const generateStory = async (generationParams) => {
    setIsLoading(true);
    setError(null);

    const BASE_URL =
      window.location.protocol === "file:" ||
      window.location.hostname === "localhost"
        ? "http://localhost:5500"
        : "https://mymagicalbedtime-25abceb2c11f.herokuapp.com";

    const response = await fetch(`${BASE_URL}/api/stories/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        character: generationParams.selectedCharacter,
        theme: generationParams.selectedTheme,
        setting: generationParams.selectedSetting,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    }


    if (response.ok) {
      // Dispatch the generated story to the context
      dispatch({ type: "GENERATE_STORY", payload: json });
      console.log("Generated Story:", json);
      setIsLoading(false);
    }
  };

  return { generateStory, isLoading, error };
};
