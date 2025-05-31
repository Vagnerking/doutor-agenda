"use client";

import { ColumnDef } from "@tanstack/react-table";

import { patientsTable } from "@/db/schema";

import PatientsTableActions from "./patients-table-actions";

export const patientsTableColumns: ColumnDef<
  typeof patientsTable.$inferSelect
>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "E-mail",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const phoneNumber = params.row.original.phoneNumber;
      return phoneNumber.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: (params) => {
      const patient = params.row.original;
      return patient.sex === "male" ? "Masculino" : "Feminino";
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const patient = params.row.original;
      return <PatientsTableActions patient={patient} />;
    },
  },
];
