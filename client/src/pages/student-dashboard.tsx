import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useLecturers } from "@/hooks/use-lecturers";
import { useEvaluations } from "@/hooks/use-evaluations";
import { useCourses } from "@/hooks/use-courses";
import { StarRating } from "@/components/ui/star-rating";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Book, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: lecturers, isLoading: isLoadingLecturers } = useLecturers();
  const { data: evaluations, isLoading: isLoadingEvals } = useEvaluations();
  const { data: courses, isLoading: isLoadingCourses } = useCourses();

  const [filterDept, setFilterDept] = useState<string>("all");

  if (isAuthLoading) return <LoadingDashboard />;
  if (!user || user.role !== 'student') {
    setLocation('/login');
    return null;
  }

  const isLoading = isLoadingLecturers || isLoadingEvals || isLoadingCourses;

  const departments = useMemo(() => {
    if (!courses) return [];
    return Array.from(new Set(courses.map(c => c.department))).sort();
  }, [courses]);

  const { pending, completed } = useMemo(() => {
    if (!lecturers || !evaluations) return { pending: [], completed: [] };

    let filteredLecturers = lecturers;
    if (filterDept !== "all") {
      filteredLecturers = lecturers.filter(l => l.department === filterDept);
    }

    const pendingList = filteredLecturers.filter(
      l => !evaluations.some(e => e.lecturerId === l.id && e.studentId === user.id)
    );

    // Completed needs to join with lecturer and course info
    const completedList = evaluations
      .filter(e => e.studentId === user.id)
      .map(e => {
        const lecturer = lecturers.find(l => l.id === e.lecturerId);
        return {
          ...e,
          lecturerName: lecturer?.name || "Unknown Lecturer",
          courseCode: lecturer?.courseCode || "Unknown Course",
          courseName: lecturer?.courseName || "",
          department: lecturer?.department || ""
        };
      })
      .filter(e => filterDept === "all" || e.department === filterDept);

    return { pending: pendingList, completed: completedList };
  }, [lecturers, evaluations, filterDept, user.id]);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your course evaluations</p>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="bg-white border-slate-200 shadow-sm rounded-xl">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingDashboard />
      ) : (
        <div className="space-y-12">
          {/* PENDING SECTION */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-slate-800">Pending Evaluations ({pending.length})</h2>
            </div>
            
            {pending.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-700">All caught up!</h3>
                <p className="text-slate-500">You have no pending evaluations for this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pending.map(lecturer => (
                  <div key={lecturer.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="mb-4 flex-1">
                      <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tracking-wide mb-3">
                        {lecturer.department}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{lecturer.courseCode}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-4">{lecturer.courseName}</p>
                      
                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{lecturer.name}</span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/evaluate/${lecturer.id}/${lecturer.courseId}`}
                      className="w-full block text-center py-3 rounded-xl font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      Start Evaluation
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* COMPLETED SECTION */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-semibold text-slate-800">Completed ({completed.length})</h2>
            </div>
            
            {completed.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                You haven't completed any evaluations yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completed.map(evalData => (
                  <div key={evalData.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-md font-bold text-slate-900">{evalData.courseCode}</h3>
                        <p className="text-sm text-slate-600">{evalData.lecturerName}</p>
                      </div>
                      <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <span className="text-amber-500 text-lg">★</span> {evalData.overallRating}/5
                        </div>
                      </div>
                    </div>
                    
                    {evalData.comments && (
                      <p className="text-sm text-slate-500 italic border-l-2 border-slate-300 pl-3 mt-4 line-clamp-2">
                        "{evalData.comments}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}

function LoadingDashboard() {
  return (
    <Layout>
      <div className="animate-pulse space-y-8">
        <div className="h-10 bg-slate-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
