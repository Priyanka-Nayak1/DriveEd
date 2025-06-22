import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  captureAndFinalizePaymentService,
  checkCoursePurchaseInfoService,
  createOrder,
  createPaymentService,
  fetchStudentViewCourseDetailsService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isBought, setIsBought] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState("");
  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] = useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);

  const getIndexOfFreePreviewUrl = studentViewCourseDetails?.curriculum?.findIndex(
    (item) => item.freePreview
  );

  useEffect(() => {
    const run = async () => {
      if (id) setCurrentCourseDetailsId(id);
    };
    run();
  }, [id]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    const checkPurchase = async () => {
      const bought = await checkCoursePurchaseInfoService(id, auth?.user?._id);
      if (bought?.data) setIsBought(true);
    };
    checkPurchase();
  }, []);

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [location.pathname]);

  if (loadingState) return <Skeleton />;
  if (approvalUrl) window.location.href = approvalUrl;

  async function fetchStudentViewCourseDetails() {
    const purchaseResponse = await checkCoursePurchaseInfoService(
      currentCourseDetailsId,
      auth?.user._id
    );
    const detailsResponse = await fetchStudentViewCourseDetailsService(currentCourseDetailsId);

    if (detailsResponse?.success) {
      setStudentViewCourseDetails(detailsResponse.data);
    } else {
      setStudentViewCourseDetails(null);
    }

    setLoadingState(false);
  }

  function handleSetFreePreview(video) {
    setDisplayCurrentVideoFreePreview(video.videoUrl);
  }

  async function handleCreatePayment() {
    const payload = {
      userId: auth?.user._id,
      userName: auth?.user.userName,
      userEmail: auth?.user.userEmail,
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "initiated",
      orderDate: new Date(),
      paymentId: "",
      payerId: "",
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.image,
      courseTitle: studentViewCourseDetails?.title,
      courseId: studentViewCourseDetails?._id,
      coursePricing: studentViewCourseDetails?.pricing,
    };

    const response = await createPaymentService(payload);
    if (response.success) {
      sessionStorage.setItem("currentOrderId", JSON.stringify(response?.data?.orderId));
      setApprovalUrl(response?.data?.approveUrl);
    }
  }

  async function handleCourseNavigate() {
    const bought = await checkCoursePurchaseInfoService(id, auth?.user?._id);
    if (bought?.data) {
      navigate(`/course-progress/${id}`);
    } else {
      const today = new Date().toISOString().split("T")[0];
      const payload = {
        userId: auth?.user?._id,
        userName: auth?.user?.userName,
        userEmail: auth?.user?.userEmail,
        orderStatus: "paid",
        orderDate: today,
        instructorId: studentViewCourseDetails?.instructorId,
        instructorName: studentViewCourseDetails?.instructorName,
        courseImage: studentViewCourseDetails?.image,
        courseTitle: studentViewCourseDetails?.title,
        courseId: id,
      };

      try {
        const orderRes = await createOrder(payload);
        if (orderRes?.success) {
          const paymentRes = await captureAndFinalizePaymentService(orderRes?.data?.orderId);
          if (paymentRes?.success) {
            setIsBought(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">{studentViewCourseDetails?.title}</h1>
        <p className="text-lg text-gray-300 mb-4">{studentViewCourseDetails?.subtitle}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span>👨‍🏫 {studentViewCourseDetails?.instructorName}</span>
          <span>📅 {studentViewCourseDetails?.date?.split("T")[0]}</span>
          <span className="flex items-center"><Globe className="mr-1 h-4 w-4" />{studentViewCourseDetails?.primaryLanguage}</span>
          <span>🎓 {studentViewCourseDetails?.students?.length} Enrolled</span>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Course Content */}
        <main className="flex-grow space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">🚀 What You’ll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                {studentViewCourseDetails?.objectives?.split(",")?.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-2 h-5 w-5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">📚 Course Description</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">{studentViewCourseDetails?.description}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">📖 Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {studentViewCourseDetails?.curriculum?.map((item, index) => (
                  <li
                    key={index}
                    onClick={item.freePreview ? () => handleSetFreePreview(item) : undefined}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition ${
                      item.freePreview ? "cursor-pointer hover:bg-gray-100" : "cursor-not-allowed bg-gray-50"
                    }`}
                  >
                    {item.freePreview ? (
                      <PlayCircle className="text-green-600 h-5 w-5" />
                    ) : (
                      <Lock className="text-gray-400 h-5 w-5" />
                    )}
                    {item.title}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </main>

        {/* Sidebar */}
        <aside className="w-full md:w-[380px]">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-5">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <VideoPlayer
                  url={
                    getIndexOfFreePreviewUrl !== -1
                      ? studentViewCourseDetails?.curriculum[getIndexOfFreePreviewUrl]?.videoUrl
                      : ""
                  }
                  width="100%"
                  height="100%"
                />
              </div>
              <Button onClick={handleCourseNavigate} className="w-full text-lg font-semibold">
                {isBought ? "Continue Learning" : "Enroll in Course"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showFreePreviewDialog} onOpenChange={() => setShowFreePreviewDialog(false)}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎬 Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg bg-black">
            <VideoPlayer url={displayCurrentVideoFreePreview} width="100%" height="100%" />
          </div>
          <div className="mt-4 space-y-2">
            {studentViewCourseDetails?.curriculum
              ?.filter((item) => item.freePreview)
              .map((item, idx) => (
                <p
                  key={idx}
                  onClick={() => handleSetFreePreview(item)}
                  className="cursor-pointer hover:underline text-base font-medium text-gray-800"
                >
                  {item?.title}
                </p>
              ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;
