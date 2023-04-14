import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { ILesson } from "@/global";

const Comments = ({ id, lessonsInCourse, filter, lessonNumber }: { id: string, lessonsInCourse: ILesson[], filter: string, lessonNumber: number }) => {
  const [lessons, setLessons] = useState<ILesson[]>([])

  useEffect(() => {
    const result: ILesson[] = lessonsInCourse?.filter((lesson) => {
      return filter === "" ? true : lesson.title.toUpperCase().indexOf(filter.toUpperCase()) >= 0;
    })
    setLessons(result)
  }, [filter]);

  return (
    <section className="hidden md:block col-span-4 h-[64vh] self-start lesson-scroll">
      <div className="lesson-scroll overflow-y-scroll h-full p-5 rounded-xl shadow-[0_0_8px_rgba(0,0,0,0.08)]">
        <h2 className="mb-7 font-semibold">Lessons</h2>
        {lessons?.map((el: ILesson, idx: number) => (
          <Link
            key={idx}
            href={`/courses/${id}/lessons/${el.sys.id}`}
            className="flex items-start gap-3 my-2 px-2 py-3"
          >
            <Image className="rounded-md object-cover w-11 h-11" src={el.coverPicture.url ?? "/images/placeholder.png"} width={44} height={35} alt={el.title} />
            <div>
              <h4 className="mb-1 text-xs font-semibold">{el.title}</h4>
              <div>
                <span className="text-xs text-[#94A0B4]">{el.videoLengthMins} Mins</span>
              </div>
            </div>
            <Image className="ml-auto" src="/icons/check.png" width={18} height={18} alt="check" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Comments;
