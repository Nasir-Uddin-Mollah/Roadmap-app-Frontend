import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CommentTree = ({
  comment,
  depth = 0,
  handleCommentSubmit,
  fetchComments,
  token,
  user_id,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [editError, setEditError] = useState("");

  const handleReplySubmit = () => {
    handleCommentSubmit(comment.id, replyText, () => {
      setReplyText("");
      setShowReply(false);
      setReplyError("");
    }).catch((error) => {
      setReplyError(error);
    });
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(
        `https://roadmap-app-co73.onrender.com/comments/list/${comment.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: editText }),
        }
      );
      if (response.ok) {
        setEditMode(false);
        fetchComments();
      } else {
        throw new Error("Failed to edit comment");
      }
    } catch {
      setEditError("Error updating comment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await fetch(
        `https://roadmap-app-co73.onrender.com/comments/list/${comment.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchComments();
    } catch {
      alert("Failed to delete comment");
    }
  };

  const userInitial = comment.username
    ? comment.username.charAt(0).toUpperCase()
    : "U";

  return (
    <div
      className="mt-3 relative"
      style={{ marginLeft: `${Math.min(depth * 18, 72)}px` }}
    >
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm mt-0.5">
          {userInitial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm shadow-xs">
            {editMode ? (
              <div className="space-y-2">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition"
                    onClick={handleEditSubmit}
                  >
                    Save
                  </button>
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                  {editError && (
                    <p className="text-red-500 text-xs">{editError}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-xs">
                    {comment.username}
                  </span>
                  {parseInt(comment.user) === parseInt(user_id) && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        className="text-gray-400 hover:text-blue-600 cursor-pointer transition"
                        onClick={() => setEditMode(true)}
                        title="Edit comment"
                      >
                        Edit
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600 cursor-pointer transition"
                        onClick={handleDelete}
                        title="Delete comment"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            )}
          </div>

          {token && user_id && (
            <div className="mt-1 flex items-center gap-3 text-xs pl-1">
              <button
                className="text-gray-500 hover:text-blue-600 font-medium cursor-pointer transition"
                onClick={() => setShowReply(!showReply)}
              >
                {showReply ? "Cancel reply" : "Reply"}
              </button>
            </div>
          )}

          {replyError && (
            <p className="text-red-600 text-xs mt-1 pl-1">{replyError}</p>
          )}

          {showReply && (
            <div className="mt-2.5 flex items-start gap-2">
              <textarea
                rows="2"
                className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                placeholder={`Reply to ${comment.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition"
                onClick={handleReplySubmit}
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentTree
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          handleCommentSubmit={handleCommentSubmit}
          fetchComments={fetchComments}
          token={token}
          user_id={user_id}
        />
      ))}
    </div>
  );
};

export default function RoadmapItemsCard({ item, token, user_id }) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [upvoted, setUpvoted] = useState(item.upvoted || false);
  const [upvoteCount, setUpvoteCount] = useState(item.upvote_count || 0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchUpvoteStatus = async () => {
      try {
        const response = await fetch(
          `https://roadmap-app-co73.onrender.com/roadmaps/items/?id=${item.id}`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        const data = await response.json();
        const updatedItem = data.results?.[0] || data[0];

        if (updatedItem) {
          setUpvoted(Boolean(updatedItem.upvoted));
          setUpvoteCount(updatedItem.upvote_count ?? 0);
        }
      } catch (error) {
        console.error("Error fetching upvote status:", error);
      }
    };

    if (token && user_id) {
      fetchUpvoteStatus();
    }
  }, [item.id, token, user_id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(
        `https://roadmap-app-co73.onrender.com/comments/list/?item_id=${item.id}`
      );
      const data = await response.json();
      setComments(data.results || data);
    } catch (error) {
      console.log("Failed to fetch comments", error);
    }
  }, [item.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (showComments) {
      const interval = setInterval(fetchComments, 5000);
      return () => clearInterval(interval);
    }
  }, [showComments, fetchComments]);

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleCommentSubmit = async (
    parentId = null,
    text = newComment,
    onSuccess = () => {}
  ) => {
    if (!text.trim()) return;
    if (!token || !user_id) {
      navigate("/login");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(
        "https://roadmap-app-co73.onrender.com/comments/list/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item: item.id,
            body: text,
            parent: parentId,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        onSuccess();
        fetchComments();
      } else {
        const firstError =
          data.non_field_errors?.[0] ||
          data?.user?.[0] ||
          data?.body?.[0] ||
          "Failed to submit comment";
        return Promise.reject(firstError);
      }
    } catch {
      return Promise.reject("Something went wrong");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleUpvote = async () => {
    if (!token || !user_id) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `https://roadmap-app-co73.onrender.com/upvotes/toggle-upvote/${item.id}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUpvoted(data.upvoted);
        setUpvoteCount(data.count);
      }
    } catch (error) {
      console.error("Error toggling upvote:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {status || "Planned"}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2.5">
            {getStatusBadge(item.status)}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {item.title}
          </h2>

          <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
            {item.description}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleToggleComments}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50/60"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{showComments ? "Hide Discussion" : "Discussion"}</span>
              <span className="ml-1 text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full font-semibold">
                {comments.length}
              </span>
            </button>
          </div>
        </div>

        {/* Upvote Button (Canny / ProductHunt Style) */}
        <button
          onClick={toggleUpvote}
          title={token && user_id ? "Upvote this feature" : "Log in to upvote"}
          className={`shrink-0 flex flex-col items-center justify-center min-w-[56px] px-3.5 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
            upvoted
              ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/20"
              : "bg-gray-50/70 hover:bg-blue-50/60 text-gray-700 hover:text-blue-600 border-gray-200 hover:border-blue-200"
          }`}
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              upvoted ? "translate-y-[-1px]" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-bold mt-1">{upvoteCount}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Discussion
          </h3>

          {/* New Comment Input */}
          {token && user_id ? (
            <div className="space-y-2 mb-6">
              <textarea
                rows="2"
                className="w-full p-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                placeholder="Share your thoughts or feedback..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  onClick={() =>
                    handleCommentSubmit(null, newComment, () => {
                      setNewComment("");
                    })
                  }
                >
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center text-sm text-gray-600 mb-4">
              Please{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                sign in
              </button>{" "}
              to join the discussion.
            </div>
          )}

          {/* Comment List */}
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 py-3 text-center">
              No comments yet. Be the first to start the conversation!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentTree
                  key={comment.id}
                  comment={comment}
                  handleCommentSubmit={handleCommentSubmit}
                  fetchComments={fetchComments}
                  token={token}
                  user_id={user_id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
