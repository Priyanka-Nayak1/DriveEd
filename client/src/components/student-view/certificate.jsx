import { useRef, useState } from "react";
import logo from "../../assets/image/logo.jpg";
// import HomePage from "../../pages/student/home";
import { useNavigate } from 'react-router-dom';


function CertificateGenerator() {
  const canvasRef = useRef(null);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const certificateData = {
    name: name || "Your Name",
    course: "Driving Rules and Safety Course",
    date: new Date().toLocaleDateString(),
  };

  const generateCertificate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "#1d3557";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Load logo and draw certificate
    const logoImg = new Image();
    logoImg.src = logo;
    logoImg.onload = () => {
      // Draw watermark logo
      ctx.globalAlpha = 0.3;
      const logoSize = 300;
      ctx.drawImage(
        logoImg,
        canvas.width / 2 - logoSize / 2,
        140,
        logoSize,
        logoSize
      );
      ctx.globalAlpha = 1;

      // Title
      ctx.fillStyle = "#1d3557";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DRIVE", canvas.width / 2 - 50, 80);
      ctx.fillStyle = "#f4a300";
      ctx.fillText("ED.", canvas.width / 2 + 50, 80);

      ctx.fillStyle = "#000";
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CERTIFICATE", canvas.width / 2, 130);

      ctx.font = "20px sans-serif";
      ctx.fillText("This certificate is awarded to", canvas.width / 2, 180);

      // Dynamic Name
      ctx.font = "bold 32px Edu NSW ACT Foundation', cursive";
      ctx.fillText(certificateData.name, canvas.width / 2, 230);

      // Description
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#333";
      const description = `The course covered essential driving regulations, safety practices, road signs, and
responsible driver behavior. By completing this course, the participant has demonstrated
a foundational understanding of safe driving principles and the legal obligations of a driver.`;
      const lines = description.split("\n");
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, 290 + i * 24);
      });

      // Footer
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("DRIVE ED. PLATFORM", canvas.width / 2, 520);
      ctx.font = "16px sans-serif";
      ctx.fillText("Founder", canvas.width / 2, 550);
    };
  };

  const downloadCertificate = () => {
    alert('Downloading Certificate...');
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `${certificateData.name}_certificate.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    alert('Downloaded');
    
  };
  const backInToHome = () =>{
    navigate("/"); 

  }

  return (
    <div className="flex flex-col items-center gap-6">
      <input
        type="text"
        value={name}
        
        placeholder="Enter recipient's name"
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-2 border rounded w-80 text-center"
      />

      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        className="border rounded shadow-lg"
      ></canvas>

      <div className="flex gap-4">
        <button
          onClick={generateCertificate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Generate Certificate
        </button>
        <button
          onClick={downloadCertificate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download PNG
        </button>
        <button onClick={backInToHome}
        className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back To Home
        </button>
      </div>
    </div>
  );
}

export default CertificateGenerator;
