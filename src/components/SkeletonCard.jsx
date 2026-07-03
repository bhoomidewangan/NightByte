function SkeletonCard() {
  return (
    <div className="animate-pulse bg-[#101a2e] border border-[#26324a] rounded-2xl overflow-hidden">
      <div className="w-full h-48 bg-[#1b2740]"></div>

      <div className="p-5">
        <div className="h-6 w-40 bg-[#1b2740] rounded"></div>

        <div className="h-4 w-full bg-[#1b2740] rounded mt-4"></div>

        <div className="h-4 w-3/4 bg-[#1b2740] rounded mt-2"></div>

        <div className="flex justify-between mt-8">
          <div className="h-6 w-20 bg-[#1b2740] rounded"></div>

          <div className="h-10 w-24 bg-[#1b2740] rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;