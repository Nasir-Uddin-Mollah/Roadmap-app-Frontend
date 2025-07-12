import React, { useState, useEffect } from "react";

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
    } catch (error) {
      setEditError("Error updating comment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deelte this comment?"))
      return;
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
    } catch (error) {
      alert("Failed to delete comment");
    }
  };

  return (
    <div className={`ml-${depth * 4} mt-2`}>
      <div className="bg-gray-100 rounded-lg p-2 text-sm shadow-sm">
        {editMode ? (
          <>
            <textarea
              className="w-full p-2 border rounded"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="mt-1 space-x-2">
              <button
                className="bg-green-600 text-white px-2 py-1 rounded text-sm cursor-pointer"
                onClick={handleEditSubmit}
              >
                Save
              </button>
              <button
                className="text-sm text-gray-600 cursor-pointer"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
              {editError && (
                <p className="text-red-500 text-xs mt-1">{editError}</p>
              )}
            </div>
          </>
        ) : (
          <p>
            <span className="font-semibold text-gray-800">
              {comment.username}
            </span>
            : {comment.body}
          </p>
        )}
      </div>
      {parseInt(comment.user) === parseInt(user_id) && !editMode && (
        <div className="text-xs space-x-3 mt-1">
          <button
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline cursor-pointer"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
      <p className="text-red-600 text-xs mt-1">{replyError}</p>

      <button
        className="text-xs text-blue-600 mt-1 hover:underline cursor-pointer"
        onClick={() => setShowReply(!showReply)}
      >
        {showReply ? "Cancel" : "Reply"}
      </button>

      {showReply && (
        <div className="mt-2">
          <textarea
            rows="2"
            className="w-full p-2 border rounded-md text-sm"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            className="mt-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded cursor-pointer"
            onClick={handleReplySubmit}
          >
            Reply
          </button>
        </div>
      )}

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
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

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

        setUpvoted(updatedItem.upvoted);
        setUpvoteCount(updatedItem.upvote_count);
      } catch (error) {
        console.error("Error fetching upvote status:", error);
      }
    };
    if (token && user_id) {
      fetchUpvoteStatus();
    }
  }, [item.id, token, user_id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `https://roadmap-app-co73.onrender.com/comments/list/?item_id=${item.id}`
      );
      const data = await response.json();
      setComments(data.results || data);
    } catch (error) {
      console.log("Failed to fetch comments", error);
    }
  };

  useEffect(() => {
    fetchComments();
    const interval = setInterval(() => {
      fetchComments();
    }, 5000);

    return () => clearInterval(interval);
  }, [item.id]);

  const handleToggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async (
    parentId = null,
    text = newComment,
    onSuccess = () => {}
  ) => {
    if (!text.trim()) return;
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
        console.error("Failed to submit comment:", data);
        return Promise.reject(firstError);
      }
    } catch (error) {
      console.log("Error submitting comment", error);
      return Promise.reject("Something went wrong");
    }
  };

  const toggleUpvote = async () => {
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

  return (
    <div className="bg-white shadow rounded-xl p-5 mb-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{item.title}</h2>
          <p className="text-gray-600 mt-1">{item.description}</p>
          <span
            className={`inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full ${
              item.status === "Completed"
                ? "bg-green-100 text-green-600"
                : item.status === "In Progress"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {item.status.toUpperCase()}
          </span>
        </div>

        {token && user_id && (
          <button
            onClick={toggleUpvote}
            className={`px-3 py-1 rounded-lg cursor-pointer h-fit ${
              upvoted
                ? "bg-blue-600 text-white"
                : "bg-blue-300 hover:bg-blue-600"
            }`}
          >
            <span>👍</span>
            <span>{upvoteCount}</span>
          </button>
        )}
      </div>

      {token && user_id && (
        <button
          className="mt-4 text-blue-600 text-sm cursor-pointer"
          onClick={handleToggleComments}
        >
          {showComments ? "Hide Comments" : "View Comments"}
        </button>
      )}

      {showComments && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-800">Comments</h3>
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <CommentTree
                key={comment.id}
                comment={comment}
                handleCommentSubmit={handleCommentSubmit}
                fetchComments={fetchComments}
                token={token}
                user_id={user_id}
              />
            ))
          )}

          <div className="mt-4">
            <textarea
              rows="2"
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded cursor-pointer"
              onClick={() =>
                handleCommentSubmit(null, newComment, () => {
                  setNewComment("");
                })
              }
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
