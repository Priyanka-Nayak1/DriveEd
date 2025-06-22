// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const questions = [
//     {
//       question: "What does a red traffic light mean?",
//       options: ["Go", "Slow down", "Stop", "Speed up"],
//       answer: "Stop",
//     },

//   ];
// export default function Quiz() {
//   const [current, setCurrent] = useState(0);
//   const [score, setScore] = useState(0);
//   const navigate = useNavigate();

//   const handleAnswer = (option) => {
//     if (option === questions[current].answer) {
//       setScore((prev) => prev + 1);
//     }

//     const next = current + 1;
//     if (next < questions.length) {
//       setCurrent(next);
//     } else {
//       navigate("/result", { state: { score, total: questions.length } });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 border border-green-300">
//         <div className="mb-4 flex items-center justify-between">
//           <span className="text-sm text-gray-600">
//             Question {current + 1} of {questions.length}
//           </span>

//         </div>

//         <h2 className="text-xl font-semibold text-gray-800 mb-6">
//           {questions[current].question}
//         </h2>

//         <div className="grid gap-3">
//           {questions[current].options.map((option, idx) => (
//             <button
//               key={idx}
//               onClick={() => handleAnswer(option)}
//               className="w-full p-3 text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all duration-200"
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "What does a red traffic light mean?",
    options: ["Go", "Slow down", "Stop", "Speed up"],
    answer: "Stop",
  },
  {
    question: "What does a green traffic light mean?",
    options: ["Go", "Stop", "Wait", "Speed up"],
    answer: "Go",
  },
  {
    question: "When should you wear a seatbelt?",
    options: [
      "Only on highways",
      "Only in the front seat",
      "At all times",
      "Never"
    ],
    answer: "At all times",
  },
  {
  question: "What is the legal blood alcohol limit for drivers?",
  options: ["0.08%", "0.10%", "0.05%", "0.02%"],
  answer: "0.08%",
},
{
  question: "What should you do before changing lanes?",
  options: ["Honk", "Speed up", "Use turn signal and check mirrors", "Brake suddenly"],
  answer: "Use turn signal and check mirrors",
},
{
  question: "When approaching a pedestrian crossing, you must:",
  options: ["Honk and proceed", "Slow down only if pedestrians are present", "Always stop", "Speed up to clear the crossing quickly"],
  answer: "Always stop",
},
{
  question: "What is a blind spot?",
  options: ["Area behind the car", "Area not visible in mirrors", "Your rearview mirror", "Dashboard light"],
  answer: "Area not visible in mirrors",
},
{
  question: "When should you use your headlights?",
  options: ["Only at night", "During rain or fog", "When visibility is poor", "All of the above"],
  answer: "All of the above",
},
{
  question: "What is the purpose of a speed bump?",
  options: ["Prevent parking", "Guide pedestrians", "Reduce speed", "Decorate the road"],
  answer: "Reduce speed",
},
{
  question: "What is the correct action at a STOP sign?",
  options: ["Slow down", "Stop fully", "Only stop if traffic is coming", "Honk and proceed"],
  answer: "Stop fully",
},
{
  question: "What does a yellow centerline mean?",
  options: ["No passing", "Pedestrian zone", "Divides opposite traffic", "Bus lane"],
  answer: "Divides opposite traffic",
},
{
  question: "A broken white line on the road means:",
  options: ["Overtake prohibited", "You may change lanes", "No entry", "Stop line"],
  answer: "You may change lanes",
},
{
  question: "What must you carry while driving?",
  options: ["License only", "License and insurance", "Nothing", "Driving manual"],
  answer: "License and insurance",
},
{
  question: "Overtaking is allowed when:",
  options: ["At curves", "On hills", "When road ahead is clear and safe", "Near crosswalks"],
  answer: "When road ahead is clear and safe",
},
{
  question: "Why is using a mobile phone while driving dangerous?",
  options: ["It drains battery", "It slows the car", "It distracts the driver", "It blocks the view"],
  answer: "It distracts the driver",
},
{
  question: "What is hydroplaning?",
  options: ["Driving uphill", "Sliding on water", "Overheating brakes", "Speeding"],
  answer: "Sliding on water",
},
{
  question: "When can you drive in a bicycle lane?",
  options: ["Never", "To park", "To turn right", "When there’s no traffic"],
  answer: "To turn right",
},
{
  question: "What’s the minimum safe following distance?",
  options: ["1 second", "3 seconds", "5 seconds", "10 seconds"],
  answer: "3 seconds",
},
{
  question: "What does ABS stand for?",
  options: ["Anti-Brake System", "Automatic Braking Sensor", "Anti-lock Braking System", "Auto Brake Safety"],
  answer: "Anti-lock Braking System",
},
{
  question: "Which color is used for warning signs?",
  options: ["Red", "Yellow", "Blue", "Green"],
  answer: "Yellow",
},
{
  question: "What is the shape of a stop sign?",
  options: ["Circle", "Triangle", "Octagon", "Rectangle"],
  answer: "Octagon",
},
{
  question: "When should high beams be used?",
  options: ["Always", "In fog", "In rain", "On empty, dark roads"],
  answer: "On empty, dark roads",
},
{
  question: "Zebra crossing is meant for:",
  options: ["Animals", "Bicycles", "Pedestrians", "Cars"],
  answer: "Pedestrians",
},
{
  question: "What is tailgating?",
  options: ["Driving too slowly", "Driving too close", "Driving on the shoulder", "Driving with music on"],
  answer: "Driving too close",
},
{
  question: "What does a solid double yellow line mean?",
  options: ["You can pass anytime", "No parking", "No passing in either direction", "Passing allowed one way"],
  answer: "No passing in either direction",
},
{
  question: "What should you do if an emergency vehicle approaches with siren?",
  options: ["Keep going", "Stop immediately", "Pull over and stop", "Honk back"],
  answer: "Pull over and stop",
},
{
  question: "What does a blue traffic sign indicate?",
  options: ["Warning", "Information/Guide", "Stop", "Construction"],
  answer: "Information/Guide",
},
{
  question: "What should you do when driving in fog?",
  options: ["Turn on high beams", "Use hazard lights", "Use low beams and drive slowly", "Speed up"],
  answer: "Use low beams and drive slowly",
},
{
  question: "What should you do if you miss your exit on a highway?",
  options: ["Reverse to take the exit", "Stop immediately", "Take the next exit", "Make a U-turn"],
  answer: "Take the next exit",
},
{
  question: "What does a triangular traffic sign indicate?",
  options: ["Mandatory instruction", "Information", "Warning", "Stop"],
  answer: "Warning",
}

];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer === 0) {
      handleNext();
    }
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleAnswer = (option) => {
    if (option === questions[current].answer) {
      setScore((prev) => prev + 1);
    }
    handleNext();
  };

  const handleNext = () => {
    const next = current + 1;
    if (next < questions.length) {
      setCurrent(next);
      setTimer(30);
    } else {
      navigate("/result", { state: { score, total: questions.length } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 border border-green-300">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Question {current + 1} of {questions.length}
          </span>
          <span className="text-sm text-red-600 font-bold">Time: {timer}s</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {questions[current].question}
        </h2>

        <div className="grid gap-3">
          {questions[current].options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              className="w-full p-3 text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all duration-200"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

