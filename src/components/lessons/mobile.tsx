import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { ILesson } from "@/global";
import { hr } from 'date-fns/locale';

const Comments = ({ id, lessonsInCourse, filter, lessonNumber }: { id: string, lessonsInCourse: ILesson[], filter: string, lessonNumber: number }) => {
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [viewAll, setViewAll] = useState<boolean>(false);

  useEffect(() => {
    const result: ILesson[] = lessonsInCourse?.filter((lesson) => {
      return filter === "" ? true : lesson.title.toUpperCase().indexOf(filter.toUpperCase()) >= 0;
    })
    setLessons(result)
  }, [filter]);

  return (
    <section className="col-span-4 self-start lesson-scroll">
      <div className="]">
        {lessons?.map((el: any, idx: number) => {
          if (!viewAll && idx > 2) return;
          return (
            <Link
              key={idx}
              href={`/courses/${id}/lessons/${el.sys.id}`}
              className={`flex items-start gap-3 mb-3 px-2 py-3${lessonNumber === idx ? ' rounded-md bg-[#F7F9FC] shadow' : ''}`}
            >
              <Image className="rounded-md" src={el.coverPicture.url ?? "/images/placeholder.png"} width={44} height={35} alt={el.title} />
              <div>
                <h4 className="mb-1 text-xs font-semibold">{el.title}</h4>
                <div>
                  <span className="text-xs text-[#94A0B4]">35 Mins</span>
                </div>
              </div>
              <Image className="ml-auto" src="/icons/check.png" width={18} height={18} alt="check" />
            </Link>
          );
        })}
        {
          !viewAll && lessons.length > 2 && 
          <div onClick={() => setViewAll(true)}>
            <hr className="mt-5 mb-3 border-[#6FC59B]" />
            <div className="flex justify-center -mt-6">
              <span className="text-[#6FC59B] text-[14px] bg-white px-3">View All</span>
            </div>
          </div>
        }
      </div>
    </section>
  );
};

export default Comments;
