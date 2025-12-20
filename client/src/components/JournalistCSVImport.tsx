import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CSVRow {
  [key: string]: string;
}

interface ParsedJournalist {
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  publication?: string;
  beat?: string;
  phone?: string;
  twitter?: string;
  linkedin?: string;
  notes?: string;
  status: "valid" | "duplicate" | "invalid";
  errors: string[];
}

interface JournalistCSVImportProps {
  onImportComplete?: () => void;
}

export function JournalistCSVImport({ onImportComplete }: JournalistCSVImportProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [parsedJournalists, setParsedJournalists] = useState<ParsedJournalist[]>([]);
  const [step, setStep] = useState<"upload" | "map" | "preview" | "importing" | "complete">(
    "upload"
  );
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createJournalistMutation = trpc.journalists.create.useMutation();
  const existingJournalistsQuery = trpc.journalists.list.useQuery();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        toast.error("CSV file is empty");
        return;
      }

      // Parse headers
      const headerLine = lines[0];
      const parsedHeaders = headerLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      setHeaders(parsedHeaders);

      // Parse data rows
      const rows: CSVRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: CSVRow = {};
        parsedHeaders.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        rows.push(row);
      }

      setCSVData(rows);
      setStep("map");
      toast.success(`Loaded ${rows.length} rows from CSV`);
    };

    reader.onerror = () => {
      toast.error("Failed to read CSV file");
    };

    reader.readAsText(file);
  };

  const handleFieldMappingComplete = () => {
    if ((!fieldMapping.firstName && !fieldMapping.name) || !fieldMapping.email) {
      toast.error("Please map at least First Name (or Name) and Email fields");
      return;
    }

    // Parse and validate journalists
    const existingEmails = new Set(
      existingJournalistsQuery.data?.map((j: { email: string }) => j.email.toLowerCase()) || []
    );

    const journalists: ParsedJournalist[] = csvData.map((row) => {
      // Handle name field - split if single name field, or use firstName/lastName
      let firstName = "";
      let lastName = "";
      
      if (fieldMapping.firstName && fieldMapping.lastName) {
        firstName = row[fieldMapping.firstName] || "";
        lastName = row[fieldMapping.lastName] || "";
      } else if (fieldMapping.name) {
        const nameParts = (row[fieldMapping.name] || "").trim().split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";
      }

      const journalist: ParsedJournalist = {
        firstName,
        lastName,
        email: row[fieldMapping.email] || "",
        title: fieldMapping.title ? row[fieldMapping.title] : undefined,
        publication: fieldMapping.publication ? row[fieldMapping.publication] : undefined,
        beat: fieldMapping.beat ? row[fieldMapping.beat] : undefined,
        phone: fieldMapping.phone ? row[fieldMapping.phone] : undefined,
        twitter: fieldMapping.twitter ? row[fieldMapping.twitter] : undefined,
        linkedin: fieldMapping.linkedin ? row[fieldMapping.linkedin] : undefined,
        notes: fieldMapping.notes ? row[fieldMapping.notes] : undefined,
        status: "valid",
        errors: [],
      };

      // Validation
      if (!journalist.firstName || journalist.firstName.length < 1) {
        journalist.status = "invalid";
        journalist.errors.push("First name is required");
      }
      if (!journalist.lastName || journalist.lastName.length < 1) {
        journalist.status = "invalid";
        journalist.errors.push("Last name is required");
      }

      if (!journalist.email || !journalist.email.includes("@")) {
        journalist.status = "invalid";
        journalist.errors.push("Valid email is required");
      } else if (existingEmails.has(journalist.email.toLowerCase())) {
        journalist.status = "duplicate";
        journalist.errors.push("Email already exists in database");
      }

      return journalist;
    });

    setParsedJournalists(journalists);
    setStep("preview");
  };

  const handleImport = async () => {
    const validJournalists = parsedJournalists.filter((j) => j.status === "valid");

    if (validJournalists.length === 0) {
      toast.error("No valid journalists to import");
      return;
    }

    setStep("importing");
    setImportProgress(0);

    let imported = 0;
    let failed = 0;

    for (let i = 0; i < validJournalists.length; i++) {
      const journalist = validJournalists[i];
      try {
        await createJournalistMutation.mutateAsync({
          firstName: journalist.firstName,
          lastName: journalist.lastName,
          email: journalist.email,
          title: journalist.title,
          phone: journalist.phone,
          twitter: journalist.twitter,
          linkedin: journalist.linkedin,
          notes: journalist.notes,
        });
        imported++;
      } catch (error) {
        failed++;
        console.error("Failed to import journalist:", journalist.email, error);
      }

      setImportProgress(Math.round(((i + 1) / validJournalists.length) * 100));
    }

    setStep("complete");
    toast.success(`Successfully imported ${imported} journalists${failed > 0 ? `, ${failed} failed` : ""}`);
    
    if (onImportComplete) {
      onImportComplete();
    }
  };

  const handleReset = () => {
    setFile(null);
    setCSVData([]);
    setHeaders([]);
    setFieldMapping({});
    setParsedJournalists([]);
    setStep("upload");
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    setOpen(false);
  };

  const downloadSampleCSV = () => {
    const sampleData = `Name,Email,Publication,Beat,Phone,Twitter,LinkedIn,Notes
John Smith,john.smith@techcrunch.com,TechCrunch,Technology,+1-555-0123,@johnsmith,linkedin.com/in/johnsmith,Covers AI and startups
Jane Doe,jane.doe@forbes.com,Forbes,Business,+1-555-0124,@janedoe,linkedin.com/in/janedoe,Focus on fintech
Bob Johnson,bob@wired.com,Wired,Science,+1-555-0125,@bobjohnson,linkedin.com/in/bobjohnson,Writes about biotech`;

    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "journalist-import-sample.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sample CSV downloaded");
  };

  const validCount = parsedJournalists.filter((j) => j.status === "valid").length;
  const duplicateCount = parsedJournalists.filter((j) => j.status === "duplicate").length;
  const invalidCount = parsedJournalists.filter((j) => j.status === "invalid").length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Journalists from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import journalists into your database
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a CSV file containing journalist information
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="max-w-xs mx-auto"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={downloadSampleCSV}>
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <strong>Required fields:</strong> Name, Email
                  </li>
                  <li>
                    <strong>Optional fields:</strong> Publication, Beat, Phone, Twitter, LinkedIn,
                    Notes
                  </li>
                  <li>First row should contain column headers</li>
                  <li>Email addresses must be unique</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Field Mapping */}
        {step === "map" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>
                Loaded {csvData.length} rows from <strong>{file?.name}</strong>
              </span>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-semibold">Map CSV columns to journalist fields:</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="map-firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fieldMapping.firstName}
                      onValueChange={(value) => setFieldMapping({ ...fieldMapping, firstName: value })}
                    >
                      <SelectTrigger id="map-firstName">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Or use a single Name field below
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="map-lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fieldMapping.lastName}
                      onValueChange={(value) => setFieldMapping({ ...fieldMapping, lastName: value })}
                    >
                      <SelectTrigger id="map-lastName">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="map-name">
                      Full Name (Alternative)
                    </Label>
                    <Select
                      value={fieldMapping.name}
                      onValueChange={(value) => setFieldMapping({ ...fieldMapping, name: value })}
                    >
                      <SelectTrigger id="map-name">
                        <SelectValue placeholder="Select column (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Skip this field</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Will be split into first/last name
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="map-email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fieldMapping.email}
                      onValueChange={(value) => setFieldMapping({ ...fieldMapping, email: value })}
                    >
                      <SelectTrigger id="map-email">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="map-publication">Publication</Label>
                    <Select
                      value={fieldMapping.publication}
                      onValueChange={(value) =>
                        setFieldMapping({ ...fieldMapping, publication: value })
                      }
                    >
                      <SelectTrigger id="map-publication">
                        <SelectValue placeholder="Select column (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Skip this field</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="map-beat">Beat</Label>
                    <Select
                      value={fieldMapping.beat}
                      onValueChange={(value) => setFieldMapping({ ...fieldMapping, beat: value })}
                    >
                      <SelectTrigger id="map-beat">
                        <SelectValue placeholder="Select column (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Skip this field</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="map-phone">Phone</Label>
                    <Select
                      value={fieldMapping.phone}
                      onValueChange={(value) => setFieldMapping({ ...fieldMapping, phone: value })}
                    >
                      <SelectTrigger id="map-phone">
                        <SelectValue placeholder="Select column (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Skip this field</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="map-twitter">Twitter</Label>
                    <Select
                      value={fieldMapping.twitter}
                      onValueChange={(value) =>
                        setFieldMapping({ ...fieldMapping, twitter: value })
                      }
                    >
                      <SelectTrigger id="map-twitter">
                        <SelectValue placeholder="Select column (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Skip this field</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button onClick={handleFieldMappingComplete}>Continue to Preview</Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {validCount} Valid
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {duplicateCount} Duplicates
                </Badge>
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="w-3 h-3" />
                  {invalidCount} Invalid
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Publication</th>
                    <th className="text-left p-2">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedJournalists.map((journalist, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        {journalist.status === "valid" && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {journalist.status === "duplicate" && (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                        {journalist.status === "invalid" && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </td>
                      <td className="p-2">{journalist.firstName} {journalist.lastName}</td>
                      <td className="p-2">{journalist.email}</td>
                      <td className="p-2">{journalist.publication || "-"}</td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {journalist.errors.join(", ") || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("map")}>
                Back to Mapping
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} Journalist{validCount !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === "importing" && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Importing Journalists...</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please wait while we import your journalists
              </p>
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">{importProgress}% complete</p>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === "complete" && (
          <div className="space-y-4 py-8 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
            <h3 className="font-semibold text-lg">Import Complete!</h3>
            <p className="text-sm text-muted-foreground">
              Successfully imported {validCount} journalist{validCount !== 1 ? "s" : ""} into your
              database.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={handleReset}>
                Import Another File
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
