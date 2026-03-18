import { useLocationContext } from "@/context/location-context";
import { useClassrooms } from "@/hooks/use-classrooms";
import { useStaff } from "@/hooks/use-staff";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, Baby, Moon, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { locationId } = useLocationContext();
  const { data: classrooms, isLoading: loadingRooms } = useClassrooms(locationId);
  const { data: staff, isLoading: loadingStaff } = useStaff(locationId);

  if (!locationId) return <div className="text-muted-foreground">Select a location to view the board.</div>;

  const totalKids = classrooms?.reduce((sum, c) => sum + c.currentKids, 0) || 0;
  const activeStaff = staff?.filter(s => s.role === 'CLASSROOM').length || 0;
  const availableBreakers = staff?.filter(s => s.role === 'BREAKER').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Staffing Board</h1>
        <p className="text-muted-foreground mt-1">Live ratio status and classroom assignments.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Baby className="w-5 h-5 text-blue-400" />} title="Total Children" value={totalKids} />
        <StatCard icon={<Users className="w-5 h-5 text-emerald-400" />} title="Classroom Staff" value={activeStaff} />
        <StatCard icon={<ShieldCheck className="w-5 h-5 text-purple-400" />} title="Available Breakers" value={availableBreakers} />
        <StatCard 
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} 
          title="Fragile Rooms" 
          value={classrooms?.filter(c => c.ratioStatus === 'FRAGILE').length || 0} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classroom Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            Classrooms
          </h2>
          
          {loadingRooms ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-40 bg-card rounded-xl animate-pulse border border-border" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classrooms?.map((room, idx) => (
                <motion.div 
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:border-primary/30 transition-colors"
                >
                  <div className="absolute top-0 left-0 w-1 h-full" 
                    style={{ backgroundColor: room.ratioStatus === 'GREEN' ? '#10b981' : room.ratioStatus === 'FRAGILE' ? '#f59e0b' : '#f43f5e' }}
                  />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{room.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={room.ratioStatus} />
                        {room.napWindowActive && (
                          <span className="inline-flex items-center gap-1 text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            <Moon className="w-3 h-3" /> Nap
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Baby className="w-4 h-4" /> Children
                      </div>
                      <div className="text-2xl font-mono text-foreground">{room.currentKids}</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Users className="w-4 h-4" /> Staff
                      </div>
                      <div className="text-2xl font-mono text-foreground">{room.staffCount}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Legend */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <div className="w-2 h-6 bg-secondary-foreground rounded-full"></div>
            Staff on Duty
          </h2>
          <div className="glass-panel rounded-xl p-0 overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto p-4 space-y-2">
              {loadingStaff ? (
                 <div className="space-y-3">
                   {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />)}
                 </div>
              ) : (
                staff?.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/30 hover:bg-white/5 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-foreground">{s.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.role === 'BREAKER' ? 'Coverage / Breaker' : s.classroom?.name || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {s.role === 'BREAKER' && <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">BREAKER</span>}
                      {s.noBreaks && <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">NO BREAK</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) {
  return (
    <div className="glass-panel rounded-xl p-5 border border-border/50 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}
