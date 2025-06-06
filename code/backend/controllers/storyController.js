<<<<<<< HEAD
const Story = require("../models/StoryModel");
const GenerationRequest = require("../models/GenerationRequestModel");
const {
  generateStoryWithOpenAI,
  generateImageWithOpenAI,
  generateAudioWithOpenAI,
} = require("../services/openaiService");
const {
  saveImageFile,
  saveAudioFile,
} = require("../services/firebaseStorageService");
=======
const Story = require('../models/StoryModel');
const GenerationRequest = require('../models/GenerationRequestModel');
const { generateStoryWithOpenAI, generateImageWithOpenAI } = require('../services/openaiService');
>>>>>>> origin/main

const generateCompleteStory = async (req, res) => {
  const startTime = Date.now();
  let generationRequest;
  console.log(req.validatedData);

  try {
<<<<<<< HEAD
    const {
      character,
      setting,
      theme,
      ageGroup = "3-5",
      style = "watercolor",
      childId,
    } = req.validatedData;
    const userId = req.user._id;

    console.log("Generating complete story package for:", {
      character,
      setting,
      theme,
      ageGroup,
    });

=======
    const { character, setting, theme, ageGroup = '3-5', style = 'watercolor', childId } = req.validatedData;
    const userId = req.user._id;
    
    console.log('Generating complete story package for:', { character, setting, theme, ageGroup });
    
>>>>>>> origin/main
    // Create generation request record
    generationRequest = new GenerationRequest({
      userId,
      parameters: { character, setting, theme, ageGroup, style },
      timing: { startTime: new Date(startTime) },
<<<<<<< HEAD
      status: "processing",
      results: {}, // Initialize results object
    });
    await generationRequest.save();

    // Generate story first
    let storyData = null;
    let imageResult = null;
    let audioResult = null;

    try {
      // Generate story with imageDescription
      const storyResponse = await generateStoryWithOpenAI({
        character,
        setting,
        theme,
        ageGroup,
      });

      // Debug logging
      console.log("Story generation raw response:", storyResponse);
      console.log("Type of storyResponse:", typeof storyResponse);

      // Parse the response if it's a string
      if (typeof storyResponse === "string") {
        try {
          // Clean the JSON string before parsing
          let cleanedResponse = storyResponse
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/\r/g, "\\r") // Escape carriage returns
            .replace(/\t/g, "\\t") // Escape tabs
            .replace(/\f/g, "\\f") // Escape form feeds
            .replace(/\b/g, "\\b") // Escape backspaces
            .replace(/\\/g, "\\\\") // Escape backslashes (but do this after other escapes)
            .replace(/"/g, '\\"'); // Escape quotes

          // Alternative approach: try to extract JSON from the response
          const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
          }

          console.log("Attempting to parse cleaned response...");
          storyData = JSON.parse(cleanedResponse);
          console.log("Successfully parsed story data:", storyData);
        } catch (parseError) {
          console.error(
            "Failed to parse story response after cleaning:",
            parseError
          );
          console.log(
            "Original response:",
            storyResponse.substring(0, 500) + "..."
          );

          // Fallback: try to manually extract the data using regex
          try {
            console.log("Attempting manual extraction...");
            const titleMatch = storyResponse.match(/"title":\s*"([^"]+)"/);
            const storyMatch = storyResponse.match(
              /"story":\s*"([\s\S]*?)(?=",\s*"summary")/
            );
            const summaryMatch = storyResponse.match(/"summary":\s*"([^"]+)"/);
            const imageDescMatch = storyResponse.match(
              /"imageDescription":\s*"([\s\S]*?)(?="\s*})/
            );

            if (titleMatch && storyMatch && summaryMatch && imageDescMatch) {
              storyData = {
                title: titleMatch[1],
                story: storyMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
                summary: summaryMatch[1],
                imageDescription: imageDescMatch[1]
                  .replace(/\\n/g, "\n")
                  .replace(/\\"/g, '"'),
              };
              console.log("Manual extraction successful:", storyData);
            } else {
              throw new Error("Could not extract story data from response");
            }
          } catch (extractError) {
            console.error("Manual extraction failed:", extractError);
            throw new Error(
              "Invalid story response format - could not parse or extract data"
            );
          }
=======
      status: 'processing'
    });
    await generationRequest.save();
    
    // Generate story first
    let storyData = null;
    let imageResult = null;
    
    try {
      // Generate story with imageDescription
      const storyResponse = await generateStoryWithOpenAI({ character, setting, theme, ageGroup });

      // Debug logging
      console.log('Story generation raw response:', storyResponse);
      console.log('Type of storyResponse:', typeof storyResponse);
      
      // Parse the response if it's a string
      if (typeof storyResponse === 'string') {
        try {
          storyData = JSON.parse(storyResponse);
          console.log('Parsed story data:', storyData);
        } catch (parseError) {
          console.error('Failed to parse story response:', parseError);
          throw new Error('Invalid story response format');
>>>>>>> origin/main
        }
      } else {
        storyData = storyResponse;
      }
<<<<<<< HEAD

      // Validate that we have the required fields
      if (
        !storyData ||
        !storyData.story ||
        !storyData.title ||
        !storyData.imageDescription
      ) {
        console.error("Missing required fields in story data:", storyData);
        throw new Error("Incomplete story data received");
      }

      // Update generation request for successful story
      generationRequest.results.storyGenerated = true;

      // Generate audio and image in parallel
      const [audioPromise, imagePromise] = await Promise.allSettled([
        // Audio generation
        storyData && storyData.story
          ? (async () => {
              try {
                console.log("Starting audio generation...");

                const audioGenerationResult = await generateAudioWithOpenAI({
                  text: storyData.story,
                  voice: req.validatedData.voice || "nova",
                  model: req.validatedData.audioModel || "tts-1",
                  responseFormat: req.validatedData.audioFormat || "mp3",
                  speed: 0.8,
                });

                console.log(
                  "Audio generation completed, received buffer of size:",
                  audioGenerationResult.audioBuffer?.length
                );

                if (audioGenerationResult.audioBuffer) {
                  generationRequest.results.audioGenerated = true;
                  return {
                    audioBuffer: audioGenerationResult.audioBuffer,
                    voice: req.validatedData.voice || "nova",
                    audioFormat: req.validatedData.audioFormat || "mp3",
                  };
                } else {
                  console.error("No audio buffer received from OpenAI");
                  generationRequest.results.audioError =
                    "No audio buffer received";
                  return null;
                }
              } catch (audioError) {
                console.error("Audio generation failed:", audioError);
                generationRequest.results.audioError =
                  audioError.message || "Unknown audio error";
                return null;
              }
            })()
          : Promise.resolve(null),

        // Image generation
        storyData && storyData.imageDescription
          ? (async () => {
              try {
                const result = await generateImageWithOpenAI(
                  storyData.imageDescription
                );
                generationRequest.results.imageGenerated = true;
                return result;
              } catch (imageError) {
                console.error("Image generation failed:", imageError);
                generationRequest.results.imageError =
                  imageError.message || "Unknown error";
                return null;
              }
            })()
          : Promise.resolve(null),
      ]);

      // Extract results from settled promises
      audioResult =
        audioPromise.status === "fulfilled" ? audioPromise.value : null;
      imageResult =
        imagePromise.status === "fulfilled" ? imagePromise.value : null;
    } catch (storyError) {
      console.error("Story generation failed:", storyError);
      generationRequest.results.storyError =
        storyError.message || "Unknown error";
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

=======
      
       // Validate that we have the required fields
      if (!storyData || !storyData.story || !storyData.title || !storyData.imageDescription) {
        console.error('Missing required fields in story data:', storyData);
        throw new Error('Incomplete story data received');
      }
      
      // Update generation request for successful story
      generationRequest.results.storyGenerated = true;
      
      // Generate image using the imageDescription from story
      if (storyData && storyData.imageDescription) {
        try {
          imageResult = await generateImageWithOpenAI(storyData.imageDescription);
          generationRequest.results.imageGenerated = true;
        } catch (imageError) {
          console.error('Image generation failed:', imageError);
          generationRequest.results.imageError = imageError.message || 'Unknown error';
        }
      }
    } catch (storyError) {
      console.error('Story generation failed:', storyError);
      generationRequest.results.storyError = storyError.message || 'Unknown error';
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
>>>>>>> origin/main
    // Prepare response object
    const response = {
      success: true,
      generatedAt: new Date().toISOString(),
      generationTime: duration,
<<<<<<< HEAD
      metadata: { character, setting, theme, ageGroup, style },
    };

    // Process story result
    let savedStory = null;

    if (storyData) {
      const wordCount = storyData.story.split(" ").length;

      response.title = storyData.title;
      response.content = storyData.story;
      response.summary = storyData.summary;
      response.imageDescription = storyData.imageDescription;
      response.wordCount = wordCount;

      // Process image result
      let imageUrl = null;
      let revisedPrompt = null;

      if (imageResult) {
        imageUrl = imageResult.imageUrl;
        revisedPrompt = imageResult.revisedPrompt;
        response.revisedPrompt = revisedPrompt;
      } else {
        response.imageError = "Failed to generate image";
      }

=======
      metadata: { character, setting, theme, ageGroup, style }
    };
    
    // Process story result
    let savedStory = null;
    
    if (storyData) {
      const wordCount = storyData.story.split(' ').length;
      
      response.title = storyData.title;
      response.story = storyData.story;
      response.summary = storyData.summary;
      response.imageDescription = storyData.imageDescription;
      response.wordCount = wordCount;
      
      // Process image result
      let imageUrl = null;
      let revisedPrompt = null;
      
      if (imageResult) {
        imageUrl = imageResult.imageUrl;
        revisedPrompt = imageResult.revisedPrompt;
        response.imageUrl = imageUrl;
        response.revisedPrompt = revisedPrompt;
      } else {
        response.imageError = 'Failed to generate image';
      }
      
>>>>>>> origin/main
      // Save story to database
      savedStory = new Story({
        userId,
        childId: childId || null,
        title: storyData.title,
        content: storyData.story,
        summary: storyData.summary,
        imageDescription: storyData.imageDescription,
        character,
        setting,
        theme,
        ageGroup,
        wordCount,
        imageUrl,
        imageStyle: style,
<<<<<<< HEAD
        audioBuffer: audioResult ? audioResult.audioBuffer : null,
        audioUrl: null, // Will be set after upload
        revisedPrompt,
        isComplete: !!(storyData && imageUrl),
        generationTime: duration,
        generatedAt: new Date(),
      });

      await savedStory.save();
      response.storyId = savedStory._id;
      response.audioBuffer = audioResult ? audioResult.audioBuffer : null;
    } else {
      response.success = false;
      response.storyError = "Failed to generate story";
    }

    // Upload files to storage
    const uploadPromises = [];

    // Upload image if available
    if (imageResult && imageResult.imageUrl && savedStory) {
      uploadPromises.push(
        saveImageFile(imageResult.imageUrl, savedStory._id)
          .then((imageDownloadUrl) => {
            response.imageDownloadUrl = imageDownloadUrl;
            return { type: "image", url: imageDownloadUrl };
          })
          .catch((imageUploadError) => {
            console.error(
              "Failed to upload image to Firebase Storage:",
              imageUploadError
            );
            response.imageUploadError =
              imageUploadError.message || "Unknown image upload error";
            return { type: "image", error: imageUploadError };
          })
      );
    }

    // Upload audio if available
    if (audioResult && audioResult.audioBuffer && savedStory) {
      uploadPromises.push(
        saveAudioFile(audioResult.audioBuffer, savedStory._id)
          .then((audioDownloadUrl) => {
            response.audioDownloadUrl = audioDownloadUrl;
            return { type: "audio", url: audioDownloadUrl };
          })
          .catch((audioUploadError) => {
            console.error(
              "Failed to upload audio to Firebase Storage:",
              audioUploadError
            );
            response.audioUploadError =
              audioUploadError.message || "Unknown audio upload error";
            return { type: "audio", error: audioUploadError };
          })
      );
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      const uploadResults = await Promise.allSettled(uploadPromises);

      // Update saved story with download URLs
      const updates = {};
      for (const result of uploadResults) {
        if (result.status === "fulfilled" && result.value.url) {
          if (result.value.type === "image") {
            updates.imageUrl = result.value.url;
          } else if (result.value.type === "audio") {
            updates.audioUrl = result.value.url;
            generationRequest.results.audioUrl = result.value.url;
          }
        }
      }

      // Update story with URLs if any were uploaded
      if (Object.keys(updates).length > 0 && savedStory) {
        await Story.findByIdAndUpdate(savedStory._id, updates);
      }
    }

    // Update generation request with final status
    generationRequest.timing.endTime = new Date(endTime);
    generationRequest.timing.duration = duration;
    generationRequest.status = storyData ? "completed" : "failed";
    await generationRequest.save();

    res.json(response);
  } catch (error) {
    console.error("Error generating complete package:", error);

    // Update generation request with error
    if (generationRequest) {
      generationRequest.status = "failed";
=======
        revisedPrompt,
        isComplete: !!(storyData && imageUrl),
        generationTime: duration,
        generatedAt: new Date()
      });
      
      await savedStory.save();
      response.storyId = savedStory._id;
      response.storySlug = savedStory.storyId;
    } else {
      response.success = false;
      response.storyError = 'Failed to generate story';
    }
    
    // Update generation request with final status
    generationRequest.timing.endTime = new Date(endTime);
    generationRequest.timing.duration = duration;
    generationRequest.status = storyData ? 'completed' : 'failed';
    await generationRequest.save();
    
    res.json(response);
    
  } catch (error) {
    console.error('Error generating complete package:', error);
    
    // Update generation request with error
    if (generationRequest) {
      generationRequest.status = 'failed';
>>>>>>> origin/main
      generationRequest.timing.endTime = new Date();
      generationRequest.timing.duration = Date.now() - startTime;
      await generationRequest.save();
    }
<<<<<<< HEAD

    res.status(500).json({
      success: false,
      error: "Failed to generate complete story package",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Get user's stories
const getUserStories = async (req, res) => {
  try {
    const userId = req.user._id;

    const query = { userId };

    const stories = await Story.find(query).sort({ createdAt: -1 });
    response = {
      success: true,
      total: stories.length,
      stories: stories.map((story) => ({
        storyId: story._id,
        title: story.title,
        summary: story.summary,
        imageUrl: story.imageUrl,
        createdAt: story.createdAt,
        isSaved: story.isSaved,
        character: story.character,
        setting: story.setting,
        theme: story.theme,
        wordCount: story.wordCount,
        isFavorite: story.isFavorite,
      })),
    };
    res.json({
      response,
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stories",
    });
  }
=======
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate complete story package',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's stories
const getUserStories = async (req, res) => {
 try {
   const userId = req.user._id;
   
   const stories = await Story.find({ userId: userId })
     .sort({ createdAt: -1 });
   
   res.json({
     success: true,
     stories,
     total: stories.length
   });
 } catch (error) {
   console.error('Error fetching stories:', error);
   res.status(500).json({
     success: false,
     error: 'Failed to fetch stories'
   });
 }
>>>>>>> origin/main
};

// Get specific story
const getStory = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const userId = req.user.id;

    const story = await Story.findOne({ _id: id, userId });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    customResponse = {
      storyId: story._id,
      title: story.title,
      content: story.content,
      summary: story.summary,
      audioBuffer: story.audioBuffer,
      imageDescription: story.imageDescription,
      imageDownloadUrl: story.imageUrl,
      audioDownloadUrl: story.audioUrl,
      metadata: {
        character: story.character,
        setting: story.setting,
        theme: story.theme,
        ageGroup: story.ageGroup,
      },
      wordCount: story.wordCount,
      imageStyle: story.imageStyle,
      isFavorite: story.isFavorite,
      createdAt: story.createdAt,
    };
    res.json({
      story:customResponse
    });
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch story",
=======
    const userId = req.user._id;
    
    const story = await Story.findOne({ _id: id, userId });
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    res.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch story'
>>>>>>> origin/main
    });
  }
};

// Save story to favorites
const saveStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
<<<<<<< HEAD

=======
    
>>>>>>> origin/main
    const story = await Story.findOneAndUpdate(
      { _id: id, userId },
      { isSaved: true },
      { new: true }
    );
<<<<<<< HEAD

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.json({
      success: true,
      message: "Story saved to favorites",
      story,
    });
  } catch (error) {
    console.error("Error saving story:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save story",
=======
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Story saved to favorites',
      story
    });
  } catch (error) {
    console.error('Error saving story:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save story'
>>>>>>> origin/main
    });
  }
};

// Delete story
const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
<<<<<<< HEAD

    const story = await Story.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.json({
      success: true,
      message: "Story deleted successfully",
      deletedStory: story,
    });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete story",
=======
    
    const story = await Story.findOneAndDelete({
      _id: id,
      userId
    });
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Story deleted successfully',
      deletedStory: story
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete story'
>>>>>>> origin/main
    });
  }
};

<<<<<<< HEAD
=======
/**
 * Validates story parameters
 * @param {Object} params - Story generation parameters
 * @param {string} params.character - Main character for the story
 * @param {string} params.setting - Story setting/location
 * @param {string} params.theme - Story theme
 * @param {string} params.ageGroup - Target age group (3-5, 6-8, 9-12)
 * @returns {Object} Validation result with isValid boolean and errors array
 */
function validateStoryParameters(params) {
  const errors = [];
  const validAgeGroups = ['3-5', '6-8', '9-12'];

  // Check required fields
  if (!params.character || params.character.trim() === '') {
    errors.push('Character is required');
  }

  if (!params.setting || params.setting.trim() === '') {
    errors.push('Setting is required');
  }

  if (!params.theme || params.theme.trim() === '') {
    errors.push('Theme is required');
  }

  // Validate age group
  if (!validAgeGroups.includes(params.ageGroup)) {
    errors.push('Invalid age group. Must be one of: 3-5, 6-8, 9-12');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates story data using OpenAI service
 * @param {Object} params - Story generation parameters
 * @param {string} params.character - Main character for the story
 * @param {string} params.setting - Story setting/location
 * @param {string} params.theme - Story theme
 * @param {string} params.ageGroup - Target age group
 * @returns {Promise<Object>} Generated story data
 * @throws {Error} When validation fails or story generation fails
 */
async function generateStoryData(params) {
  try {
    // First validate the parameters
    const validation = validateStoryParameters(params);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Call OpenAI service to generate the story
    const storyResponse = await generateStoryWithOpenAI(params);
    
    // Parse the response
    let storyData;
    try {
      storyData = JSON.parse(storyResponse);
    } catch (parseError) {
      throw new Error('Invalid response format from story generation service');
    }

    // Validate that all required fields are present and not empty
    const requiredFields = ['title', 'story', 'summary', 'imageDescription'];
    const missingFields = requiredFields.filter(field => !storyData[field] || storyData[field].trim() === '');
    
    if (missingFields.length > 0) {
      throw new Error('Incomplete story data received');
    }

    return storyData;

  } catch (error) {
    // Re-throw validation errors as-is
    if (error.message.startsWith('Validation failed:')) {
      throw error;
    }
    
    // Re-throw incomplete data errors as-is
    if (error.message === 'Incomplete story data received') {
      throw error;
    }
    
    // Re-throw invalid response format errors as-is
    if (error.message === 'Invalid response format from story generation service') {
      throw error;
    }
    
    // Wrap other errors with context
    throw new Error(`Story generation failed: ${error.message}`);
  }
}

>>>>>>> origin/main
module.exports = {
  generateCompleteStory,
  getUserStories,
  getStory,
  saveStory,
  deleteStory,
<<<<<<< HEAD
};
=======
  // Export for testing
  generateStoryData,
  validateStoryParameters
};

>>>>>>> origin/main
