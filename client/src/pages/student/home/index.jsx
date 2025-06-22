import { courseCategories } from "@/config";
import VideoCarousel from "@/components/VideoCarousel";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useRef } from "react";
import { StudentContext } from "@/context/student-context";
import {
  captureAndFinalizePaymentService,
  checkCoursePurchaseInfoService,
  createOrder,
  fetchStudentViewCourseListService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

function StudentHomePage() {
  const isNavigatingRef = useRef(false); // 🧠 Control flag

  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleNavigateToCoursesPage(getCurrentId) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [getCurrentId],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }

  async function handleCourseNavigate(courseItem) {
    if (isNavigatingRef.current) return; // Already running
    isNavigatingRef.current = true; // Lock it
    const today = new Date().toISOString().split('T')[0];




    navigate(`/course/details/${courseItem._id}`);





  }





  useEffect(() => {

    // Call the function only once
    fetchAllStudentViewCourses();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <section className="w-full">
        <VideoCarousel />
      </section>

      <section className="py-12 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem._id}
                className="bg-white border rounded-xl shadow-2xl overflow-hidden flex flex-col"
              >
                <img
                  src={courseItem?.image}
                  alt={courseItem?.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {courseItem?.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Instructor:</span>{" "}
                    {courseItem?.instructorName}
                  </p>
                  {courseItem?.description && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                      {courseItem?.description}
                    </p>
                  )}
                  {courseItem?.duration && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Duration:</span>{" "}
                      {courseItem.duration}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    {/* <span className="text-lg font-semibold text-green-600">
              ${courseItem?.pricing}
            </span> */}
                    <button
                      onClick={() => handleCourseNavigate(courseItem)}
                      className="bg-black w-full text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Go to Course
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h1 className="text-lg font-semibold text-gray-600">No Courses Found</h1>
          )}
        </div>

      </section>
    </div>
  );
}

export default StudentHomePage;
