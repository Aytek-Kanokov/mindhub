import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ICourse } from '@/global';
import LikeIcon from '@/assets/like_icon.svg';

const Course: NextPage<ICourse> = ({
  title,
  price,
  previewVideo,
  description,
  lessonsCollection,
  instructor,
  sys,
  isPurchased,
  commentsCnt
}) => {
  return (
    <div className='m-auto px-2 w-full'>
      <Link
        href={`/courses/${sys.id}`}
        className='relative inline-block w-full cursor-pointer'
      >
        <div className='relative h-62 max-w-58 w-full'>
          <Image
            src={previewVideo?.assets?.thumbnail}
            alt='instructor'
            fill
            className='rounded-2xl object-cover'
          />
        </div>
        <span className='block font-semibold leading-5 mt-[17px] text-base overflow-hidden text-ellipsis whitespace-pre-line w-full text-black-dark'>
          {title}
        </span>
        <div className='flex justify-between items-center'>
          <span className='font-medium text-grey-600 overflow-hidden text-ellipsis whitespace-pre-line w-full text-1sm mt-[9.5px]'>
            {instructor.name}
          </span>
          <div className='flex items-center'>
            <Image src="/icons/comments.png" width={16} height={16} alt='count'/>
            <span className='ml-[7px] font-medium text-grey-600 text-1sm'>({commentsCnt})</span>
          </div>
        </div>
        {isPurchased ? (
          <div className='text-white opacity-0 absolute inset-0 items-center justify-center hover:bg-slate-600/50 hover:flex hover:opacity-100'>
            View
          </div>
        ) : (
          <span className='block text-base mt-[9.5px] text-green-dark font-semibold'>${price}</span>
        )}
      </Link>
    </div>
  );
};

export default Course;
