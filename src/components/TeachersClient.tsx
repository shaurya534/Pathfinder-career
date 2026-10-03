"use client";

import { useEffect, useState } from "react";
import TeacherCard, { TeacherData } from "./TeacherCard";

const SUBJECTS = [
  "All",
  "DSA",
  "System Design",
  "DBMS",
  "Computer Networks",
  "Web Development",
  "Data Science",
  "AI/ML",
  "Operating Systems",
  "C++",
  "Communication Skills",
];

export default function TeachersClient() {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [subject, setSubject] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = subject === "All" ? "/api/teachers" : `/api/teachers?subject=${encodeURIComponent(subject)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setTeachers(data.teachers ?? []))
      .finally(() => setLoading(false));
  }, [subject]);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={`text-xs px-3 py-1.5 rounded-sm border ${
              subject === s ? "bg-ink text-white border-ink" : "border-line text-ink/60 hover:border-teal hover:text-teal"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Loading teachers...</p>
      ) : teachers.length === 0 ? (
        <p className="text-sm text-ink/50">
          No teachers found for this subject yet. Run <code className="bg-line px-1 rounded-sm">npm run db:seed</code> to load demo profiles.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {teachers.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      )}
    </div>
  );
}
