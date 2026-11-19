"use client";
import View from "../../../shared/components/AdminOverview";
import AdminGuard from "../../components/AdminGuard";
import AdminDataState from "../../components/AdminDataState";

export default function AdminOverviewAdapter() {
  return <View AdminGuard={AdminGuard} AdminDataState={AdminDataState} />;
}
