import React, { useState } from "react";
import { 
  Search, 
  RotateCcw, 
  Calendar, 
  ArrowRight, 
  FileText,
  User,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from "lucide-react";

const ViewSession = () => {
  // Static state holding standard data structure
  const [sessions, setSessions] = useState([
    { id: "1", name: "Aung Aung", openingTime: "05-04-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "05-04-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "05-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "11-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "14-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "1-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "01-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "24-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "03-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "05-03-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "15-02-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "25-01-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "25-01-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "15-02-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "05-03-2026 07:59:01", closingTime: "2026-06-05 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "17-03-2026 08:00:01", closingTime: "2026-05-05 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "16-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "1", name: "Kyaw Kyaw", openingTime: "15-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "2", name: "Aung Aung", openingTime: "12-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "31-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "1", name: "Aung Aung", openingTime: "23-06-2026 07:59:01", closingTime: "05-06-2026 11:59:01", expectedCash: 150000, actualCash: 150000, discrepancy: 0, status: "Closed", reportNote: "-" },
    { id: "2", name: "Kyaw Kyaw", openingTime: "04-05-2026 08:00:01", closingTime: "05-05-2026 12:03:05", expectedCash: 100000, actualCash: 98000, discrepancy: -2000, status: "Closed", reportNote: "2,000 kyats needed" },
    { id: "3", name: "Aye Aye", openingTime: "03-7-2026 12:58:01", closingTime: "-", expectedCash: 50000, actualCash: null, discrepancy: null, status: "Running", reportNote: "-" }
  ]);

  // Input controller states
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8; // 

  // Date parser helper to handle multiple formats (YYYY-MM-DD and DD-MM-YYYY)
  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === "-") return new Date(0);
    const datePart = dateTimeStr.split(" ")[0];
    if (datePart.includes("-") && datePart.split("-")[0].length === 2) {
      const [day, month, year] = datePart.split("-");
      const timePart = dateTimeStr.split(" ")[1] || "00:00:00";
      return new Date(`${year}-${month}-${day}T${timePart}`);
    }
    return new Date(dateTimeStr.replace(" ", "T"));
  };

  const handleReset = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // Filter handlers
  const filteredSessions = sessions.filter((session) => {
    const matchesName = session.name.toLowerCase().includes(searchTerm.toLowerCase());
    const parsedDateObj = parseDateTime(session.openingTime);
    const sessionDateStr = `${parsedDateObj.getFullYear()}-${String(parsedDateObj.getMonth() + 1).padStart(2, "0")}-${String(parsedDateObj.getDate()).padStart(2, "0")}`;
    
    let matchesDate = true;
    if (fromDate && toDate) {
      matchesDate = sessionDateStr >= fromDate && sessionDateStr <= toDate;
    } else if (fromDate) {
      matchesDate = sessionDateStr >= fromDate;
    } else if (toDate) {
      matchesDate = sessionDateStr <= toDate;
    }

    return matchesName && matchesDate;
  });

  // Dynamic Sort Handler
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.status === "Running" && b.status !== "Running") return -1;
    if (a.status !== "Running" && b.status === "Running") return 1;
    return parseDateTime(b.openingTime) - parseDateTime(a.openingTime);
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedSessions.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedSessions.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="px-6 pt-2 pb-6 bg-gray-50 min-h-screen space-y-4">
   
      {/* Control Panel */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cashier by name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#07a876] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">From</span>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm outline-none font-medium text-gray-700 cursor-pointer" 
            />
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">To</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm outline-none font-medium text-gray-700 cursor-pointer" 
            />
          </div>

          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium text-sm rounded-xl shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Table Wrapper */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Horizontal table scroll bar hidden or customized */}
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse min-w-[1000px] table-auto">
            <thead>
              <tr className="bg-[#08694b] text-white text-xs uppercase font-bold tracking-wider select-none">
                <th className="py-4 px-5 w-20">ID</th>
                <th className="py-4 px-5">Staff Member</th>
                <th className="py-4 px-5">Opening Time</th>
                <th className="py-4 px-5">Closing Time</th>
                <th className="py-4 px-5 text-right">Expected Cash</th>
                <th className="py-4 px-5 text-right">Actual Cash</th>
                <th className="py-4 px-5 text-center">Discrepancy</th>
                <th className="py-4 px-5 max-w-xs">Report / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
              {currentRows.length > 0 ? (
                currentRows.map((session, idx) => (
                  <tr 
                    key={`${session.id}-${idx}`} 
                    /* FIX: Added relative, emerald green border ring effect, background opacity and rounded card layout on hover */
                    className="hover:bg-emerald-100/60 hover:ring-2 hover:ring-emerald-100 transition-all duration-200 group relative [&_td]:first:"
                  >
                    {/* Table Item Index Number */}
                    <td className="py-4 px-5 font-semibold text-gray-400 pl-6">
                      {indexOfFirstRow + idx + 1}.
                    </td>
                    
                    {/* Staff Member */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-[#08694b]">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-900 whitespace-nowrap">{session.name}</span>
                      </div>
                    </td>

                    {/* Opening Time */}
                    <td className="py-4 px-5 text-gray-500 font-mono text-xs whitespace-nowrap">
                      {session.openingTime}
                    </td>

                    {/* Closing Time */}
                    <td className="py-4 px-5 font-mono text-xs whitespace-nowrap">
                      {session.status === "Running" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-sans font-bold uppercase tracking-wide text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Running
                        </span>
                      ) : (
                        <span className="text-gray-500">{session.closingTime}</span>
                      )}
                    </td>

                    {/* Expected Cash */}
                    <td className="py-4 px-5 text-right text-gray-900 font-mono whitespace-nowrap">
                      {session.expectedCash.toLocaleString()} Ks
                    </td>

                    {/* Actual Cash */}
                    <td className="py-4 px-5 text-right text-gray-900 font-mono whitespace-nowrap">
                      {session.actualCash !== null ? (
                        `${session.actualCash.toLocaleString()} Ks`
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    {/* Discrepancy */}
                    <td className="py-4 px-5 text-center font-bold font-mono whitespace-nowrap">
                      {session.discrepancy === null ? (
                        <span className="text-gray-300">-</span>
                      ) : session.discrepancy === 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">0</span>
                      ) : (
                        <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-lg text-xs">
                          {session.discrepancy.toLocaleString()} Ks
                        </span>
                      )}
                    </td>

                    {/* Report / Notes */}
                    <td className="py-4 px-5 max-w-xs text-xs text-gray-500 pr-6">
                      <div className="flex items-center gap-1.5">
                        {session.reportNote !== "-" && <FileText className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                        <span className="truncate block max-w-[180px]" title={session.reportNote}>
                          {session.reportNote}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                    No active or historical cash register sessions match the specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Design matched */}        
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-semibold select-none">
          <span>
            Showing {sortedSessions.length > 0 ? indexOfFirstRow + 1 : 0} - {Math.min(indexOfLastRow, sortedSessions.length)} of {sortedSessions.length} records
          </span>
          
          {/* Pagination Control Row */}
          <div className="flex items-center gap-1 max-w-full">
            {/* First & Previous Buttons */}
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* SCROLLABLE PAGE NUMBERS CONTAINER */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] sm:max-w-[240px] py-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center border transition-all flex-shrink-0 ${
                    currentPage === page 
                      ? "bg-[#08694b] border-[#08694b] text-white shadow-sm" 
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next & Last Buttons */}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ViewSession;