const VideoCarousel = () => {
  return (
    <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] lg:h-[550px] overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/videos/drive1.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

export default VideoCarousel;
