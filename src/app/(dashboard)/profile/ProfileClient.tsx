"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  UserCircle, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Save, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfileStore } from "@/store/useProfileStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { getCategoryById } from "@/lib/categories";


const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileClient() {
  const { data: session, update } = useSession();
  const { profiles } = useProfileStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
  });

  useEffect(() => {
    if (session?.user?.name) {
      form.reset({ name: session.user.name });
    }
  }, [session, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });
      
      if (!res.ok) throw new Error("Failed to update profile");
      
      await update({ name: data.name });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Could not update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (isTemplate = false) => {
    setIsExporting(!isTemplate);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Transactions");
      
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Type", key: "type", width: 15 },
        { header: "Category", key: "category", width: 25 },
        { header: "Profile", key: "profile", width: 25 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF7C3AED" }, // Primary accent color approx
      };

      if (!isTemplate) {
        transactions.forEach((t) => {
          const profile = profiles.find((p) => p.id === t.profileId);
          const categoryName = getCategoryById(t.category)?.label || t.category;
          
          worksheet.addRow({
            date: new Date(t.date).toISOString().split("T")[0],
            amount: t.amount,
            type: t.type,
            category: categoryName,
            profile: profile?.name || "Unknown",
          });
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = isTemplate 
        ? "transactions-template.xlsx" 
        : `transactions-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith(".xlsx")) {
      toast.error("Please upload a valid .xlsx file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFileToImport(file);
    setIsParsing(true);
    setParsedRows([]);

    try {
      const buffer = await file.arrayBuffer();
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error("No worksheet found");

      const rows: any[] = [];
      let isFirstRow = true;

      worksheet.eachRow((row, rowNumber) => {
        if (isFirstRow) {
          isFirstRow = false;
          return; // Skip header
        }

        const dateVal = row.getCell(1).value;
        const amountVal = row.getCell(2).value;
        const typeVal = row.getCell(3).value?.toString().toUpperCase();
        const categoryVal = row.getCell(4).value?.toString();
        const profileName = row.getCell(5).value?.toString();

        let error = null;
        let parsedDate = null;
        let parsedAmount = null;
        let matchedProfile = null;
        const mappedCategoryId = categoryVal; // Need to map this ideally, but fallback to value

        // Date validation
        if (!dateVal) error = "Missing Date";
        else {
          parsedDate = new Date(dateVal.toString());
          if (isNaN(parsedDate.getTime())) error = "Invalid Date";
        }

        // Amount validation
        if (!error) {
          parsedAmount = Number(amountVal);
          if (isNaN(parsedAmount) || parsedAmount <= 0) error = "Invalid Amount";
        }

        // Type validation
        if (!error && !["INCOME", "EXPENSE", "TRANSFER"].includes(typeVal || "")) {
          error = "Invalid Type";
        }

        // Profile validation
        if (!error) {
          matchedProfile = profiles.find((p) => p.name.toLowerCase() === profileName?.toLowerCase());
          if (!matchedProfile) error = "Profile not found";
        }

        rows.push({
          row: rowNumber,
          date: parsedDate,
          amount: parsedAmount,
          type: typeVal,
          category: mappedCategoryId,
          profileId: matchedProfile?.id,
          profileName,
          isValid: !error,
          error,
        });
      });

      setParsedRows(rows);
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse file");
      setFileToImport(null);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImportCommit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setIsImporting(true);
    try {
      const payload = validRows.map((r) => ({
        date: r.date.toISOString(),
        amount: r.amount,
        type: r.type,
        category: r.category,
        profileId: r.profileId,
        title: `Imported ${r.category}`,
      }));

      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: payload }),
      });

      if (!res.ok) throw new Error("Import failed");

      const result = await res.json();
      toast.success(`Successfully imported ${result.count} transactions`);
      setParsedRows([]);
      setFileToImport(null);
      await fetchTransactions(); // Refresh dashboard
    } catch (error) {
      console.error(error);
      toast.error("Failed to import transactions");
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <UserCircle className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 rounded-2xl shadow-sm border-white/[0.04] bg-surface-1">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{session?.user?.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Full Name
                  </label>
                  <Input 
                    {...form.register("name")} 
                    className="bg-surface-2 border-white/[0.04] focus-visible:ring-primary" 
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Email Address
                  </label>
                  <Input 
                    disabled 
                    value={session?.user?.email || ""} 
                    className="bg-surface-2/50 border-white/[0.04] text-muted-foreground cursor-not-allowed" 
                  />
                  <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSaving || !form.formState.isDirty} 
                  className="w-full font-semibold"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Column 2 & 3: Import/Export */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 rounded-2xl shadow-sm border-white/[0.04] bg-surface-1">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Data Management</CardTitle>
                <CardDescription>Export your transactions or import from an Excel file.</CardDescription>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-primary/40" />
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-6">
              
              {/* Export Actions */}
              <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-white/[0.04] bg-surface-2/50">
                <Button 
                  variant="default" 
                  className="flex-1 font-semibold"
                  onClick={() => handleExport(false)}
                  disabled={isExporting || transactions.length === 0}
                  title={transactions.length === 0 ? "No transactions to export" : ""}
                >
                  {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Export Transactions (.xlsx)
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 font-semibold border-white/[0.1] hover:bg-surface-2"
                  onClick={() => handleExport(true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="h-px bg-white/[0.04] w-full my-6" />

              {/* Import Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Import Transactions</h3>
                  {fileToImport && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setFileToImport(null); setParsedRows([]); }}
                      className="text-muted-foreground hover:text-foreground h-8"
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {!fileToImport ? (
                  <div 
                    className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-2/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground">Click to upload .xlsx file</p>
                    <p className="text-xs text-muted-foreground mt-1">Max file size: 5MB</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileUpload}
                    />
                  </div>
                ) : isParsing ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center border border-white/[0.04] rounded-xl bg-surface-2/50">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Parsing Excel file...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-surface-2/50">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{fileToImport.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {parsedRows.length} rows found • {validCount} valid
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleImportCommit} 
                        disabled={validCount === 0 || isImporting}
                        className="font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Import {validCount} Rows
                      </Button>
                    </div>

                    {/* Preview Table */}
                    <div className="border border-white/[0.04] rounded-xl overflow-hidden bg-surface-0">
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-muted-foreground bg-surface-2/50 sticky top-0 uppercase tracking-widest">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Row</th>
                              <th className="px-4 py-3 font-semibold">Status</th>
                              <th className="px-4 py-3 font-semibold">Date</th>
                              <th className="px-4 py-3 font-semibold">Amount</th>
                              <th className="px-4 py-3 font-semibold">Category</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {parsedRows.slice(0, 50).map((row, i) => (
                              <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                                <td className="px-4 py-2 font-mono text-muted-foreground">{row.row}</td>
                                <td className="px-4 py-2">
                                  {row.isValid ? (
                                    <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-destructive text-xs font-medium" title={row.error}>
                                      <AlertCircle className="w-3.5 h-3.5" /> {row.error}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-foreground truncate max-w-[100px]">
                                  {row.date ? row.date.toISOString().split("T")[0] : "-"}
                                </td>
                                <td className="px-4 py-2 text-foreground tabular-money">
                                  {row.amount || "-"}
                                </td>
                                <td className="px-4 py-2 text-muted-foreground truncate max-w-[120px]">
                                  {row.category || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedRows.length > 50 && (
                        <div className="p-2 text-center text-xs text-muted-foreground bg-surface-2/30 border-t border-white/[0.04]">
                          Showing first 50 rows only.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
