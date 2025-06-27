import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
} from "@/services";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);

  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  const { id } = useParams();
  const webcamRef = useRef(null);

  function isLectureWatched(lectureId) {
    return studentCurrentCourseProgress?.progress?.some(
      (item) => item.lectureId === lectureId && item.viewed
    );
  }

  async function fetchCurrentCourseProgress() {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
          return;
        }

        if (response?.data?.progress?.length === 0) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
        } else {
          const lastIndex = response?.data?.progress.reduceRight(
            (acc, obj, index) => (acc === -1 && obj.viewed ? index : acc),
            -1
          );
          setCurrentLecture(
            response?.data?.courseDetails?.curriculum[lastIndex + 1]
          );
        }
      }
    }
  }

  async function updateCourseProgress() {
    if (currentLecture) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );
      if (response?.success) {
        fetchCurrentCourseProgress();
      }
    }
  }

  async function handleRewatchCourse() {
    const firstLecture =
      studentCurrentCourseProgress?.courseDetails?.curriculum?.[0];
    setCurrentLecture(firstLecture);
    setShowConfetti(false);
    setShowCourseCompleteDialog(false);
  }

  async function getCertificate() {
    navigate("/quiz");
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  // Conditional webcam setup only for unwatched lectures
  useEffect(() => {
    if (!currentLecture || isLectureWatched(currentLecture._id)) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          webcamRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    startWebcam();

    return () => {
      if (webcamRef.current?.srcObject) {
        webcamRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentLecture]);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans relative z-20">
      {showConfetti && (
        <div className="pointer-events-none z-50 absolute inset-0">
          <Confetti />
        </div>
      )}

      {!isLectureWatched(currentLecture?._id) && (
        <video
          ref={webcamRef}
          className="fixed top-4 right-4 w-40 h-28 rounded-lg shadow-lg border border-white/20 z-40"
          muted
          autoPlay
          playsInline
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-transparent hover:bg-white/10 text-white border border-white/20"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Course page
          </Button>
          <h1 className="text-lg font-semibold hidden md:block tracking-wide">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button
          className="bg-transparent hover:bg-white/10 text-white border border-white/20"
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
        >
          {isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 ${isSideBarOpen ? "mr-[400px]" : ""} transition-all duration-300`}>
          <VideoPlayer
            width="100%"
            height="500px"
            url={currentLecture?.videoUrl}
            onProgressUpdate={setCurrentLecture}
            progressData={currentLecture}
          />
          <div className="p-6 bg-black/40 backdrop-blur-sm rounded-t-xl shadow-xl">
            <h2 className="text-2xl font-bold mb-2">{currentLecture?.title}</h2>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-black/40 backdrop-blur-md border-l border-white/10 shadow-lg transition-transform duration-500 ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-black/30 border-b border-white/10 rounded-none text-white/90">
              <TabsTrigger value="content" className="hover:bg-white/10 transition-colors h-14">
                Course Content
              </TabsTrigger>
              <TabsTrigger value="overview" className="hover:bg-white/10 transition-colors h-14">
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <ScrollArea className="h-full p-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">
                    Watched Lectures
                  </h3>
                  {studentCurrentCourseProgress?.courseDetails?.curriculum
                    .filter((item) =>
                      studentCurrentCourseProgress?.progress?.some(
                        (progressItem) =>
                          progressItem.lectureId === item._id && progressItem.viewed
                      )
                    )
                    .map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setCurrentLecture(item)}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 hover:text-white/90 p-2 rounded-md transition-all duration-300"
                      >
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium">{item?.title}</span>
                      </div>
                    ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    Unwatched Lectures
                  </h3>
                  {studentCurrentCourseProgress?.courseDetails?.curriculum
                    .filter(
                      (item) =>
                        !studentCurrentCourseProgress?.progress?.some(
                          (progressItem) =>
                            progressItem.lectureId === item._id && progressItem.viewed
                        )
                    )
                    .map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setCurrentLecture(item)}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 hover:text-white/90 p-2 rounded-md transition-all duration-300"
                      >
                        <Play className="h-4 w-4 text-white/70" />
                        <span className="text-sm font-medium">{item?.title}</span>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="overview">
              <ScrollArea className="h-full p-4">
                <h2 className="text-xl font-semibold mb-2">About this course</h2>
                <p className="text-white/70 leading-relaxed">
                  {studentCurrentCourseProgress?.courseDetails?.description}
                </p>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Lock Modal */}
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px] bg-black border border-white/20 text-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Access Denied</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Completion Modal */}
      <Dialog open={showCourseCompleteDialog}>
        <DialogContent className="sm:w-[425px] bg-black border border-white/20 text-white shadow-lg">
          <DialogHeader>
            <DialogTitle>🎉 Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-4">
              <Label className="text-white">You have completed the course</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                >
                  Go to dashboard
                </Button>
                <Button
                  onClick={handleRewatchCourse}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
                >
                  Rewatch Course
                </Button>
                <Button
                  onClick={getCertificate}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-semibold"
                >
                  Get Certificate
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
