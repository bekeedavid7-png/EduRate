import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { ArrowRight, Star, BarChart3, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Platform is Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            Elevate education with <br className="hidden md:block" />
            <span className="text-gradient">transparent feedback</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            EDURATE bridges the gap between students and lecturers. Provide meaningful course evaluations that drive academic excellence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isLoading && user ? (
              <Link 
                href={user.role === 'student' ? '/student' : '/lecturer'}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 cursor-pointer"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
        >
          <FeatureCard 
            icon={<Star className="w-6 h-6 text-amber-500" />}
            title="Honest Reviews"
            description="Students can rate clarity, engagement, and overall performance."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-primary" />}
            title="Actionable Analytics"
            description="Lecturers get detailed dashboards to understand their impact."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
            title="Secure & Private"
            description="Evaluations are securely tied to courses ensuring data integrity."
          />
        </motion.div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-glass p-8 rounded-3xl shadow-soft hover:shadow-lg transition-all duration-300 border border-slate-100 hover:-translate-y-1 text-left">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
