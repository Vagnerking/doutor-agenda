"use client";

import { useEffect, useState } from "react";

import { doctorsTable } from "@/db/schema";

import DoctorCard from "./doctor-card";

interface DoctorsListProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export default function DoctorsList({ doctors }: DoctorsListProps) {
  const [doctorsList, setDoctorsList] = useState<
    (typeof doctorsTable.$inferSelect)[]
  >([]);

  useEffect(() => {
    setDoctorsList(doctors);
  }, [doctors]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {doctorsList.map((doctor) => (
        <DoctorCard key={doctor.id + Math.random()} doctor={doctor} />
      ))}
    </div>
  );
}
