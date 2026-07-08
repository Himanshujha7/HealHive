const DoctorSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-300 rounded-full"></div>

        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSkeleton;