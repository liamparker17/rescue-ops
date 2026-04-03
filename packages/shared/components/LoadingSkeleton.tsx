interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm border-l-4 border-l-slate-200">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="h-[220px] w-full" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-40 flex-1" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm border-l-4 border-l-slate-200">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-6 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table rows */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
