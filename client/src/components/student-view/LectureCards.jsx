const LectureCard = ({ lecture }) => {

    function convertVideoUrlToImageUrl(videoUrl) {
        if (!videoUrl.endsWith(".mp4")) return videoUrl; // Return original if not mp4
      
        return videoUrl.replace("/video/upload/", "/video/upload/so_1/").replace(".mp4", ".jpg");
      }

    return (
      <div className="rounded-xl shadow-md overflow-hidden bg-white flex flex-col h-full">
        <img
          src={convertVideoUrlToImageUrl(lecture?.videoUrl)}
          alt={lecture.title}
          className="w-full h-40 object-cover"
        />
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold">{lecture.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{lecture.description}</p>
          </div>
          <span
            className={`mt-4 inline-block px-2 py-1 text-sm font-medium rounded-full ${
              lecture.watched
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {lecture.watched ? "Watched" : "Unwatched"}
          </span>
        </div>
      </div>
    );
  };
  export default LectureCard;
