// src/components/MovieComments.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FaUserCircle, FaStar, FaReply, FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa';

export default function MovieComments({ movieId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        loadComments();
    }, [movieId]);

    const loadComments = async () => {
        const { data } = await supabase
            .from('movie_comments')
            .select('*, user:users(username)')
            .eq('movie_id', movieId)
            .order('created_at', { ascending: false });

        setComments(data || []);
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        const { data: user } = await supabase.auth.getUser();

        const comment = {
            movie_id: movieId,
            user_id: user.user.id,
            content: newComment,
            rating: userRating,
            parent_id: replyingTo,
        };

        const { error } = await supabase
            .from('movie_comments')
            .insert([comment]);

        if (!error) {
            setNewComment('');
            setUserRating(0);
            setReplyingTo(null);
            loadComments();
        }
    };

    const handleLike = async (commentId) => {
        const { data: user } = await supabase.auth.getUser();

        // Check if already liked
        const { data: existing } = await supabase
            .from('comment_likes')
            .select()
            .eq('comment_id', commentId)
            .eq('user_id', user.user.id)
            .single();

        if (existing) {
            // Unlike
            await supabase
                .from('comment_likes')
                .delete()
                .eq('id', existing.id);
        } else {
            // Like
            await supabase
                .from('comment_likes')
                .insert([{ comment_id: commentId, user_id: user.user.id }]);
        }

        loadComments();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-6">💬 Comments & Reviews</h3>

            {/* Add Comment */}
            <div className="mb-8 p-4 bg-gray-900/30 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this movie..."
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-gray-300">Your rating:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <button
                                key={star}
                                onClick={() => setUserRating(star)}
                                className={`text-xl ${star <= userRating ? 'text-yellow-500' : 'text-gray-600'}`}
                            >
                                <FaStar />
                            </button>
                        ))}
                    </div>
                    {userRating > 0 && (
                        <span className="text-yellow-400 font-bold">{userRating}/10</span>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setReplyingTo(null)}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        Cancel Reply
                    </button>
                    <button
                        onClick={handleSubmitComment}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-white font-bold"
                    >
                        Post Comment
                    </button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.filter(c => !c.parent_id).map((comment) => (
                    <div key={comment.id} className="bg-gray-900/30 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <FaUserCircle className="text-3xl text-gray-400" />
                                <div>
                                    <div className="font-bold text-white">{comment.user?.username || 'Anonymous'}</div>
                                    <div className="text-xs text-gray-400">{formatDate(comment.created_at)}</div>
                                </div>
                            </div>
                            {comment.rating > 0 && (
                                <div className="flex items-center gap-1 bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full">
                                    <FaStar className="text-xs" />
                                    <span className="font-bold">{comment.rating}/10</span>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-300 mb-3">{comment.content}</p>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleLike(comment.id)}
                                className="flex items-center gap-2 text-gray-400 hover:text-red-400"
                            >
                                {comment.likes > 0 ? <FaThumbsUp /> : <FaRegThumbsUp />}
                                <span>{comment.likes || 0}</span>
                            </button>
                            <button
                                onClick={() => setReplyingTo(comment.id)}
                                className="flex items-center gap-2 text-gray-400 hover:text-blue-400"
                            >
                                <FaReply /> Reply
                            </button>
                        </div>

                        {/* Replies */}
                        {comments
                            .filter(c => c.parent_id === comment.id)
                            .map(reply => (
                                <div key={reply.id} className="ml-8 mt-4 pl-4 border-l-2 border-gray-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaUserCircle className="text-xl text-gray-500" />
                                        <span className="font-medium text-white">{reply.user?.username}</span>
                                        <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{reply.content}</p>
                                </div>
                            ))}
                    </div>
                ))}

                {comments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>
    );
}