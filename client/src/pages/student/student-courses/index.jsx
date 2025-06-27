import { useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  fetchStudentBoughtCoursesService,
  getCurrentCourseProgressService,
} from "@/services";
import LectureCards from "@/components/student-view/LectureCards";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const {
    studentBoughtCoursesList,
    setStudentBoughtCoursesList,
    studentCurrentCourseProgress,
    setStudentCurrentCourseProgress,
  } = useContext(StudentContext);

  const navigate = useNavigate();

  const courseID = studentBoughtCoursesList?.[0]?.courseId;

  // Fetch bought courses
  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);
    }
  }

  // Fetch course progress
  async function fetchCurrentCourseProgress() {
    if (!courseID) return;

    const response = await getCurrentCourseProgressService(auth?.user?._id, courseID);
    if (response?.success && response?.data?.isPurchased) {
      setStudentCurrentCourseProgress({
        courseDetails: response?.data?.courseDetails,
        progress: response?.data?.progress,
      });
    }
  }

  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  useEffect(() => {
    if (courseID) {
      fetchCurrentCourseProgress();
    }
  }, [courseID]);

  const allLectures = studentCurrentCourseProgress?.courseDetails?.curriculum || [];
  const watchedLecturesData = studentCurrentCourseProgress?.progress || [];

  const { watchedLectures, unwatchedLectures } = useMemo(() => {
    if (!Array.isArray(allLectures) || !Array.isArray(watchedLecturesData)) {
      return { watchedLectures: [], unwatchedLectures: [] };
    }

    const watchedIds = new Set(watchedLecturesData.map((w) => w.lectureId));
    const watched = allLectures.filter((lec) => watchedIds.has(lec._id));
    const unwatched = allLectures.filter((lec) => !watchedIds.has(lec._id));

    return { watchedLectures: watched, unwatchedLectures: unwatched };
  }, [allLectures, watchedLecturesData]);

  function handleResumeLecture() {
    if (courseID) {
      navigate(`/course-progress/${courseID}`);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Course</h1>
        {(
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            onClick={handleResumeLecture}
          >
            Resume Lectures
          </Button>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* ✅ Watched Lectures */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-green-700">Watched Lectures</h2>
          {watchedLectures.length === 0 ? (
            <p className="text-gray-600">You have not watched any lectures yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchedLectures.map((lecture) => (
                <LectureCards
                  key={lecture._id}
                  lecture={{ ...lecture, watched: true }}
                />
              ))}
            </div>
          )}
        </section>

        {/* ✅ Unwatched Lectures */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-yellow-700">Unwatched Lectures</h2>
          {unwatchedLectures.length === 0 ? (
            <p className="text-gray-600">🎉 You have completed the course!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {unwatchedLectures.map((lecture) => (
                <LectureCards
                  key={lecture._id}
                  lecture={{ ...lecture, watched: false }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudentCoursesPage;
  `1`