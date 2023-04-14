export interface IPasswordStrengthItemPropType {
  title: string;
  passed: string;
}

export interface ICourseProps {
  username: string;
  course_id: string;
  course: ICourse;
  courses: any;
  permission: boolean;
  lessonsInCourse: ILesson[];
  isPurchased: boolean;
}

export interface ILesson {
  sys: {
    id: string;
  };
  title: string;
  description: {
    json: any;
  };
  coverPicture: {
    url: string | undefined;
  };
  video: {
    videoId: string;
  };
  videoLengthMins: number;
}

export interface ILessonProps {
  username: string;
  lesson_id: string;
  course_id: string;
  course: ICourse;
  lesson: ILesson;
  lessonsInCourse: ILesson[];
}

/** My Instructor page */
export interface IInstructor {
  name: string;
  email: string;
  picture: {
    url: string;
    __typename: string;
  };
  sys?: {
    id: string;
  };
  id?: string;
}

export interface IInstructors {
  data: {
    instructorCollection: {
      items: [];
    };
  };
}

/** Explore Courses page */
export interface ICourse {
  title: string;
  price: number;
  previewVideo: any;
  previewVideoLengthMins: number;
  description: {
    json: any;
  };
  lessonsCollection: {
    items: [];
  };
  instructor: {
    name: string;
    email: string;
    picture: {
      url: string;
    };
  };
  sys: {
    id: string;
  };
  isPurchased?: boolean;
  commentsCnt?: number;
  whitelist?: string[] | null;
}

export interface ICourses {
  allCourses: Array<any>;
  purchasedCourseIds: [];
  comments: any;
}

export type IContentfulFields = {
  title: {
    'en-US': string;
  };
  price: {
    'en-US': number;
  };
  description: {
    'en-US': {
      content: [
        {
          data: {};
          content: [
            {
              data: {};
              marks: [];
              value: string;
            },
          ];
        },
      ];
    };
  };
  instructor: {
    'en-US': {
      sys: {
        id: string;
      };
    };
  };
  whitelist: string[] | null;
};

export type IContentfulSys = {
  type: string;
  id: string;
  createdBy: {
    sys: {
      type: string;
      linkType: string;
      id: string;
    };
  };
};

export type IBody = {
  attendee_emails: Array<string>;
  start_time: string;
  meeting_title: string;
  meeting_description: string;
  adminEmail: string;
};
