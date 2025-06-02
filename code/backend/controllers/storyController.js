const Story = require('../models/StoryModel');
const GenerationRequest = require('../models/GenerationRequestModel');
const { generateStoryWithOpenAI, generateImageWithOpenAI } = require('../services/openaiService');

const generateCompleteStory = async (req, res) => {
  const startTime = Date.now();
  let generationRequest;
  console.log(req.validatedData);

  try {
    const { character, setting, theme, ageGroup = '3-5', style = 'watercolor', childId } = req.validatedData;
    const userId = req.user._id;
    
    console.log('Generating complete story package for:', { character, setting, theme, ageGroup });
    
    // Create generation request record
    generationRequest = new GenerationRequest({
      userId,
      parameters: { character, setting, theme, ageGroup, style },
      timing: { startTime: new Date(startTime) },
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
        }
      } else {
        storyData = storyResponse;
      }
      
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
    
    // Prepare response object
    const response = {
      success: true,
      generatedAt: new Date().toISOString(),
      generationTime: duration,
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
      generationRequest.timing.endTime = new Date();
      generationRequest.timing.duration = Date.now() - startTime;
      await generationRequest.save();
    }
    
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
};

// Get specific story
const getStory = async (req, res) => {
  try {
    const { id } = req.params;
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
    });
  }
};

// Save story to favorites
const saveStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const story = await Story.findOneAndUpdate(
      { _id: id, userId },
      { isSaved: true },
      { new: true }
    );
    
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
    });
  }
};

// Delete story
const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
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
    });
  }
};

module.exports = {
  generateCompleteStory,
  getUserStories,
  getStory,
  saveStory,
  deleteStory
};

