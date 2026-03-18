import { useState } from "react";
import { useLocationContext } from "@/context/location-context";
import { useImportAttendance } from "@/hooks/use-attendance";
import { ClipboardPaste, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AttendanceImport() {
  const { locationId } = useLocationContext();
  const [rawText, setRawText] = useState("");
  const { mutate: importAttendance, isPending, data: result } = useImportAttendance();
  const { toast } = useToast();

  const handleImport = () => {
    if (!locationId) return;
    importAttendance(
      { locationId, rawText },
      {
        onSuccess: () => {
          toast({ title: "Import Successful", description: "Attendance snapshot has been created." });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Import Failed", description: err.message });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tadpoles Import</h1>
        <p className="text-muted-foreground mt-1">Paste raw attendance data to create a new live snapshot.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-6">
            <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-primary" />
              Paste Tadpoles Clipboard Text
            </label>
            <textarea 
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full h-96 bg-background border border-border rounded-lg p-4 font-mono text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Paste here..."
            />
            <button
              onClick={handleImport}
              disabled={isPending || !rawText || !locationId}
              className="mt-4 w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Process Import"}
            </button>
          </div>
        </div>

        <div>
          {result && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="glass-panel rounded-xl p-6 border-emerald-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-foreground">Import Results</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-sm text-muted-foreground">Snapshot ID</p>
                    <p className="font-mono text-xs text-foreground mt-1 truncate">{result.snapshotId}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-sm text-muted-foreground">Entries Parsed</p>
                    <p className="font-mono text-xl text-foreground mt-1">{result.entriesCount}</p>
                  </div>
                </div>

                {result.warnings.length > 0 && (
                  <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" /> Warnings ({result.warnings.length})
                    </h3>
                    <ul className="text-xs text-amber-200/80 space-y-1 list-disc pl-4">
                      {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Staff Name</th>
                        <th className="px-4 py-3">Classroom</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {result.entries.slice(0, 10).map((entry, i) => (
                        <tr key={i} className="bg-background/50 hover:bg-white/5">
                          <td className="px-4 py-3 font-medium text-foreground">{entry.staffName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{entry.classroom}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-zinc-800 text-zinc-300">
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.entries.length > 10 && (
                    <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20 border-t border-border/50">
                      + {result.entries.length - 10} more entries
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
