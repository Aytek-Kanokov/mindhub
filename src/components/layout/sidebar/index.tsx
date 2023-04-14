import Image from 'next/image';
import Link from 'next/link';
import Router from 'next/router';
import sidebarItems from './sidebarItems';
import SidebarIcons from './SidebarIcons';

import Brand from '@/assets/brand.svg';
import Line from '@/assets/signup/line.svg';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { CrossCircledIcon } from '@radix-ui/react-icons';

import { useState } from 'react';
import Switch from '@/components/common/Switch';
import clsx from 'clsx';

const NavItems = [
  {
    icon: 'home',
    activeIcon: 'home-filled',
    name: 'home',
    title: 'Home',
    url: '/',
  },
  {
    icon: 'explore',
    activeIcon: 'explore-filled',
    name: 'explore',
    title: 'Explore Courses',
    url: '/courses',
  },
  {
    icon: 'course-lesson',
    activeIcon: 'course-lesson-filled',
    name: 'course-lesson',
    title: 'My Courses',
    url: '/mycourses',
  },
  {
    icon: 'instructor',
    activeIcon: 'instructor-filled',
    name: 'instructor',
    title: 'My Instructors',
    url: '/instructors',
  },
  /*
  {
    icon: 'video',
    activeIcon: 'video-filled',
    name: 'video',
    title: 'My Meetings',
    url: '/mymeetings',
  },
  */
  {
    icon: 'explore',
    activeIcon: 'explore-filled',
    name: 'explore ',
    title: 'Live Course',
    url: '/Marathon',
  },
] as const;

export type NavItem = typeof NavItems[number]['title'];

const Sidebar = ({ title, name, showSidebar, setShowSidebar }: { title: String, name: String, showSidebar: boolean, setShowSidebar: any }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <nav
      className={`${showSidebar ? '' : 'hidden '}md:block fixed md:static w-screen md:w-[300px] h-screen z-10 whitespace-nowrap bg-gradient-to-r bg-black-dark bg-opacity-50 md:bg-opacity-100 md:from-gray-100 md:to-white`}
      onClick={() => setShowSidebar(false)}
    >
      {/* <div className='absolute transition-all duration-300 ease-in-out md:hidden top-10 left-5 '>
        {isSidebarOpen ? (
          <div className='fixed top-0 bottom-0 left-0 z-50 w-5/6 h-screen bg-slate-200'>
            <CrossCircledIcon
              className='absolute cursor-pointer top-10 left-5'
              onClick={() => {
                setIsSidebarOpen(false);
              }}
            />
          </div>
        ) : (
          <HamburgerMenuIcon
            onClick={() => {
              setIsSidebarOpen(true);
            }}
          />
        )}
      </div> */}
      <div
        className={`${showSidebar ? 'w-3/4 ' : 'w-0 '}md:w-full h-full py-10 md:py-12 flex flex-col items-center justify-start bg-white`}
        onClick={(e) => { e.stopPropagation() }}
      >
        <div className='w-full px-[24px] flex flex-col justify-between items-center'>
          <Image className='hidden md:block' src={Brand} alt='Brand' width={180} height={48} />
          <Image className='md:hidden block' src={Brand} alt='Brand' width={128} height={34} />
          <span className='w-full mt-[29px] md:mt-[45px] mb-[24px] md:mb-[57px] border-b border-b-[#DCE1EA]'></span>
          {/* <Image
            src={Line}
            alt='seperator'
            width={274}
            className='opacity-50'
          /> */}
        </div>
        <ul className='flex flex-col w-full gap-2 md:gap-0'>
          {NavItems.map((item) => (
            <Link
              href={item.url}
              key={item.title}
              onClick={() => setShowSidebar(false)}
              className={clsx(
                'flex flex-row gap-4 items-center font-bold text-base leading-[19px] py-4 px-6 md:px-12 w-full text-center group overflow-hidden relative',
                item.name === name
                  ? 'text-green-dark after-effect'
                  : 'text-gray-400',
              )}
            >
              <SidebarIcons
                iconName={item.name === name ? item.activeIcon : item.icon}
                width={21}
                height={21}
              />
              {item.name === name ? (
                <span className='text-teal-500 transition-all duration-300 ease-in-out group-hover:text-teal-700'>
                  {item.title}
                </span>
              ) : (
                <span className='text-gray-400 transition-all duration-300 ease-in-out group-hover:text-gray-500'>
                  {item.title}
                </span>
              )}
            </Link>
          ))}
        </ul>
        <div
          className='mt-auto'
          onClick={() => {
            setTheme((currentTheme) =>
              currentTheme === 'dark' ? 'light' : 'dark',
            );
          }}
        >
          <Switch theme={theme} />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
