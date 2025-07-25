
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GitCompareArrows, CheckCircle2, XCircle, Users, BarChart3, FileUp } from "lucide-react";

// Mock Data
const mockSubmissions = [
  { student: "Alice Johnson", file: "project-v1.step", deviation: 2.1, flagged: false, timestamp: "2023-10-28 10:15 UTC" },
  { student: "Bob Williams", file: "design-final.step", deviation: 12.5, flagged: true, reason: "Matches Bob Williams' submission", timestamp: "2023-10-28 11:00 UTC" },
  { student: "Charlie Brown", file: "assembly-rev2.step", deviation: 4.8, flagged: false, timestamp: "2023-10-28 11:30 UTC" },
  { student: "Diana Prince", file: "bracket-design.step", deviation: 0.5, flagged: false, timestamp: "2023-10-28 12:05 UTC" },
  { student: "Ethan Hunt", file: "gear-v3.step", deviation: 11.9, flagged: true, reason: "High similarity to base model", timestamp: "2023-10-28 12:15 UTC" },
];


export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{mockSubmissions.length}</div>
                <p className="text-xs text-muted-foreground">+5 from last week</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Deviation</CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {(mockSubmissions.reduce((acc, s) => acc + s.deviation, 0) / mockSubmissions.length).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Compared to base model</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Plagiarism Flags</CardTitle>
                <XCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{mockSubmissions.filter(s => s.flagged).length}</div>
                 <p className="text-xs text-muted-foreground">Manual review suggested</p>
            </CardContent>
        </Card>
      </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GitCompareArrows/> Recent Submissions</CardTitle>
            <CardDescription>
              Overview of the latest student uploads and their analysis results.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Deviation</TableHead>
                        <TableHead>Plagiarism Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockSubmissions.map((sub, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{sub.student}</TableCell>
                            <TableCell>{sub.file}</TableCell>
                            <TableCell>{sub.deviation.toFixed(1)}%</TableCell>
                            <TableCell>
                                <Badge variant={sub.flagged ? "destructive" : "secondary"} className="flex items-center gap-1 w-fit">
                                     {sub.flagged ? <XCircle className="w-3 h-3"/> : <CheckCircle2 className="w-3 h-3"/>}
                                    {sub.flagged ? "Flagged" : "Clear"}
                                </Badge>
                            </TableCell>
                             <TableCell>{sub.timestamp}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
    </div>
  );
}
