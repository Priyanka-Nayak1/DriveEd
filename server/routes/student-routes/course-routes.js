const express = require("express");
const {
  getStudentViewCourseDetails,
  getAllStudentViewCourses,
  checkCoursePurchaseInfo,
  checkFaceId
} = require("../../controllers/student-controller/course-controller");
const router = express.Router();

router.get("/get", getAllStudentViewCourses);
router.get("/get/details/:id", getStudentViewCourseDetails);
router.get("/purchase-info/:courseId/:studentId", checkCoursePurchaseInfo);
router.get("/faceId/:studentId", checkFaceId);

module.exports = router;
