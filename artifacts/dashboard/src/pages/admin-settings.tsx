import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocationContext } from "@/context/location-context";
import { useAdminStatus, useRuleConfig, useUpdateRuleConfig } from "@/hooks/use-admin";
import { Settings, Save, Server, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const configSchema = z.object({
  breakCutoffTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  defaultBreakMins: z.coerce.number().min(15).max(120),
  minBreakGapMins: z.coerce.number().min(0).max(120),
  maxBreaksPerStaff: z.coerce.number().min(1).max(3),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export default function AdminSettings() {
  const { locationId } = useLocationContext();
  const { data: status } = useAdminStatus();
  const { data: config, isLoading: loadingConfig } = useRuleConfig(locationId);
  const { mutate: updateConfig, isPending } = useUpdateRuleConfig();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
  });

  useEffect(() => {
    if (config) reset(config);
  }, [config, reset]);

  const onSubmit = (data: ConfigFormValues) => {
    if (!locationId) return;
    updateConfig(
      { ...data, locationId },
      {
        onSuccess: () => toast({ title: "Settings Saved", description: "Rule engine configuration updated." }),
        onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">System configuration and rules engine parameters.</p>
      </header>

      {/* Platform Stats */}
      <div className="glass-panel rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-primary" /> System Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="text-sm text-muted-foreground">Organizations</div>
            <div className="text-2xl font-mono text-foreground mt-1">{status?.organizations || 0}</div>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="text-sm text-muted-foreground">Locations</div>
            <div className="text-2xl font-mono text-foreground mt-1">{status?.locations || 0}</div>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="text-sm text-muted-foreground">Classrooms</div>
            <div className="text-2xl font-mono text-foreground mt-1">{status?.classrooms || 0}</div>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="text-sm text-muted-foreground">Active Staff</div>
            <div className="text-2xl font-mono text-foreground mt-1">{status?.activeStaff || 0}</div>
          </div>
        </div>
      </div>

      {/* Location Rules Form */}
      <div className="glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-primary" /> Location Break Rules
        </h2>
        
        {loadingConfig ? (
           <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Break Cutoff Time (HH:MM)</label>
                <input 
                  {...register("breakCutoffTime")} 
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                  placeholder="15:00"
                />
                {errors.breakCutoffTime && <p className="text-red-400 text-xs">{errors.breakCutoffTime.message}</p>}
                <p className="text-xs text-muted-foreground">No breaks scheduled after this local time.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Default Break Duration (Mins)</label>
                <input 
                  type="number"
                  {...register("defaultBreakMins")} 
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                />
                {errors.defaultBreakMins && <p className="text-red-400 text-xs">{errors.defaultBreakMins.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Min Gap Between Breaks (Mins)</label>
                <input 
                  type="number"
                  {...register("minBreakGapMins")} 
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                />
                {errors.minBreakGapMins && <p className="text-red-400 text-xs">{errors.minBreakGapMins.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Breaks Per Staff</label>
                <input 
                  type="number"
                  {...register("maxBreaksPerStaff")} 
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                />
                {errors.maxBreaksPerStaff && <p className="text-red-400 text-xs">{errors.maxBreaksPerStaff.message}</p>}
              </div>

            </div>

            <div className="pt-4 border-t border-border/50 flex justify-end">
              <button 
                type="submit"
                disabled={isPending || !locationId}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Configuration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
