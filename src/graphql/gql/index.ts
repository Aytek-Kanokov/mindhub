import { gql } from '@apollo/client';

export const getCourseCollectionQuery = gql`
  query courseCollectionQuery {
    courseCollection {
      items {
        sys {
          id
        }
        title
        price
        previewVideo
        description {
          json
        }
        lessonsCollection {
          items {
            title
            video
          }
        }
        instructor {
          name
          email
        }
        whitelist
      }
    }
  }
`;

export const getInstructorCollectionQuery = gql`
  query instructorCollectionQuery {
    instructorCollection {
      items {
        sys {
          id
        }
        name
        email
        picture {
          url
        }
      }
    }
  }
`;

// From email
export const getInstructorAccountQuery = gql`
  query getInstructorAccount($instructor_email: String!) {
    instructorCollection(where: { email: $instructor_email }) {
      items {
        sys {
          id
        }
        name
        email
        picture {
          url
        }
      }
    }
  }
`;

export const getLessonsInCourseQuery = gql`
  query getLessonsInCourse($course_id: String!) {
    course(id: $course_id) {
      sys {
        id
      }
      lessonsCollection {
        items {
          sys {
            id
          }
          title
          coverPicture {
            url
          }
          videoLengthMins
        }
      }
    }
  }
`;

export const getCourseByIdQuery = gql`
  query getCourseById($course_id: String!) {
    course(id: $course_id) {
      sys {
        id
      }
      title
      price
      description {
        json
      }
      previewVideo
      previewVideoLengthMins
      whitelist
      lessonsCollection {
        items {
          sys {
            id
          }
          title
          description {
            json
          }
          coverPicture {
            url
          }
          videoLengthMins
        }
      }
      instructor {
        sys {
          id
        }
        name
        email
        picture {
          url
        }
      }
    }
  }
`;

export const getLessonByIdQuery = gql`
  query getLessonByIdQuery($lesson_id: String!) {
    lesson(id: $lesson_id) {
      sys {
        id
      }
      title
      description {
        json
      }
      coverPicture {
        url
      }
      video
      videoLengthMins
    }
  }
`;
