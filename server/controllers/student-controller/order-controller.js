const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      orderDate,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
    } = req.body;

    console.log("hi")


  

    const newlyCreatedCourseOrder = new Order({
      userId,
      userName,
      userEmail,
      orderDate,
      orderStatus,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
    });

    console.log(newlyCreatedCourseOrder)

    console.log("hi")

    await newlyCreatedCourseOrder.save();
    console.log("hi")


    const approveUrl="sdfsdf";

    res.status(201).json({
      success: true,
      data: {
        approveUrl,
        orderId: newlyCreatedCourseOrder._id,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    let order = await Order.findById(orderId);
    console.log(order)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.orderStatus = "confirmed";


    await order.save();

    //update out student course model
    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId: order.courseId,
        title: order.courseTitle,
        instructorId: order.instructorId,
        instructorName: order.instructorName,
        dateOfPurchase: order.orderDate,
        courseImage: order.courseImage,
      });

      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate,
            courseImage: order.courseImage,
          },
        ],
      });

      await newStudentCourses.save();
    }

    //update the course schema students
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { createOrder, capturePaymentAndFinalizeOrder };
