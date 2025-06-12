import React, { useState, useEffect, useMemo } from "react";
import {
  Book,
  Play,
  Calendar,
  User,
  MapPin,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import "./MyStory.css";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/Auth/useAuthContext";
import StoryModal from "../../components/StoryModal/StoryModal";
import FullImageViewer from "../../components/FullImageViewer/FullImageViewer";
const MyStory = ({ loading: propLoading = false }) => {
  // State management
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState({
    character: "",
    setting: "",
    theme: "",
  });
  const [showFullImage, setShowFullImage] = useState(false);
const [showFullImageStory, setShowFullImageStory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(propLoading);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null); // Track which story is being saved
  const [deleting, setDeleting] = useState(null); // Track which story is being deleted
  const { user } = useAuthContext();

  const navigate = useNavigate();
  const storiesPerPage = 12;

  // Story selection handlers
  const onStorySelect = (story) => {
    const storyIndex = filteredAndSortedStories.findIndex(
      (s) => s.id === story.id
    );
    setSelectedStory(story);
    setSelectedStoryIndex(storyIndex);
    setIsModalOpen(true);
  };

  const closeStoryModal = () => {
    setIsModalOpen(false);
    setSelectedStory(null);
    setSelectedStoryIndex(-1);
  };

  const goToNextStory = () => {
    if (selectedStoryIndex < filteredAndSortedStories.length - 1) {
      const nextIndex = selectedStoryIndex + 1;
      const nextStory = filteredAndSortedStories[nextIndex];
      setSelectedStory(nextStory);
      setSelectedStoryIndex(nextIndex);
    }
  };

  const goToPreviousStory = () => {
    if (selectedStoryIndex > 0) {
      const prevIndex = selectedStoryIndex - 1;
      const prevStory = filteredAndSortedStories[prevIndex];
      setSelectedStory(prevStory);
      setSelectedStoryIndex(prevIndex);
    }
  };

  // API Functions
  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      const BASE_URL =
        window.location.protocol === "file:" ||
        window.location.hostname === "localhost"
          ? "http://localhost:5500"
          : "https://mymagicalbedtime-25abceb2c11f.herokuapp.com";

      // Replace with your actual API endpoint
      const response = await fetch(`${BASE_URL}/api/stories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }

      const data = await response.json();
      console.log(data);
      setStories(data.response.stories || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching stories:", err);
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveStory = async (storyId) => {
    try {
      setSaving(storyId);

      const response = await fetch(`/api/stories/${storyId}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to save story");
      }

      // Update local state to reflect saved status
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? { ...story, isSaved: true, savedAt: new Date().toISOString() }
            : story
        )
      );
    } catch (err) {
      console.error("Error saving story:", err);
      setError("Failed to save story");
    } finally {
      setSaving(null);
    }
  };

  const deleteStory = async (storyId) => {
    try {
      setDeleting(storyId);

      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete story");
      }

      // Remove story from local state
      setStories((prev) => prev.filter((story) => story.id !== storyId));

      // Adjust current page if needed
      const newTotalPages = Math.ceil((stories.length - 1) / storiesPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Error deleting story:", err);
      setError("Failed to delete story");
    } finally {
      setDeleting(null);
    }
  };

  // Load stories on component mount
  useEffect(() => {
    fetchStories();
  }, []);

  // Advanced filtering and sorting
  const filteredAndSortedStories = useMemo(() => {
    let filtered = stories.filter((story) => {
      const matchesSearch =
        !searchTerm ||
        story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.character?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.setting?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.theme?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCharacter =
        !filterBy.character || story?.character === filterBy.character;

      const matchesSetting =
        !filterBy.setting || story?.setting === filterBy.setting;

      const matchesTheme = !filterBy.theme || story?.theme === filterBy.theme;

      return (
        matchesSearch && matchesCharacter && matchesSetting && matchesTheme
      );
    });

    // Sort stories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [stories, searchTerm, sortBy, filterBy]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedStories.length / storiesPerPage
  );
  const startIndex = (currentPage - 1) * storiesPerPage;
  const paginatedStories = filteredAndSortedStories.slice(
    startIndex,
    startIndex + storiesPerPage
  );

  // Get unique values for filters
  const uniqueCharacters = [
    ...new Set(stories.map((s) => s.character).filter(Boolean)),
  ];
  const uniqueSettings = [
    ...new Set(stories.map((s) => s.setting).filter(Boolean)),
  ];
  const uniqueThemes = [
    ...new Set(stories.map((s) => s.theme).filter(Boolean)),
  ];

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, filterBy]);
// showFullImage
  const showFullImageHandler = (curStory) => {
    console.log(curStory);
    setShowFullImageStory(curStory);
    setShowFullImage(true);
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBy({ character: "", setting: "", theme: "" });
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchTerm || filterBy.character || filterBy.setting || filterBy.theme;

  if (loading) {
    return (
      <div className="story-list-container">
        <div className="story-list-loading">
          <Sparkles className="loading-icon" />
          <p>Loading your magical stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="story-list-container">
      <FullImageViewer
        isOpen={showFullImage}
        imageUrl={showFullImageStory?.imageUrl}
        title={showFullImageStory?.title}
        onClose={() => setShowFullImage(false)}
        showControls={true} // Show zoom, rotate, download controls
        allowDownload={true} // Allow image download
      />

      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={closeStoryModal}
        onNext={
          selectedStoryIndex < filteredAndSortedStories.length - 1
            ? goToNextStory
            : null
        }
        onPrevious={selectedStoryIndex > 0 ? goToPreviousStory : null}
      />
      <div className="story-list-header">
        <div className="header-content">
          <h1>
            <Book className="header-icon" />
            Your Story Collection
          </h1>
          <p className="header-subtitle">
            {stories.length} magical{" "}
            {stories.length === 1 ? "story" : "stories"} waiting to be explored
          </p>
        </div>

        <button
          className="create-new-btn"
          onClick={() => navigate("/generatestory")}
        >
          <Sparkles size={16} />
          Create New Story
        </button>
      </div>

      <div className="story-list-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search stories, characters, themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <Filter className="filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterBy.character}
              onChange={(e) =>
                setFilterBy((prev) => ({ ...prev, character: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All Characters</option>
              {uniqueCharacters.map((char) => (
                <option key={char} value={char}>
                  {char}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterBy.setting}
              onChange={(e) =>
                setFilterBy((prev) => ({ ...prev, setting: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All Settings</option>
              {uniqueSettings.map((setting) => (
                <option key={setting} value={setting}>
                  {setting}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterBy.theme}
              onChange={(e) =>
                setFilterBy((prev) => ({ ...prev, theme: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All Themes</option>
              {uniqueThemes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {filteredAndSortedStories.length === 0 ? (
        <div className="empty-state">
          {stories.length === 0 ? (
            <>
              <Book className="empty-icon" />
              <h3>No stories yet</h3>
              <p>Create your first magical story to get started!</p>
              <button
                className="create-first-story-btn"
                onClick={() => navigate("/generatestory")}
              >
                <Sparkles size={16} />
                Create Your First Story
              </button>
            </>
          ) : (
            <>
              <Search className="empty-icon" />
              <h3>No stories found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="stories-grid">
            {paginatedStories.map((story) => (
              <div key={story.id} className="story-card">
                <div className="story-card-image">
                  {story.imageUrl ? (
                    <img
                      src={story.imageUrl}
                      alt={story.title || "Story illustration"}
                      className="story-thumbnail"
                      loading="lazy" // Browser lazy loading
                      decoding="async" // Async image decoding
                    />
                  ) : (
                    <div className="story-placeholder">
                      <Book className="placeholder-icon" />
                    </div>
                  )}

                  <div className="story-card-overlay">
                    <button
                      onClick={() => showFullImageHandler(story)}
                      className="story-action-btn primary"
                      title="Read Story"
                    >
                      <Eye size={16} />
                    </button>

                    {story.audioUrl && (
                      <button
                        onClick={() => onStorySelect(story)}
                        className="story-action-btn secondary"
                        title="Play Audio"
                      >
                        <Play size={16} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveStory(story.id);
                      }}
                      className={`story-action-btn ${
                        story.isSaved ? "saved" : "save"
                      }`}
                      title={story.isSaved ? "Saved" : "Save Story"}
                      disabled={saving === story.id}
                    >
                      <Save size={14} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Are you sure you want to delete this story?"
                          )
                        ) {
                          deleteStory(story.id);
                        }
                      }}
                      className="story-action-btn danger"
                      title="Delete Story"
                      disabled={deleting === story.id}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="story-card-content">
                  <h3 className="story-title">
                    {story.title || "Untitled Story"}
                  </h3>

                  <div className="story-metadata">
                    {story.character && (
                      <div className="metadata-item">
                        <User size={12} />
                        <span>{story.character}</span>
                      </div>
                    )}

                    {story.setting && (
                      <div className="metadata-item">
                        <MapPin size={12} />
                        <span>{story.setting}</span>
                      </div>
                    )}

                    {story.theme && (
                      <div className="metadata-item">
                        <Sparkles size={12} />
                        <span>{story.theme}</span>
                      </div>
                    )}
                  </div>

                  {story.summary && (
                    <p className="story-preview">
                      {truncateText(story.summary)}
                    </p>
                  )}

                  <div className="story-card-footer">
                    <div className="story-date">
                      <Calendar size={12} />
                      <span>{formatDate(story.createdAt)}</span>
                    </div>

                    <div className="story-features">
                      {story.isSaved && (
                        <span className="feature-badge saved">
                          <Save size={10} />
                          Saved
                        </span>
                      )}
                      {story.audioUrl && (
                        <span className="feature-badge audio">
                          <Play size={10} />
                          Audio
                        </span>
                      )}
                      {story.imageUrl && (
                        <span className="feature-badge image">
                          <Eye size={10} />
                          Image
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
      <div className="pagination-info">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <span className="pagination-details">
          Showing {startIndex + 1}-
          {Math.min(
            startIndex + storiesPerPage,
            filteredAndSortedStories.length
          )}{" "}
          of {filteredAndSortedStories.length}
        </span>
      </div>
      {filteredAndSortedStories.length > 0 && (
        <div className="story-list-summary">
          <p>
            Showing {filteredAndSortedStories.length} of {stories.length}{" "}
            stories
            {searchTerm && ` matching "${searchTerm}"`}
            {hasActiveFilters && ` with current filters`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyStory;

/** @ai-generated 
Basic structure of the component was AI generated
Tool: Claude (Anthropic)
Link: https://claude.ai/chat/3ec44bc7-3ce2-4e0f-9600-f909671b1292
Prompt: "Create a React component for displaying a list of user stories 
with search, filter, and sort functionality. 
The component should include a header with the number of stories, 
a search bar, and options to filter by character, theme, and setting. 
Each story card should display the title, metadata (character, theme, setting),
creation date, and an image if available. Include buttons for reading the story,
playing audio if available, and deleting the story. Ensure the UI is clean and user-friendly."
/*
Modified by:  Hongjie Zhang
Modifications: Fix nav link, add margin to the header, add loading state,
add empty state when no stories are available,
Verified:  Reviewed, partially edited*/
