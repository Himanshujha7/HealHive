const DoctorSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden animate-pulse">
      <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Doctor Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-full bg-slate-200 flex-shrink-0" />

            <div className="flex-1 space-y-3">
              {/* Name */}
              <div className="h-5 w-40 rounded bg-slate-200" />
              {/* Specialty */}
              <div className="h-4 w-28 rounded bg-slate-200" />

              {/* Meta row */}
              <div className="flex flex-wrap gap-3">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-200" />
              </div>

              {/* Diseases */}
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 rounded-full bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
                <div className="h-6 w-14 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Fee & Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-4">
          <div className="space-y-2 sm:text-right">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-7 w-16 rounded bg-slate-200" />
          </div>
          <div className="h-11 w-32 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default DoctorSkeleton;
