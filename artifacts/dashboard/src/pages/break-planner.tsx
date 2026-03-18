import { useState } from "react";
import { useLocationContext } from "@/context/location-context";
import { useBreakPlans, useBreakAssignments, useProposeBreakPlan, useUpdateAssignment } from "@/hooks/use-breaks";
import { StatusBadge } from "@/components/ui/status-badge";
import { CalendarClock, Download, Wand2, Clock, Check, SkipForward, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BreakPlanner() {
  const { locationId } = useLocationContext();
  const { data: plans, isLoading: loadingPlans } = useBreakPlans(locationId);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Auto-select latest plan
  if (!selectedPlanId && plans && plans.length > 0) {
    setSelectedPlanId(plans[0].id);
  }

  const { data: assignments, isLoading: loadingAssignments } = useBreakAssignments(selectedPlanId);
  const { mutate: proposePlan, isPending: isProposing } = useProposeBreakPlan();
  const { mutate: updateAssignment } = useUpdateAssignment();
  const { toast } = useToast();

  const handlePropose = () => {
    if (!locationId) return;
    proposePlan(
      { locationId },
      {
        onSuccess: (res) => {
          setSelectedPlanId(res.breakPlanId);
          toast({ title: "Plan Proposed", description: `Scheduled ${res.assignmentsCount} breaks.` });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Failed to propose", description: err.message });
        }
      }
    );
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateAssignment({ id, status });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Break Planner</h1>
          <p className="text-muted-foreground mt-1">Review and manage daily break schedules and coverage.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handlePropose}
            disabled={isProposing || !locationId}
            className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {isProposing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Auto-Propose Plan
          </button>
          
          {selectedPlanId && (
            <a
              href={`/api/exports/break-plan/${selectedPlanId}?format=csv`}
              download
              className="px-4 py-2 bg-card border border-border hover:bg-white/5 text-foreground rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              Export CSV
            </a>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Plan History */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Plans</h2>
          <div className="space-y-2">
            {loadingPlans ? (
              <div className="animate-pulse space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-card rounded-lg border border-border" />)}
              </div>
            ) : plans?.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 bg-card rounded-lg border border-border text-center">
                No plans found for this location.
              </div>
            ) : (
              plans?.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedPlanId === plan.id 
                      ? "bg-primary/10 border-primary/30 shadow-md shadow-primary/5" 
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-foreground">
                      {new Date(plan.planDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <StatusBadge status={plan.status} className="text-[10px]" />
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" /> {plan._count.assignments} Assignments
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Area - Assignments Table */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-xl overflow-hidden border border-border/50">
            {!selectedPlanId ? (
              <div className="p-12 text-center text-muted-foreground">
                <CalendarClock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Select a break plan or generate a new one.</p>
              </div>
            ) : loadingAssignments ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Time</th>
                      <th className="px-6 py-4 font-semibold">Staff Member</th>
                      <th className="px-6 py-4 font-semibold">Classroom</th>
                      <th className="px-6 py-4 font-semibold">Covered By</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {assignments?.map((assignment) => (
                      <tr key={assignment.id} className="bg-background/40 hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-mono text-foreground font-medium">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {assignment.breakStart} - {assignment.breakEnd}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {assignment.staff.displayName}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {assignment.classroom.name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {assignment.coverageAssignment?.breaker?.displayName ? (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs">
                              {assignment.coverageAssignment.breaker.displayName}
                            </span>
                          ) : (
                            <span className="text-zinc-500 italic">Uncovered</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={assignment.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {assignment.status !== 'COMPLETED' && (
                              <button 
                                onClick={() => handleUpdateStatus(assignment.id, 'COMPLETED')}
                                className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                title="Mark Completed"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {assignment.status !== 'SKIPPED' && (
                              <button 
                                onClick={() => handleUpdateStatus(assignment.id, 'SKIPPED')}
                                className="p-1.5 rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                                title="Skip Break"
                              >
                                <SkipForward className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {assignments?.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          No assignments generated for this plan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
