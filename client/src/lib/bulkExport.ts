interface PressRelease {
  id: number;
  title: string;
  content: string;
  status: string;
  createdAt: Date;
}

export const exportPressReleasesToCSV = (pressReleases: PressRelease[]) => {
  const headers = ["ID", "Title", "Status", "Created Date", "Content Preview"];
  const rows = pressReleases.map(pr => [
    pr.id.toString(),
    `"${pr.title.replace(/"/g, '""')}"`,
    pr.status,
    new Date(pr.createdAt).toLocaleDateString(),
    `"${pr.content.substring(0, 100).replace(/"/g, '""')}..."`,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `press-releases-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPressReleasesToJSON = (pressReleases: PressRelease[]) => {
  const jsonContent = JSON.stringify(pressReleases, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `press-releases-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
