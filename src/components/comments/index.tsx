import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';

const Comments = ({
  id,
  onChangeComment,
  username,
}: {
  id: string;
  onChangeComment: Function;
  username: string;
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState<string>('');

  const fetchComments = async () => {
    const response = await axios.get(`/api/comments?id=${id}`);
    setComments(response.data.data);
    onChangeComment(response.data.data.length);
  };

  const addComment = async () => {
    const response = await axios.post(`/api/comments?id=${id}`, {
      id,
      username,
      comment,
    });
    fetchComments();
    setComment('');
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  return (
    <div className="md:px-6 pb-0 md:pb-5 rounded-xl md:shadow-md">
      <h2 className="hidden md:block md:mb-6 font-semibold">Comments</h2>
      {comments.length > 0 ? (
        <ul className="flex flex-col gap-[11px] md:gap-5">
          {comments.map((el) => (
            <li key={el.id} className="px-3 py-4 bg-[#F7F9FC] rounded">
              <h4 className="mb-2 text-[14px] font-medium">{el.username}</h4>
              <p className="text-[12px] font-medium text-[#717E95]">{el.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-xs font-medium text-[#717E95]">No comments</p>
      )}

      <div className="flex items-center gap-4 mt-4 md:mt-16 px-5 py-3.5 rounded-[10px] bg-[#F7F9FC]">
        <input
          type="text"
          className="w-full px-8 py-2 text-[12px] md:text-base"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your comment"
        />
        <button className="" onClick={addComment}>
          <Image src="/images/send.png" width={40} height={40} alt="send" />
        </button>
      </div>
    </div>
  );
};

export default Comments;
